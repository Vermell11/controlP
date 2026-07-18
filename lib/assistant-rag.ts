export interface KnowledgeChunk {
  content: string;
  id: string;
  kind: "canonical" | "derived";
  label: string;
}

export interface SemanticDraft {
  answer: string;
  citations: string[];
}

const STOP_WORDS = new Set([
  "como", "cual", "dime", "donde", "el", "en", "es", "esta", "la", "las",
  "lo", "los", "me", "para", "por", "que", "quiero", "sobre", "un", "una", "y",
]);

export function retrieveKnowledge(
  query: string,
  chunks: KnowledgeChunk[],
  limit = 3,
): KnowledgeChunk[] {
  const compactQuery = compact(query);
  const projectMemory = chunks.find((chunk) =>
    /^memory:(?!skill-bank)/.test(chunk.id) && compactQuery.includes(compact(chunk.label.split("·")[0])),
  );
  const projectSlug = projectMemory?.id.slice("memory:".length);
  const scopedChunks = projectSlug
    ? chunks.filter(({ id }) => id === `memory:${projectSlug}` || id.startsWith(`skills:${projectSlug}`) || id.startsWith(`graph:${projectSlug}:`))
    : chunks;
  const terms = expandTerms(tokens(query));
  const projectTerms = projectMemory ? tokens(projectMemory.label.split("·")[0]) : new Set<string>();
  const focusTerms = new Set([...terms].filter((term) => !projectTerms.has(term)));
  const ranked = scopedChunks
    .map((chunk, index) => ({
      chunk,
      index,
      score: [...terms].reduce(
        (score, term) => score
          + (tokens(chunk.label).has(term) ? 2 : 0)
          + (tokens(chunk.content).has(term) ? 1 : 0),
        0,
      ),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const relevant = ranked.filter(({ score }) => score > 0);
  let remaining = 2_800;
  return (relevant.length > 0 ? relevant : ranked).slice(0, limit).map(({ chunk }) => {
    const content = excerpt(chunk.content, focusTerms, Math.min(1_000, remaining));
    remaining -= content.length;
    return { ...chunk, content };
  }).filter(({ content }) => content.length > 0);
}

function expandTerms(terms: Set<string>): Set<string> {
  const expanded = new Set(terms);
  if (terms.has("voz") || terms.has("voice")) {
    for (const synonym of ["speech", "stt", "voz", "voice", "whisper"]) expanded.add(synonym);
  }
  return expanded;
}

function excerpt(content: string, terms: Set<string>, limit: number): string {
  if (content.length <= limit) return content;
  const normalized = content.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const positions = [...terms].map((term) => normalized.indexOf(term)).filter((position) => position >= 0);
  const center = positions.length > 0 ? Math.min(...positions) : 0;
  const start = Math.max(0, Math.min(content.length - limit, center - Math.floor(limit / 3)));
  return content.slice(start, start + limit);
}

function compact(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function buildSemanticPrompt(query: string, chunks: KnowledgeChunk[]): string {
  const context = chunks
    .map((chunk) => `[${chunk.id}] (${chunk.kind}) ${chunk.label}\n${chunk.content}`)
    .join("\n\n");
  const ids = chunks.map(({ id }) => id).join(", ");
  return `Eres el router semántico read-only de ControlP.
Responde en español usando EXCLUSIVAMENTE las fuentes incluidas.
Si la pregunta pide varios elementos o una relación, incluye todos los elementos respaldados relevantes y explica cómo se conectan; no respondas sólo con el primero.
No ejecutes, prometas ni simules escrituras, instalaciones, comandos o acciones externas.
Si recomiendas skills, propón el conjunto mínimo, menciona permisos, indica los solapamientos o que no constan, y aclara que requiere confirmación.
Devuelve JSON estricto: {"answer":"máximo 60 palabras","citations":["id-fuente"]}.
Cada afirmación factual exige al menos una citation con un id exacto del contexto.
citations sólo puede quedar vacía si answer comienza exactamente con "No hay evidencia suficiente".
Ejemplo válido: {"answer":"ControlP está activo.","citations":["memory:controlp"]}.

Pregunta: ${query}

Contexto autorizado:
${context}

IDs permitidos para citations: ${ids}
Antes de terminar, copia en citations al menos un ID permitido que respalde tu respuesta.`;
}

export function validateSemanticDraft(raw: string, allowed: KnowledgeChunk[]): SemanticDraft {
  const parsed = JSON.parse(raw) as Partial<SemanticDraft>;
  const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
  const citations = Array.isArray(parsed.citations)
    ? parsed.citations.filter((value): value is string => typeof value === "string")
    : [];
  const allowedIds = new Set(allowed.map(({ id }) => id));
  if (!answer || answer.length > 1_200) throw new Error("respuesta semántica inválida");
  if (citations.some((id) => !allowedIds.has(id))) throw new Error("cita fuera del contexto autorizado");
  if (citations.length === 0 && !/^no hay evidencia suficiente/i.test(answer)) {
    throw new Error("respuesta sin evidencia");
  }
  return { answer, citations: [...new Set(citations)] };
}

export function buildSemanticRepairPrompt(prompt: string, invalidDraft: string): string {
  return `${prompt}\n\nTu borrador anterior fue inválido:\n${invalidDraft.slice(0, 1_200)}\nCorrígelo una sola vez. Devuelve únicamente JSON y cita al menos un ID permitido si haces una afirmación factual.`;
}

export function requireSkillConfirmation(query: string, answer: string): string {
  return /(recomiend|sugier|aconsej)/i.test(query) && /skills?/i.test(query) && !/confirm/i.test(answer)
    ? `${answer} No se instala ni adopta ninguna skill sin confirmación.`
    : answer;
}

function tokens(text: string): Set<string> {
  return new Set(
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 2 && !STOP_WORDS.has(word)) ?? [],
  );
}

import type { ProjectCard } from "./schema";

export interface AssistantEvidence {
  kind: "canonical" | "derived";
  label: string;
  source: "git" | "graph" | "memory" | "registry";
}

export interface AssistantResponse {
  displayText: string;
  speechText: string;
  evidence: AssistantEvidence[];
  navigation?: { href: string; label: string };
}

export interface ProjectSkill {
  name: string;
  type: string;
  usage: string;
}

export type DeckViewCommand = "metrics" | "inbox" | "plan" | "schedule" | "feed" | "trend";

const NOTE_NAMES: Record<string, string> = {
  backlog: "Backlog",
  estado: "Estado actual",
  roadmap: "Roadmap",
  resumen: "Resumen",
  skills: "Skills",
};

export function normalizeVoiceText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function compactVoiceText(text: string): string {
  return normalizeVoiceText(text).replace(/[^a-z0-9]+/g, "");
}

export function continueProjectQuery(text: string, projectName?: string): string {
  return projectName ? `${text} sobre ${projectName}` : text;
}

export function extractWakeCommand(text: string): string | undefined {
  const normalized = normalizeVoiceText(text);
  const match = normalized.match(/(?:^|\s)oye\s+(?:baul|vault|vau)\b[,:;.!?\s-]*(.*)$/);
  return match?.[1].trim();
}

export function deckViewCommand(text: string): DeckViewCommand | undefined {
  const normalized = normalizeVoiceText(text);
  if (/\b(metricas?|metrics)\b/.test(normalized)) return "metrics";
  if (/\b(inbox|bandeja de entrada)\b/.test(normalized)) return "inbox";
  if (/\b(tendencias?|trend)\b/.test(normalized)) return "trend";
  if (/\b(plan de hoy|plan today)\b/.test(normalized)) return "plan";
  if (/\b(agenda|schedule)\b/.test(normalized)) return "schedule";
  if (/\b(system feed|actividad del sistema)\b/.test(normalized)) return "feed";
}

export function isSocialQuery(text: string): boolean {
  return /^[¿¡]?(?:hola|buen(?:os dias|as tardes|as noches)|como estas(?: hoy)?|que tal)[.!?\s]*$/.test(
    normalizeVoiceText(text),
  );
}

export function isGlobalProjectQuery(text: string): boolean {
  return /\b(cuantos|cuales|lista|todos)\b.*\bproyectos?\b|\bproyectos?\b.*\b(total|todos)\b/.test(
    normalizeVoiceText(text),
  );
}

export function isVoiceArchitectureQuery(text: string): boolean {
  const normalized = normalizeVoiceText(text);
  return /(voz|voice|speech|whisper)/.test(normalized)
    && /(como|conect|constru|funciona|implement|proveedores?)/.test(normalized);
}

export function isHomeNavigation(text: string): boolean {
  const normalized = normalizeVoiceText(text);
  return /(volv|regres|llevame|vamos).*(inicio|pagina principal|principal|vault|v\W*a\W*u\W*l\W*t|control p)/.test(
    normalized,
  );
}

export function isHealthFormationCommand(text: string): boolean {
  return /^(?:(?:muestra|abre|activa|ver|pon)\s+)?(?:el\s+)?(?:ranking|diagnostico(?: de salud)?|project health|salud de proyectos)$/.test(
    normalizeVoiceText(text),
  );
}

export function isStructuredKnowledgeQuery(text: string): boolean {
  const normalized = normalizeVoiceText(text);
  if (/(recomiend|sugier|aconsej|necesito)/.test(normalized) && /(skills?|capacidades?)/.test(normalized)) return false;
  if (isVoiceArchitectureQuery(normalized)) return true;
  return /(skills?|estado|status|salud|avance|progreso|siguiente paso|que sigue|proximo paso|cuantos proyectos|cuales proyectos|lista.*proyectos|roadmap|backlog|resumen)/.test(
    normalized,
  );
}

export function suggestProjectAlias<T extends { name: string }>(
  text: string,
  projects: T[],
): { alias: string; project: T } | undefined {
  const words = normalizeVoiceText(text).match(/[a-z0-9]+/g) ?? [];
  for (const word of words.filter((candidate) => candidate.length >= 3)) {
    const project = projects.find((candidate) => oneEditApart(word, compactVoiceText(candidate.name)));
    if (project) return { alias: word, project };
  }
}

function oneEditApart(left: string, right: string): boolean {
  if (left === right || Math.abs(left.length - right.length) > 1) return false;
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  let edits = 0;
  for (let short = 0, long = 0; long < longer.length; short += 1, long += 1) {
    if (shorter[short] === longer[long]) continue;
    edits += 1;
    if (edits > 1) return false;
    if (shorter.length !== longer.length) short -= 1;
  }
  return true;
}

export function findProject(text: string, projects: ProjectCard[]): ProjectCard | undefined {
  const heard = compactVoiceText(text);
  return projects.find((project) => {
    const name = compactVoiceText(project.name);
    const slug = compactVoiceText(project.slug);
    return (name && heard.includes(name)) || (slug && heard.includes(slug));
  });
}

export async function answerKnowledgeQuery(
  transcript: string,
  projects: ProjectCard[],
  readSkills: (obsidianFolder: string) => Promise<ProjectSkill[]>,
): Promise<AssistantResponse> {
  const text = normalizeVoiceText(transcript);
  const project = findProject(text, projects);

  if (/\bproyectos?\b/.test(text) && !project && /(cuantos|cuales|lista|dime|muestra)/.test(text)) {
    const names = projects.map(({ name }) => name);
    return response(
      `Proyectos: ${names.join(", ")}.`,
      `Tienes ${names.length} proyectos: ${names.join(", ")}.`,
      [{ kind: "canonical", label: "registro de proyectos", source: "registry" }],
    );
  }

  if (!project) {
    return response(
      "No pude identificar el proyecto.",
      "No pude identificar el proyecto. Di su nombre completo.",
      [{ kind: "canonical", label: "registro de proyectos", source: "registry" }],
    );
  }

  if (project.slug === "controlp" && isVoiceArchitectureQuery(text)) {
    return response(
      "ControlP usa dos entradas: useSpeech con Web Speech en vivo y useWhisper, que graba y envía audio a /api/stt; el sidecar FastAPI transcribe con faster-whisper y VAD. VoicePanel selecciona el proveedor y entrega el texto a routeCommand. useMicLevel anima el núcleo y useTts reproduce la respuesta.",
      "ControlP usa Web Speech en vivo y Whisper local mediante el endpoint de transcripción. Voice Panel selecciona el proveedor y entrega el texto al router de comandos.",
      [
        { kind: "derived", label: "ControlP/CONTEXT_MAP.md · app/components/voice", source: "graph" },
        { kind: "derived", label: "ControlP/CONTEXT_MAP.md · stt sidecar", source: "graph" },
      ],
    );
  }

  if (/\bsalud\b/.test(text)) {
    const reasons = project.healthReasons?.length
      ? project.healthReasons.join(", ")
      : "sin ajustes documentados sobre la base de 100";
    return response(
      `${project.name} · Salud: ${project.health}%. Razones: ${reasons}.`,
      `La salud de ${project.name} es ${project.health} por ciento. Razones: ${reasons}.`,
      [
        { kind: "derived", label: "cálculo Project Health", source: "registry" },
        { kind: "canonical", label: `${project.obsidianFolder}/Estado actual.md`, source: "memory" },
        { kind: "canonical", label: `${project.name} · evidencia Git`, source: "git" },
        { kind: "derived", label: `${project.name} · Graphify`, source: "graph" },
      ],
    );
  }

  if (/\b(avance|progreso)\b/.test(text)) {
    return response(
      `${project.name} · Estado: ${project.status}. Reto: ${project.currentChallenge}. Siguiente paso: ${project.nextStep}`,
      `${project.name} está ${project.status}. Su reto actual es ${project.currentChallenge}. El siguiente paso es ${project.nextStep}`,
      [{ kind: "canonical", label: `${project.obsidianFolder}/Estado actual.md`, source: "memory" }],
    );
  }

  if (/\bskills?\b/.test(text)) {
    const skills = await readSkills(project.obsidianFolder);
    if (skills.length === 0) {
      return response(
        `${project.name} no tiene skills documentadas.`,
        `${project.name} no tiene skills documentadas.`,
        [{ kind: "canonical", label: `${project.obsidianFolder}/Skills.md`, source: "memory" }],
      );
    }
    const asksForGlobal = /\b(globales|predeterminadas)\b/.test(text);
    const asksForOther = /\b(otras|adicionales|especificas|adoptadas)\b/.test(text);
    const selected = asksForGlobal
      ? skills.filter(({ type }) => /predeterminada global/i.test(type))
      : asksForOther
        ? skills.filter(({ type }) => !/predeterminada global/i.test(type))
        : skills;
    if (asksForOther && selected.length === 0) {
      return response(
        `${project.name} no tiene otras skills documentadas además de las predeterminadas globales.`,
        `${project.name} no tiene otras skills documentadas además de las predeterminadas globales.`,
        [{ kind: "canonical", label: `${project.obsidianFolder}/Skills.md`, source: "memory" }],
      );
    }
    const names = selected.map(({ name }) => name);
    const qualifier = asksForGlobal ? "Skills globales" : asksForOther ? "Skills adoptadas" : "Skills";
    return response(
      `${project.name} · ${qualifier}: ${names.join(", ")}.`,
      `${project.name} tiene ${names.length} grupos de ${qualifier.toLowerCase()}: ${names.join(", ")}.`,
      [{ kind: "canonical", label: `${project.obsidianFolder}/Skills.md`, source: "memory" }],
    );
  }

  if (/(siguiente paso|que sigue|proximo paso)/.test(text)) {
    return response(
      `${project.name} · Siguiente paso: ${project.nextStep}`,
      `El siguiente paso de ${project.name} es: ${project.nextStep}`,
      [{ kind: "canonical", label: `${project.obsidianFolder}/Estado actual.md`, source: "memory" }],
    );
  }

  if (/\b(estado|status)\b/.test(text)) {
    return response(
      `${project.name} · Estado: ${project.status}. Reto: ${project.currentChallenge}`,
      `${project.name} está ${project.status}. Su reto actual es: ${project.currentChallenge}`,
      [{ kind: "canonical", label: `${project.obsidianFolder}/Estado actual.md`, source: "memory" }],
    );
  }

  const note = Object.entries(NOTE_NAMES).find(([heard]) => text.includes(heard));
  if (note && /(abre|abrir|muestra|ver)/.test(text)) {
    const file = `Proyectos/${project.obsidianFolder}/${note[1]}`;
    return response(
      `Abriendo ${note[1]} de ${project.name}.`,
      `Abriendo ${note[1]} de ${project.name}.`,
      [{ kind: "canonical", label: `${file}.md`, source: "memory" }],
      {
        href: `obsidian://open?vault=Cerebro&file=${encodeURIComponent(file)}`,
        label: `Abrir ${note[1]} en Obsidian`,
      },
    );
  }

  return response(
    `Puedo consultar el estado, siguiente paso y skills de ${project.name}.`,
    `Puedo consultar el estado, siguiente paso y skills de ${project.name}.`,
    [{ kind: "canonical", label: "consulta estructurada", source: "registry" }],
  );
}

function response(
  displayText: string,
  speechText: string,
  evidence: AssistantEvidence[],
  navigation?: AssistantResponse["navigation"],
): AssistantResponse {
  return { displayText, evidence, navigation, speechText };
}

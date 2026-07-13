import type { NodeFormation } from "@/app/components/vault-core/types";

/**
 * Router de comandos por reglas simples (Voz I). Sin LLM todavía: eso llega
 * en el Sprint 4, que reemplazará este router por uno inteligente detrás de
 * la misma interfaz.
 */
export type VoiceAction =
  | { type: "formation"; formation: NodeFormation; label: string }
  | { type: "navigate"; href: string; label: string }
  | { type: "enqueue"; command: string; label: string }
  | { type: "unknown"; hint: string };

export interface VoiceProject {
  name: string;
  slug: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Forma compacta para comparar nombres dictados: solo letras y números.
 * Whisper deletrea o puntúa distinto ("MA-I-A", "ma ia", "Notion.") y la
 * comparación literal fallaba; "MA-IA" y "MA-I-A" comparten "maia".
 */
function compact(text: string): string {
  return normalize(text).replace(/[^a-z0-9]+/g, "");
}

const NOTE_PREFIXES = ["anota", "tarea", "recuerda", "apunta", "pendiente", "comando"];

export function routeCommand(transcript: string, projects: VoiceProject[]): VoiceAction {
  const text = normalize(transcript);

  // Dictado explícito primero: "anota revisar la cola" es una nota, no una
  // navegación — el prefijo declara la intención y gana sobre toda regla.
  for (const prefix of NOTE_PREFIXES) {
    if (text.startsWith(prefix)) {
      const command = transcript.trim().slice(0, 80);
      return { command, label: `encolado: "${command}"`, type: "enqueue" };
    }
  }

  // Formaciones del núcleo 3D.
  if (/(ranking|diagnostico|salud)/.test(text)) {
    return { formation: "health", label: "formación: diagnóstico de salud", type: "formation" };
  }
  // "gris"/"grilla": Whisper suele transcribir así el anglicismo "grid".
  if (/(cuadricula|grid|grilla|organiza|\bgris\b)/.test(text)) {
    return { formation: "grid", label: "formación: grid", type: "formation" };
  }
  if (/(orbita|esfera|normal)/.test(text)) {
    return { formation: "orbit", label: "formación: órbita", type: "formation" };
  }

  // Navegación.
  if (/(cola|queue|intents)/.test(text)) {
    return { href: "/queue", label: "abriendo la cola", type: "navigate" };
  }
  // "proyecto" también dispara: si Whisper pierde el verbo ("Pre el proyecto
  // de Notion"), la palabra proyecto + un nombre conocido bastan.
  if (/(abre|abrir|muestra|ficha|proyecto|entra|ver)/.test(text)) {
    const heard = compact(text);
    for (const project of projects) {
      const nameKey = compact(project.name);
      const slugKey = compact(project.slug);
      if ((nameKey && heard.includes(nameKey)) || (slugKey && heard.includes(slugKey))) {
        return {
          href: `/p/${project.slug}`,
          label: `abriendo ${project.name}`,
          type: "navigate",
        };
      }
    }
  }

  return {
    hint: 'Sin regla para esa frase. Prueba: "ranking", "órbita", "grid", "abre <proyecto>", "cola", o dicta con "anota…/tarea…".',
    type: "unknown",
  };
}

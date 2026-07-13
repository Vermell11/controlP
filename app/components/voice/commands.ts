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

const NOTE_PREFIXES = ["anota", "tarea", "recuerda", "apunta", "pendiente", "comando"];

export function routeCommand(transcript: string, projects: VoiceProject[]): VoiceAction {
  const text = normalize(transcript);

  // Formaciones del núcleo 3D.
  if (/(ranking|diagnostico|salud)/.test(text)) {
    return { formation: "health", label: "formación: diagnóstico de salud", type: "formation" };
  }
  if (/(cuadricula|grid|organiza)/.test(text)) {
    return { formation: "grid", label: "formación: grid", type: "formation" };
  }
  if (/(orbita|esfera|normal)/.test(text)) {
    return { formation: "orbit", label: "formación: órbita", type: "formation" };
  }

  // Navegación.
  if (/(cola|queue|intents)/.test(text)) {
    return { href: "/queue", label: "abriendo la cola", type: "navigate" };
  }
  if (/(abre|abrir|muestra|ficha)/.test(text)) {
    for (const project of projects) {
      if (text.includes(normalize(project.name)) || text.includes(project.slug)) {
        return {
          href: `/p/${project.slug}`,
          label: `abriendo ${project.name}`,
          type: "navigate",
        };
      }
    }
  }

  // Captura de intención → cola (la agenda operativa V1.4.1 los consumirá).
  for (const prefix of NOTE_PREFIXES) {
    if (text.startsWith(prefix)) {
      const command = transcript.trim().slice(0, 80);
      return { command, label: `encolado: "${command}"`, type: "enqueue" };
    }
  }

  return {
    hint: 'Sin regla para esa frase. Prueba: "ranking", "órbita", "grid", "abre <proyecto>", "cola", o dicta con "anota…/tarea…".',
    type: "unknown",
  };
}

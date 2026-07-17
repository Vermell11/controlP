import type { AssistantResponse } from "@/lib/assistant";
import {
  compactVoiceText,
  isHomeNavigation,
  normalizeVoiceText,
  suggestProjectAlias,
} from "@/lib/assistant";
import type { NodeFormation } from "@/app/components/vault-core/types";

export interface VoiceAlias {
  alias: string;
  createdAt: string;
  target: string;
}

export type VoiceAction =
  | { type: "formation"; formation: NodeFormation; response: AssistantResponse }
  | { type: "navigate"; response: AssistantResponse }
  | { type: "enqueue"; command: string; response: AssistantResponse }
  | { type: "query"; query: string }
  | { type: "propose-alias"; alias: string; target: string; response: AssistantResponse }
  | { type: "unknown"; response: AssistantResponse };

export interface VoiceProject {
  name: string;
  slug: string;
}

const NOTE_PREFIXES = ["anota", "tarea", "recuerda", "apunta", "pendiente", "comando"];

export function routeCommand(
  transcript: string,
  projects: VoiceProject[],
  aliases: VoiceAlias[] = [],
): VoiceAction {
  const text = applyVoiceAliases(transcript, aliases);

  const aliasProposal = text.match(/^(?:recuerda que|corrige)\s+(.+?)\s+(?:es|como)\s+(.+)$/);
  if (aliasProposal) {
    const target = findVoiceProject(aliasProposal[2], projects);
    if (target) {
      const alias = normalizeVoiceText(aliasProposal[1]);
      return {
        alias,
        response: message(
          `Confirmar alias: “${alias}” → “${target.name}”.`,
          `¿Confirmas que ${alias} significa ${target.name}?`,
        ),
        target: target.name,
        type: "propose-alias",
      };
    }
  }

  // Dictado explícito gana sobre consultas; "recuerda que X es Y" ya fue
  // separado arriba porque requiere confirmación y no entra a la cola.
  for (const prefix of NOTE_PREFIXES) {
    if (text.startsWith(prefix)) {
      const command = transcript.trim().slice(0, 80);
      return {
        command,
        response: message(`Encolado: “${command}”.`, `He encolado: ${command}.`),
        type: "enqueue",
      };
    }
  }

  if (/(ranking|diagnostico|salud)/.test(text)) {
    return {
      formation: "health",
      response: message("Formación: diagnóstico de salud.", "Mostrando el diagnóstico de salud."),
      type: "formation",
    };
  }
  if (/(cuadricula|grid|grilla|organiza|\bgris\b)/.test(text)) {
    return {
      formation: "grid",
      response: message("Formación: grid.", "Organizando los proyectos en cuadrícula."),
      type: "formation",
    };
  }
  if (/(orbita|esfera|normal)/.test(text)) {
    return {
      formation: "orbit",
      response: message("Formación: órbita.", "Mostrando la formación orbital."),
      type: "formation",
    };
  }

  if (/(cola|queue|intents)/.test(text)) {
    return {
      response: message("Abriendo la cola.", "Abriendo la cola.", "/queue"),
      type: "navigate",
    };
  }

  if (isHomeNavigation(text)) {
    return {
      response: message("Volviendo a V.A.U.L.T.", "Volviendo a la página principal.", "/"),
      type: "navigate",
    };
  }

  if (isKnowledgeQuery(text)) {
    if (!findVoiceProject(text, projects)) {
      const suggestion = suggestProjectAlias(text, projects);
      if (suggestion) {
        return {
          alias: suggestion.alias,
          response: message(
            `No encontré “${suggestion.alias}”. ¿Confirmar alias “${suggestion.alias}” → “${suggestion.project.name}”?`,
            `¿Confirmas que ${suggestion.alias} significa ${suggestion.project.name}?`,
          ),
          target: suggestion.project.name,
          type: "propose-alias",
        };
      }
    }
    return { query: text, type: "query" };
  }

  if (/(abre|abrir|muestra|ficha|proyecto|entra|ver)/.test(text)) {
    const project = findVoiceProject(text, projects);
    if (project) {
      return {
        response: message(
          `Abriendo ${project.name}.`,
          `Abriendo ${project.name}.`,
          `/p/${project.slug}`,
        ),
        type: "navigate",
      };
    }
  }

  return {
    response: message(
      'Sin regla para esa frase. Prueba “estado de ControlP”, “skills de ControlP”, “abre un proyecto” o “ranking”.',
      "No entendí la petición. Puedes preguntar por el estado, siguiente paso o skills de un proyecto.",
    ),
    type: "unknown",
  };
}

function findVoiceProject(text: string, projects: VoiceProject[]): VoiceProject | undefined {
  const heard = compactVoiceText(text);
  return projects.find((project) => {
    const name = compactVoiceText(project.name);
    const slug = compactVoiceText(project.slug);
    return (name && heard.includes(name)) || (slug && heard.includes(slug));
  });
}

function applyVoiceAliases(text: string, aliases: VoiceAlias[]): string {
  let normalized = normalizeVoiceText(text);
  for (const item of aliases) {
    const escaped = normalizeVoiceText(item.alias).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    normalized = normalized.replace(new RegExp(`\\b${escaped}\\b`, "g"), item.target);
  }
  return normalized;
}

function isKnowledgeQuery(text: string): boolean {
  return /(skills?|estado|status|siguiente paso|que sigue|proximo paso|cuales proyectos|lista.*proyectos|roadmap|backlog|resumen)/.test(
    text,
  );
}

function message(displayText: string, speechText: string, href?: string): AssistantResponse {
  return {
    displayText,
    evidence: [],
    navigation: href ? { href, label: displayText } : undefined,
    speechText,
  };
}

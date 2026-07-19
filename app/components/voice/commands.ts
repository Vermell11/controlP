import type { AssistantResponse } from "@/lib/assistant";
import {
  compactVoiceText,
  continueProjectQuery,
  deckViewCommand,
  isDeckCloseCommand,
  isHealthFormationCommand,
  isHomeNavigation,
  isGlobalProjectQuery,
  isSocialQuery,
  isVoiceArchitectureQuery,
  normalizeVoiceText,
  sttProviderCommand,
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
  | { type: "deck-view"; view: import("@/lib/assistant").DeckViewCommand; response: AssistantResponse }
  | { type: "deck-close"; response: AssistantResponse }
  | { type: "provider"; provider: "whisper" | "webspeech"; response: AssistantResponse }
  | { type: "respond"; response: AssistantResponse }
  | { type: "query"; query: string; project?: VoiceProject }
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
  contextProject?: VoiceProject,
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
        response: message(
          `Propuesta preparada: “${command}”. Revisa y confirma la vista previa.`,
          `Preparé la propuesta ${command}. Confirma la vista previa para encolarla.`,
        ),
        type: "enqueue",
      };
    }
  }

  if (isSocialQuery(text)) {
    return {
      response: message("Estoy operativo. ¿Qué quieres revisar?", "Estoy bien y operativo. ¿Qué quieres revisar?"),
      type: "respond",
    };
  }

  const provider = sttProviderCommand(text);
  if (provider) {
    const label = provider === "whisper" ? "Whisper local" : "Web Speech";
    return {
      provider,
      response: message(
        `Proveedor de voz · ${label}.`,
        `${label} seleccionado.${provider === "whisper" ? " Inícialo con el botón de servicio." : ""}`,
      ),
      type: "provider",
    };
  }

  if (isDeckCloseCommand(text)) {
    return {
      response: message("Command Deck · vista cerrada.", "Cerrando la vista de Command Deck."),
      type: "deck-close",
    };
  }

  const deckView = deckViewCommand(text);
  if (deckView) {
    const labels = { feed: "actividad", inbox: "inbox", metrics: "métricas", plan: "plan", schedule: "agenda", trend: "tendencias" };
    return {
      response: message(`Command Deck · ${labels[deckView]}.`, `Mostrando ${labels[deckView]} en Command Deck.`),
      type: "deck-view",
      view: deckView,
    };
  }

  if (isHealthFormationCommand(text)) {
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
    if (isGlobalProjectQuery(text)) return { query: text, type: "query" };
    const project = findVoiceProject(text, projects);
    if (!project && !contextProject) {
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
    const resolvedProject = project ?? contextProject;
    return {
      project: resolvedProject,
      query: project ? text : continueProjectQuery(text, resolvedProject?.name),
      type: "query",
    };
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

  return { project: findVoiceProject(text, projects), query: text, type: "query" };
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
  return isVoiceArchitectureQuery(text) || /(skills?|estado|status|salud|avance|progreso|siguiente paso|que sigue|proximo paso|cuantos proyectos|cuales proyectos|lista.*proyectos|roadmap|backlog|resumen)/.test(
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

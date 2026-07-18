import type { AssistantResponse } from "./assistant";
import type { KnowledgeChunk, SemanticDraft } from "./assistant-rag";
import { buildSemanticPrompt, buildSemanticRepairPrompt, requireSkillConfirmation, retrieveKnowledge, validateSemanticDraft } from "./assistant-rag";
import { askOllama } from "./adapters/llm-ollama";

export async function answerSemanticQuery(
  query: string,
  corpus: KnowledgeChunk[],
  complete: (prompt: string) => Promise<string> = askOllama,
): Promise<AssistantResponse> {
  const context = retrieveKnowledge(query, corpus);
  const prompt = buildSemanticPrompt(query, context);
  const firstDraft = await complete(prompt);
  let draft: SemanticDraft;
  try {
    draft = validateSemanticDraft(firstDraft, context);
  } catch {
    draft = validateSemanticDraft(await complete(buildSemanticRepairPrompt(prompt, firstDraft)), context);
  }
  const answer = requireSkillConfirmation(query, draft.answer);
  const cited = new Map(context.map((chunk) => [chunk.id, chunk]));
  return {
    displayText: answer,
    evidence: draft.citations.map((id) => {
      const chunk = cited.get(id)!;
      return {
        kind: chunk.kind,
        label: chunk.label,
        source: chunk.kind === "derived" ? "graph" as const : "memory" as const,
      };
    }),
    speechText: answer,
  };
}

export function semanticUnavailable(): AssistantResponse {
  return {
    displayText: "El router semántico local no está disponible o no produjo evidencia válida. No ejecuté ninguna acción.",
    evidence: [],
    speechText: "El router semántico local no está disponible. No ejecuté ninguna acción.",
  };
}

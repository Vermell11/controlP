import { NextResponse } from "next/server";
import { answerKnowledgeQuery, isStructuredKnowledgeQuery } from "@/lib/assistant";
import { readProjectSkills } from "@/lib/adapters/memory-obsidian";
import { buildKnowledgeCorpus } from "@/lib/assistant-knowledge";
import { answerSemanticQuery, semanticUnavailable } from "@/lib/assistant-semantic";
import { getProjects } from "@/lib/controlp";
import { applyVoiceAliases, readVoiceAliases } from "@/lib/voice-aliases";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 240) {
    return NextResponse.json({ error: "consulta inválida" }, { status: 400 });
  }

  const [projects, aliases] = await Promise.all([getProjects(), readVoiceAliases()]);
  const normalized = applyVoiceAliases(query, aliases);
  if (isStructuredKnowledgeQuery(normalized)) {
    return NextResponse.json(await answerKnowledgeQuery(normalized, projects, readProjectSkills));
  }
  try {
    return NextResponse.json(
      await answerSemanticQuery(normalized, await buildKnowledgeCorpus(projects)),
    );
  } catch (error) {
    console.warn("[assistant] semantic fallback:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(semanticUnavailable());
  }
}

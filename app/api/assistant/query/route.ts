import { NextResponse } from "next/server";
import { answerKnowledgeQuery } from "@/lib/assistant";
import { readProjectSkills } from "@/lib/adapters/memory-obsidian";
import { getProjects } from "@/lib/controlp";
import { applyVoiceAliases, readVoiceAliases } from "@/lib/voice-aliases";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 240) {
    return NextResponse.json({ error: "consulta inválida" }, { status: 400 });
  }

  const [projects, aliases] = await Promise.all([getProjects(), readVoiceAliases()]);
  const response = await answerKnowledgeQuery(
    applyVoiceAliases(query, aliases),
    projects,
    readProjectSkills,
  );
  return NextResponse.json(response);
}

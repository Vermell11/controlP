import { NextResponse } from "next/server";
import { compactVoiceText, findProject } from "@/lib/assistant";
import { getProjects } from "@/lib/controlp";
import { appendVoiceAlias, readVoiceAliases } from "@/lib/voice-aliases";

export async function GET() {
  return NextResponse.json({ aliases: await readVoiceAliases() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    alias?: unknown;
    confirmed?: unknown;
    target?: unknown;
  } | null;
  const alias = typeof body?.alias === "string" ? body.alias.trim() : "";
  const target = typeof body?.target === "string" ? body.target.trim() : "";
  if (body?.confirmed !== true || !alias || alias.length > 40 || !target) {
    return NextResponse.json({ error: "alias no confirmado o inválido" }, { status: 400 });
  }

  const projects = await getProjects();
  const project = findProject(target, projects);
  if (!project || compactVoiceText(project.name) !== compactVoiceText(target)) {
    return NextResponse.json({ error: "destino desconocido" }, { status: 400 });
  }

  const saved = await appendVoiceAlias(alias, project.name);
  return NextResponse.json({ saved });
}

import { NextResponse } from "next/server";
import { proposeScheduleIntent } from "@/lib/intents";
import { loadRegistry } from "@/lib/registry";
import { readDayPlan } from "@/lib/schedule";

/**
 * Plan del día: estado en servidor + traza permanente en la Bitácora del
 * proyecto. POST sólo propone; la ejecución ocurre por /api/intents tras
 * confirmar el hash exacto de la vista previa.
 */
export async function GET() {
  const plan = await readDayPlan();
  return NextResponse.json(plan);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    slug?: unknown;
    done?: unknown;
    note?: unknown;
  } | null;

  const slug = typeof body?.slug === "string" ? body.slug : "";
  const done = typeof body?.done === "boolean" ? body.done : null;
  const note = typeof body?.note === "string" ? body.note.slice(0, 200) : "";

  if (!slug || done === null) {
    return NextResponse.json({ error: "slug/done inválidos" }, { status: 400 });
  }

  const { entries } = await loadRegistry();
  const entry = entries.find((candidate) => candidate.slug === slug);
  if (!entry) {
    return NextResponse.json({ error: "proyecto desconocido" }, { status: 404 });
  }

  const intent = await proposeScheduleIntent(slug, entry.displayName, note, done);
  return NextResponse.json({ intent });
}

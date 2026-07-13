import { NextResponse } from "next/server";
import { appendLogEntry } from "@/lib/adapters/memory-obsidian";
import { loadRegistry } from "@/lib/registry";
import { readDayPlan, setDayItem } from "@/lib/schedule";

/**
 * Plan del día: estado en servidor + traza permanente en la Bitácora del
 * proyecto (memoria/Obsidian) vía adaptador. El cliente confirma antes de
 * llamar aquí (regla de confirmación explícita del contrato).
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

  // Transacción simple: primero la traza permanente en la memoria (Obsidian);
  // solo si esa escritura funciona se confirma el estado del día. Así la UI
  // nunca dice "registrado" sin que la Bitácora lo tenga.
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const action = done ? "avance del día confirmado" : "avance del día reabierto";
  const trace = await appendLogEntry(
    entry.sources.obsidianFolder,
    `${stamp} — ${action} desde ControlP${note ? `: ${note}` : ""}`,
  );

  if (trace) {
    return NextResponse.json(
      { error: `No se pudo escribir la Bitácora: ${trace.detail ?? trace.field}` },
      { status: 502 },
    );
  }

  const plan = await setDayItem(slug, done);
  return NextResponse.json({ plan, trace: "ok" });
}

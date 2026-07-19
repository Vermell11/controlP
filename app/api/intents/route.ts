import { NextResponse } from "next/server";
import { cancelIntent, confirmIntent, proposeIntent, readIntentQueue } from "@/lib/intents";

function trustedLocalOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/**
 * API de la cola de intents (V2): el dashboard escribe intenciones y un runner
 * externo las ejecutará. La lógica vive en lib/intents.ts; la vista en /queue.
 */
export async function GET() {
  const { items, corrupted } = await readIntentQueue();
  return NextResponse.json({
    corrupted,
    count: items.length,
    proposed: items.filter((item) => item.status === "proposed").length,
    queued: items.filter((item) => item.status === "queued").length,
    latest: items.slice(-5),
  });
}

export async function POST(request: Request) {
  if (!trustedLocalOrigin(request)) {
    return NextResponse.json({ error: "origen no autorizado" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    command?: unknown;
    source?: unknown;
    idempotencyKey?: unknown;
  } | null;
  const command = typeof body?.command === "string" ? body.command.trim() : "";
  const source = body?.source === "voice" ? "voice" : "deck";

  const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey.trim() : undefined;

  if (!command || command.length > 80 || (idempotencyKey && idempotencyKey.length > 100)) {
    return NextResponse.json({ error: "command inválido" }, { status: 400 });
  }

  try {
    const proposal = await proposeIntent(command, source, idempotencyKey);
    const { items, corrupted } = await readIntentQueue();
    return NextResponse.json({ corrupted, count: items.length, proposal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "comando no autorizado" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!trustedLocalOrigin(request)) {
    return NextResponse.json({ error: "origen no autorizado" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    previewHash?: unknown;
    decision?: unknown;
  } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const previewHash = typeof body?.previewHash === "string" ? body.previewHash : "";
  if (!id || !previewHash || !["confirm", "cancel"].includes(String(body?.decision))) {
    return NextResponse.json({ error: "confirmación inválida" }, { status: 400 });
  }

  try {
    const intent = body?.decision === "confirm"
      ? await confirmIntent(id, previewHash)
      : await cancelIntent(id, previewHash);
    return NextResponse.json({ intent });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}

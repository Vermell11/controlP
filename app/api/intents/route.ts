import { NextResponse } from "next/server";
import { appendIntent, readIntentQueue } from "@/lib/intents";

/**
 * API de la cola de intents (V2): el dashboard escribe intenciones y un runner
 * externo las ejecutará. La lógica vive en lib/intents.ts; la vista en /queue.
 */
export async function GET() {
  const { items, corrupted } = await readIntentQueue();
  return NextResponse.json({ corrupted, count: items.length, latest: items.slice(-5) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    command?: unknown;
    source?: unknown;
  } | null;
  const command = typeof body?.command === "string" ? body.command.trim() : "";
  const source = body?.source === "voice" ? "voice" : "deck";

  if (!command || command.length > 80) {
    return NextResponse.json({ error: "command inválido" }, { status: 400 });
  }

  const intent = await appendIntent(command, source);
  const { items, corrupted } = await readIntentQueue();
  return NextResponse.json({ corrupted, count: items.length, queued: intent });
}

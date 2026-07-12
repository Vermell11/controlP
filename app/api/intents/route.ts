import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Cola local de intents (V2): el dashboard escribe intenciones y un runner
 * externo las ejecutará. Persistencia en runtime/intents.jsonl (gitignored).
 * Esta misma cola recibirá los intents de voz en la fase siguiente.
 */
const QUEUE_FILE = path.join(process.cwd(), "runtime", "intents.jsonl");

interface Intent {
  command: string;
  at: string;
  status: "queued";
  source: "deck" | "voice";
}

async function readQueue(): Promise<Intent[]> {
  try {
    const raw = await fs.readFile(QUEUE_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Intent);
  } catch {
    return [];
  }
}

export async function GET() {
  const items = await readQueue();
  return NextResponse.json({ count: items.length, latest: items.slice(-5) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { command?: unknown } | null;
  const command = typeof body?.command === "string" ? body.command.trim() : "";

  if (!command || command.length > 80) {
    return NextResponse.json({ error: "command inválido" }, { status: 400 });
  }

  const intent: Intent = {
    at: new Date().toISOString(),
    command,
    source: "deck",
    status: "queued",
  };

  await fs.mkdir(path.dirname(QUEUE_FILE), { recursive: true });
  await fs.appendFile(QUEUE_FILE, `${JSON.stringify(intent)}\n`, "utf8");

  const items = await readQueue();
  return NextResponse.json({ count: items.length, queued: intent });
}

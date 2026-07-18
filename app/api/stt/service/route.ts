import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { NextResponse } from "next/server";

const STT_HEALTH_URL = "http://127.0.0.1:8787/health";
const globalStt = globalThis as typeof globalThis & { controlpStt?: ChildProcess };

async function running() {
  return fetch(STT_HEALTH_URL, { cache: "no-store", signal: AbortSignal.timeout(800) })
    .then((response) => response.ok)
    .catch(() => false);
}

function localRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(origin).hostname);
  } catch {
    return false;
  }
}

export async function GET() {
  return NextResponse.json({ status: (await running()) ? "running" : "stopped" });
}

export async function POST(request: Request) {
  if (!localRequest(request)) return NextResponse.json({ error: "solo localhost" }, { status: 403 });
  if (await running()) return NextResponse.json({ status: "running" });
  if (globalStt.controlpStt?.exitCode === null) return NextResponse.json({ status: "starting" });

  const child = spawn("bash", [path.join(process.cwd(), "stt/run.sh")], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "ignore",
  });
  globalStt.controlpStt = child;
  child.once("exit", () => {
    if (globalStt.controlpStt === child) globalStt.controlpStt = undefined;
  });
  return NextResponse.json({ status: "starting" }, { status: 202 });
}

export async function DELETE(request: Request) {
  if (!localRequest(request)) return NextResponse.json({ error: "solo localhost" }, { status: 403 });
  globalStt.controlpStt?.kill("SIGTERM");
  globalStt.controlpStt = undefined;
  return NextResponse.json({ status: (await running()) ? "running" : "stopped" });
}

import { NextResponse } from "next/server";

const STT_URL = process.env.STT_URL ?? "http://127.0.0.1:8787/transcribe";

/**
 * Proxy al sidecar STT local (faster-whisper). Mantiene al navegador
 * hablando solo con ControlP (sin CORS ni URLs de servicios en el cliente)
 * y permite mover el sidecar con la variable STT_URL.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form || !(form.get("audio") instanceof Blob)) {
    return NextResponse.json({ error: "audio requerido" }, { status: 400 });
  }

  try {
    const response = await fetch(STT_URL, {
      body: form,
      method: "POST",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `sidecar STT respondió ${response.status}` },
        { status: 502 },
      );
    }
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: "sidecar STT no responde — arranca stt/run.sh" },
      { status: 502 },
    );
  }
}

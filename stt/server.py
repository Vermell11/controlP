"""
Sidecar STT local de ControlP — faster-whisper (V1.4.2).

Transcripción en español, gratis y local (premisa local-first). El dashboard
le habla vía el proxy /api/stt; si este servicio no corre, el panel de voz
cae automáticamente a Web Speech.

Uso:  ./run.sh   (o: uvicorn server:app --port 8787)
Modelo por defecto: small (int8). Override: WHISPER_MODEL=base ./run.sh
La primera ejecución descarga el modelo (~460 MB para small).
"""

import os
import tempfile
import time

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

MODEL_NAME = os.environ.get("WHISPER_MODEL", "small")

print(f"[stt] cargando modelo {MODEL_NAME} (int8)…")
model = WhisperModel(MODEL_NAME, device="auto", compute_type="int8")
print("[stt] listo")

app = FastAPI(title="ControlP STT")
app.add_middleware(
    CORSMiddleware,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
)


@app.get("/health")
def health() -> dict:
    return {"model": MODEL_NAME, "ok": True}


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)) -> dict:
    started = time.time()
    suffix = os.path.splitext(audio.filename or "clip.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as handle:
        handle.write(await audio.read())
        path = handle.name

    try:
        segments, info = model.transcribe(
            path,
            beam_size=5,
            language="es",
            vad_filter=True,
        )
        text = " ".join(segment.text.strip() for segment in segments).strip()
    finally:
        os.unlink(path)

    return {
        "language": info.language,
        "ms": int((time.time() - started) * 1000),
        "text": text,
    }

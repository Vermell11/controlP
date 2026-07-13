#!/bin/bash
# Sidecar STT de ControlP: crea el venv si falta, instala deps y arranca.
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "[stt] creando entorno virtual…"
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "[stt] arrancando en http://127.0.0.1:8787 (modelo: ${WHISPER_MODEL:-small})"
exec uvicorn server:app --host 127.0.0.1 --port 8787

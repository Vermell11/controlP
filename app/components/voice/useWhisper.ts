"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Proveedor STT Whisper local: graba mientras se sostiene el PTT
 * (MediaRecorder) y transcribe al soltar vía /api/stt → sidecar
 * faster-whisper. Sin interim (transcribe el clip completo); `busy` indica
 * "transcribiendo…".
 */
export function useWhisper(
  onFinal: (transcript: string) => void,
  onError: (message: string) => void,
) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sessionRef = useRef(0);
  const [busy, setBusy] = useState(false);

  const start = useCallback(async () => {
    const session = (sessionRef.current += 1);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: true, echoCancellation: true, noiseSuppression: true },
      });
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start();
    } catch {
      onError("no se pudo iniciar la grabación para Whisper");
    }
  }, [onError]);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    const recorder = recorderRef.current;
    const stream = streamRef.current;
    recorderRef.current = null;
    streamRef.current = null;
    if (!recorder || recorder.state === "inactive") {
      stream?.getTracks().forEach((track) => track.stop());
      return;
    }

    recorder.onstop = async () => {
      stream?.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      chunksRef.current = [];
      // Clips ínfimos (tap accidental) no valen un viaje al modelo.
      if (blob.size < 2_000) return;

      setBusy(true);
      try {
        const form = new FormData();
        form.append("audio", blob, "clip.webm");
        const response = await fetch("/api/stt", { body: form, method: "POST" });
        const data = (await response.json()) as { text?: string; error?: string };
        if (!response.ok) {
          onError(data.error ?? "el sidecar STT falló");
        } else if (data.text) {
          onFinal(data.text);
        } else {
          onError("Whisper no detectó voz en el clip");
        }
      } catch {
        onError("sin conexión con /api/stt");
      } finally {
        setBusy(false);
      }
    };
    recorder.stop();
  }, [onError, onFinal]);

  return { busy, start, stop };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { vaultSignals } from "@/app/components/vault-core/signals";
import { SPECTRUM_BANDS } from "@/app/components/vault-core/types";

export type MicStatus =
  | "idle"
  | "listening"
  | "denied"
  | "nodevice"
  | "busy"
  | "error"
  | "unsupported"
  | "insecure";

/**
 * Rol: oídos del núcleo. Mientras está activo, mide la energía de tu voz
 * (RMS del AnalyserNode) y la escribe por frame en `vaultSignals.level`,
 * con `state = "listening"` — el núcleo 3D reacciona solo (intensidad,
 * pulso, velocidad; los nodos vibran).
 *
 * Requiere contexto seguro: localhost o https. En http por LAN reporta
 * "insecure" sin intentar el permiso.
 */
export function useMicLevel() {
  const [status, setStatus] = useState<MicStatus>("idle");
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  // Token de sesión anti-carrera: stop() lo invalida; si getUserMedia
  // resuelve después de soltar el PTT, el stream se desecha al instante.
  const sessionRef = useRef(0);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close();
    contextRef.current = null;
    vaultSignals.level = 0;
    vaultSignals.spectrum.fill(0);
    vaultSignals.state = "idle";
    setStatus((previous) => (previous === "listening" ? "idle" : previous));
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!window.isSecureContext) {
      setStatus("insecure");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    const session = (sessionRef.current += 1);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Carrera de permisos lentos: si el PTT se soltó (stop) mientras el
      // usuario respondía el aviso, desechar el stream y no arrancar nada.
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const context = new AudioContext();
      contextRef.current = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const timeBuffer = new Uint8Array(analyser.frequencyBinCount);
      const freqBuffer = new Uint8Array(analyser.frequencyBinCount);
      // Rango útil de voz: ~85 Hz a ~4 kHz dentro de los bins de la FFT.
      const nyquist = context.sampleRate / 2;
      const firstBin = Math.max(1, Math.floor((85 / nyquist) * freqBuffer.length));
      const lastBin = Math.min(
        freqBuffer.length - 1,
        Math.ceil((4000 / nyquist) * freqBuffer.length),
      );
      const binsPerBand = Math.max(1, Math.floor((lastBin - firstBin) / SPECTRUM_BANDS));

      vaultSignals.state = "listening";
      setStatus("listening");

      const tick = () => {
        // Nivel global (RMS) para brillo/intensidad.
        analyser.getByteTimeDomainData(timeBuffer);
        let sum = 0;
        for (let i = 0; i < timeBuffer.length; i += 1) {
          const centered = (timeBuffer[i] - 128) / 128;
          sum += centered * centered;
        }
        const rms = Math.sqrt(sum / timeBuffer.length);
        vaultSignals.level = Math.min(rms * 4, 1);

        // Espectro por bandas (graves→agudos) para el ecualizador de la esfera.
        analyser.getByteFrequencyData(freqBuffer);
        for (let band = 0; band < SPECTRUM_BANDS; band += 1) {
          const start = firstBin + band * binsPerBand;
          let acc = 0;
          for (let i = 0; i < binsPerBand; i += 1) acc += freqBuffer[start + i] ?? 0;
          const value = acc / binsPerBand / 255;
          // Suavizado: sube rápido, baja con inercia (look de ecualizador).
          const previous = vaultSignals.spectrum[band];
          vaultSignals.spectrum[band] = value > previous ? value : previous * 0.82;
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (error) {
      // Distinguir la causa real: permiso vs hardware vs ocupado.
      const name = (error as DOMException).name;
      if (name === "NotAllowedError" || name === "SecurityError") setStatus("denied");
      else if (name === "NotFoundError" || name === "OverconstrainedError") setStatus("nodevice");
      else if (name === "NotReadableError" || name === "AbortError") setStatus("busy");
      else setStatus("error");
      vaultSignals.state = "idle";
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { start, status, stop };
}

"use client";

import { useEffect, useRef } from "react";
import { vaultSignals } from "@/app/components/vault-core/signals";
import { SPECTRUM_BANDS } from "@/app/components/vault-core/types";
import { useReducedMotion } from "@/app/components/useReducedMotion";

/**
 * Sintetizador visual del Audio I/O: barras de espectro (graves→agudos) que
 * se encienden y mueven con la voz, dibujadas por frame desde
 * vaultSignals.spectrum. En reposo respira una línea base tenue.
 * Sirve igual para tu voz (mic) y para el TTS del asistente (Sprint 4).
 */
export default function VoiceVisualizer({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let raf = 0;
    const heights = new Float32Array(SPECTRUM_BANDS);

    const draw = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const gap = 4;
      const barWidth = (width - gap * (SPECTRUM_BANDS - 1)) / SPECTRUM_BANDS;
      const baseline = height - 3;

      for (let i = 0; i < SPECTRUM_BANDS; i += 1) {
        // En reposo: respiración tenue; hablando: espectro real con caída suave.
        const idle = reducedMotion ? 0.05 : 0.05 + 0.03 * Math.sin(time / 900 + i * 0.7);
        const target = activeRef.current
          ? Math.max(vaultSignals.spectrum[i] ?? 0, idle)
          : idle;
        heights[i] = target > heights[i] ? target : heights[i] * 0.86;

        const barHeight = Math.max(2, heights[i] * (height - 8));
        const x = i * (barWidth + gap);
        const intensity = heights[i];

        context.shadowColor = `rgba(240, 207, 134, ${Math.min(intensity * 1.4, 0.9)})`;
        context.shadowBlur = 6 + intensity * 14;
        context.fillStyle = `rgba(${215 + intensity * 40}, ${172 + intensity * 60}, ${
          100 + intensity * 90
        }, ${0.35 + intensity * 0.65})`;
        context.fillRect(x, baseline - barHeight, barWidth, barHeight);

        // Punta brillante estilo sintetizador.
        if (intensity > 0.1) {
          context.fillStyle = `rgba(243, 237, 224, ${Math.min(intensity, 0.95)})`;
          context.fillRect(x, baseline - barHeight - 1, barWidth, 2);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return <canvas className="voiceSynth" ref={canvasRef} />;
}

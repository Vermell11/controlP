"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { vaultSignals } from "@/app/components/vault-core/signals";
import { SPECTRUM_BANDS } from "@/app/components/vault-core/types";

export function useTts() {
  const [speaking, setSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    vaultSignals.level = 0;
    vaultSignals.spectrum.fill(0);
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      stop();
      if (!("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-CO";
      utterance.rate = 1;
      utterance.onend = () => {
        stop();
        onEnd?.();
      };
      utterance.onerror = () => {
        stop();
        onEnd?.();
      };
      setSpeaking(true);
      let phase = 0;
      // Web Speech no expone su AudioNode; esta envolvente mantiene el mismo
      // contrato visual sin fingir análisis acústico del audio sintetizado.
      timerRef.current = setInterval(() => {
        phase += 0.35;
        vaultSignals.level = 0.55;
        for (let index = 0; index < SPECTRUM_BANDS; index += 1) {
          vaultSignals.spectrum[index] = 0.22 + Math.abs(Math.sin(phase + index * 0.71)) * 0.48;
        }
      }, 80);
      window.speechSynthesis.speak(utterance);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);
  return { speak, speaking, stop };
}

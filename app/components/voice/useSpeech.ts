"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractWakeCommand, stripWakePrefix } from "@/lib/assistant";

/** Tipos mínimos de Web Speech API (no vienen en lib.dom). */
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionConstructor = new () => SpeechRecognitionLike;

function getRecognition(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const candidate = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null;
}

/**
 * Transcripción en vivo (Web Speech API, es-CO) para push-to-talk.
 * `interim` muestra lo que va oyendo; `onFinal` entrega cada frase terminada.
 */
export function useSpeech(onFinal: (transcript: string) => void, onWake: (hasInlineCommand: boolean) => void) {
  const [interim, setInterim] = useState("");
  // false en servidor Y en el primer render del cliente (hidratación
  // idéntica); la detección real ocurre tras montar.
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  const onWakeRef = useRef(onWake);
  const modeRef = useRef<"wake" | "armed" | "manual">("wake");
  const wakeEnabledRef = useRef(true);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRecognitionRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    // Detección de API de navegador post-hidratación (patrón deliberado:
    // el servidor no tiene window; hidratar igual y corregir tras montar).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(getRecognition() !== null);
  }, []);

  useEffect(() => {
    onFinalRef.current = onFinal;
    onWakeRef.current = onWake;
  }, [onFinal, onWake]);

  const startRecognition = useCallback(() => {
    if (recognitionRef.current) return;
    const Recognition = getRecognition();
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "es-CO";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript.trim();
          if (!finalText) continue;
          if (modeRef.current === "manual") {
            onFinalRef.current(finalText);
            continue;
          }
          if (modeRef.current === "armed") {
            if (armedTimerRef.current) clearTimeout(armedTimerRef.current);
            modeRef.current = "wake";
            onFinalRef.current(stripWakePrefix(finalText));
            continue;
          }
          const command = extractWakeCommand(finalText);
          if (command === undefined) continue;
          onWakeRef.current(Boolean(command));
          if (command) onFinalRef.current(command);
          else {
            modeRef.current = "armed";
            armedTimerRef.current = setTimeout(() => {
              modeRef.current = "wake";
              setInterim("");
            }, 8_000);
          }
        } else if (modeRef.current !== "wake") {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText.trim());
    };
    recognition.onerror = ({ error }) => {
      if (error === "not-allowed" || error === "service-not-allowed") wakeEnabledRef.current = false;
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setInterim("");
      if (wakeEnabledRef.current && modeRef.current !== "manual") {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => startRecognitionRef.current(), 300);
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setInterim("");
      if (wakeEnabledRef.current && modeRef.current !== "manual") {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => startRecognitionRef.current(), 300);
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
    }
  }, []);
  useEffect(() => {
    startRecognitionRef.current = startRecognition;
    wakeEnabledRef.current = true;
    startRecognition();
    const resumeWake = () => {
      if (modeRef.current === "manual") return;
      wakeEnabledRef.current = true;
      startRecognitionRef.current();
    };
    window.addEventListener("pointerdown", resumeWake);
    window.addEventListener("focus", resumeWake);
    return () => {
      window.removeEventListener("pointerdown", resumeWake);
      window.removeEventListener("focus", resumeWake);
      wakeEnabledRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (armedTimerRef.current) clearTimeout(armedTimerRef.current);
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [startRecognition]);

  const start = useCallback(() => {
    modeRef.current = "manual";
    startRecognitionRef.current();
  }, []);

  const stop = useCallback(() => {
    modeRef.current = "wake";
    wakeEnabledRef.current = true;
    const current = recognitionRef.current;
    recognitionRef.current = null;
    current?.stop();
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => startRecognitionRef.current(), 150);
    setInterim("");
  }, []);

  const pauseWake = useCallback(() => {
    if (modeRef.current === "manual") return;
    wakeEnabledRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  const resumeWake = useCallback(() => {
    modeRef.current = "wake";
    wakeEnabledRef.current = true;
    const current = recognitionRef.current;
    recognitionRef.current = null;
    current?.stop();
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => startRecognitionRef.current(), 150);
  }, []);

  return { interim, pauseWake, resumeWake, start, stop, supported };
}

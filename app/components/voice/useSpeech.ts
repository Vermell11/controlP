"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
export function useSpeech(onFinal: (transcript: string) => void) {
  const [interim, setInterim] = useState("");
  // false en servidor Y en el primer render del cliente (hidratación
  // idéntica); la detección real ocurre tras montar.
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    // Detección de API de navegador post-hidratación (patrón deliberado:
    // el servidor no tiene window; hidratar igual y corregir tras montar).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(getRecognition() !== null);
  }, []);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const start = useCallback(() => {
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
          if (finalText) onFinalRef.current(finalText);
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText.trim());
    };
    recognition.onerror = () => setInterim("");
    recognition.onend = () => setInterim("");
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setInterim("");
  }, []);

  return { interim, start, stop, supported };
}

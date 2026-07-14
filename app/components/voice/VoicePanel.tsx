"use client";

import "./voice.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { vaultSignals } from "@/app/components/vault-core/signals";
import type { PanelProps } from "@/app/components/panels/types";
import { routeCommand, type VoiceAction } from "./commands";
import { useMicLevel } from "./useMicLevel";
import { useSpeech } from "./useSpeech";
import { useWhisper } from "./useWhisper";
import VoiceVisualizer from "./VoiceVisualizer";

type SttProvider = "whisper" | "webspeech";

const PROVIDER_KEY = "controlp.stt.provider";

const STATUS_TEXT: Record<string, string> = {
  busy: "micrófono ocupado por otra app — ciérrala y reintenta",
  denied:
    "permiso denegado — candado en la barra de direcciones → Micrófono → Permitir; en macOS: Ajustes → Privacidad → Micrófono → Chrome",
  error: "error de audio — revisa la consola y reintenta",
  idle: "standby · mantén presionado para hablar",
  insecure: "requiere localhost o https (contexto seguro)",
  listening: "escuchando…",
  nodevice: "sin micrófono detectado — revisa el dispositivo de entrada",
  transcribing: "transcribiendo con Whisper…",
  unsupported: "este navegador no soporta captura de audio",
};

/**
 * AUDIO I/O — Voz (V1.4.2). Push-to-talk con dos proveedores STT
 * intercambiables: Whisper local (sidecar faster-whisper, preciso, transcribe
 * al soltar) y Web Speech (interim en vivo, menos preciso). Si el sidecar no
 * responde, cae automáticamente a Web Speech. El nivel/espectro de voz anima
 * el núcleo vía vaultSignals; las frases pasan por el router de reglas
 * (Sprint 4 lo reemplaza por el asistente LLM).
 */
export default function VoicePanel({ projects }: PanelProps) {
  const [log, setLog] = useState<{ text: string; kind: "heard" | "action" | "hint" }[]>([]);
  const [holding, setHolding] = useState(false);
  const [provider, setProvider] = useState<SttProvider>("webspeech");
  const holdingRef = useRef(false);
  const providerRef = useRef<SttProvider>("webspeech");
  const mic = useMicLevel();

  // Proveedor persistido; default whisper si el usuario ya lo eligió antes.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROVIDER_KEY) as SttProvider | null;
      if (saved === "whisper" || saved === "webspeech") {
        // Init post-hidratación desde localStorage (patrón deliberado).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProvider(saved);
        providerRef.current = saved;
      }
    } catch {
      /* default webspeech */
    }
  }, []);

  const pushLog = (text: string, kind: "heard" | "action" | "hint") => {
    setLog((previous) => [...previous.slice(-4), { kind, text }]);
  };

  const execute = useCallback(async (action: VoiceAction) => {
    vaultSignals.state = "processing";
    setTimeout(() => {
      vaultSignals.state = holdingRef.current ? "listening" : "idle";
    }, 700);

    switch (action.type) {
      case "formation":
        vaultSignals.formation = action.formation;
        vaultSignals.healthScroll = 0;
        pushLog(action.label, "action");
        break;
      case "navigate":
        pushLog(action.label, "action");
        window.location.assign(action.href);
        break;
      case "enqueue":
        try {
          await fetch("/api/intents", {
            body: JSON.stringify({ command: action.command, source: "voice" }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          pushLog(action.label, "action");
        } catch {
          pushLog("error al encolar el comando", "hint");
        }
        break;
      default:
        pushLog(action.hint, "hint");
    }
  }, []);

  const handleTranscript = useCallback(
    async (transcript: string) => {
      pushLog(`«${transcript}»`, "heard");
      // await tolera router síncrono (reglas, hoy) o asíncrono (LLM, Sprint
      // 4): reemplazar el router no requiere tocar este panel.
      void execute(await routeCommand(transcript, projects));
    },
    [execute, projects],
  );

  const speech = useSpeech(handleTranscript);
  const whisper = useWhisper(handleTranscript, (message) => {
    pushLog(`${message} — usando Web Speech esta vez`, "hint");
  });

  const press = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    void mic.start();
    if (providerRef.current === "whisper") void whisper.start();
    else speech.start();
  }, [mic, speech, whisper]);

  const release = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    mic.stop();
    if (providerRef.current === "whisper") whisper.stop();
    else speech.stop();
  }, [mic, speech, whisper]);

  const toggleProvider = () => {
    const next: SttProvider = provider === "whisper" ? "webspeech" : "whisper";
    setProvider(next);
    providerRef.current = next;
    try {
      window.localStorage.setItem(PROVIDER_KEY, next);
    } catch {
      /* sin persistencia */
    }
    pushLog(
      next === "whisper"
        ? "proveedor: Whisper local (requiere stt/run.sh corriendo)"
        : "proveedor: Web Speech (nube de Google)",
      "hint",
    );
  };

  // Tecla V como push-to-talk global (fuera de inputs).
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (event.key.toLowerCase() === "v" && !event.repeat) press();
    };
    const up = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "v") release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [press, release]);

  const statusText = holding
    ? STATUS_TEXT.listening
    : whisper.busy
      ? STATUS_TEXT.transcribing
      : STATUS_TEXT[mic.status] ?? STATUS_TEXT.idle;

  return (
    <>
      <div className="panelTitle">
        <strong>Audio I/O</strong>
        <button
          className="providerToggle"
          onClick={toggleProvider}
          title="Cambiar proveedor de transcripción"
          type="button"
        >
          {provider === "whisper" ? "whisper.local" : "web.speech"}
        </button>
      </div>

      <button
        className={`voiceSynthDeck${holding ? " live" : ""}${whisper.busy ? " thinking" : ""}`}
        onContextMenu={(event) => event.preventDefault()}
        onPointerCancel={release}
        onPointerDown={press}
        onPointerLeave={release}
        onPointerUp={release}
        type="button"
      >
        <VoiceVisualizer active={holding} />
        <span className="synthLabel">
          {holding ? "● REC" : whisper.busy ? "◌ STT" : "HOLD · PTT"}
        </span>
      </button>
      <div className="voiceStatus">
        <b>{statusText}</b>
        <small>mantén presionado el sintetizador — o la tecla V</small>
      </div>

      {speech.interim && <p className="voiceInterim">{speech.interim}…</p>}

      {log.length > 0 && (
        <div className="voiceLog">
          {log.map((entry, index) => (
            <p className={`voice-${entry.kind}`} key={`${entry.text}-${index}`}>
              {entry.text}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import "./voice.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { vaultSignals } from "@/app/components/vault-core/signals";
import type { PanelProps } from "@/app/components/panels/types";
import { routeCommand, type VoiceAction } from "./commands";
import { useMicLevel } from "./useMicLevel";
import { useSpeech } from "./useSpeech";

const STATUS_TEXT: Record<string, string> = {
  busy: "micrófono ocupado por otra app — ciérrala y reintenta",
  denied:
    "permiso denegado — candado en la barra de direcciones → Micrófono → Permitir; en macOS: Ajustes → Privacidad → Micrófono → Chrome",
  error: "error de audio — revisa la consola y reintenta",
  idle: "standby · mantén presionado para hablar",
  insecure: "requiere localhost o https (contexto seguro)",
  listening: "escuchando…",
  nodevice: "sin micrófono detectado — revisa el dispositivo de entrada",
  unsupported: "este navegador no soporta captura de audio",
};

/**
 * AUDIO I/O — Voz I (V1.4). Push-to-talk: mantener presionado el botón
 * (o la tecla V) activa micrófono + transcripción; al soltar, se apaga.
 * El nivel de voz anima el núcleo vía vaultSignals; las frases finales pasan
 * por el router de reglas (Sprint 4 lo reemplaza por el asistente LLM).
 */
export default function VoicePanel({ projects }: PanelProps) {
  const [log, setLog] = useState<{ text: string; kind: "heard" | "action" | "hint" }[]>([]);
  const [holding, setHolding] = useState(false);
  const holdingRef = useRef(false);
  const mic = useMicLevel();

  const pushLog = (text: string, kind: "heard" | "action" | "hint") => {
    setLog((previous) => [...previous.slice(-4), { kind, text }]);
  };

  const execute = useCallback(
    async (action: VoiceAction) => {
      vaultSignals.state = "processing";
      setTimeout(() => {
        if (!holdingRef.current) vaultSignals.state = "idle";
        else vaultSignals.state = "listening";
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
    },
    [],
  );

  const speech = useSpeech((transcript) => {
    pushLog(`«${transcript}»`, "heard");
    void execute(routeCommand(transcript, projects));
  });

  const press = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    void mic.start();
    speech.start();
  }, [mic, speech]);

  const release = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    mic.stop();
    speech.stop();
  }, [mic, speech]);

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
    : STATUS_TEXT[mic.status] ?? STATUS_TEXT.idle;

  return (
    <>
      <div className="panelTitle">
        <strong>Audio I/O</strong>
        <span>{speech.supported ? "voice.link" : "sin speech api"}</span>
      </div>

      <div className="voiceDeck">
        <button
          className={`pttButton${holding ? " live" : ""}`}
          onContextMenu={(event) => event.preventDefault()}
          onPointerCancel={release}
          onPointerDown={press}
          onPointerLeave={release}
          onPointerUp={release}
          type="button"
        >
          {holding ? "● REC" : "HOLD · PTT"}
        </button>
        <div className="voiceStatus">
          <b>{statusText}</b>
          <small>tecla V — mantener para hablar</small>
        </div>
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

"use client";

import "./voice.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { vaultSignals } from "@/app/components/vault-core/signals";
import type { PanelProps } from "@/app/components/panels/types";
import { routeCommand, type VoiceAction, type VoiceAlias } from "./commands";
import type { AssistantResponse } from "@/lib/assistant";
import { useMicLevel } from "./useMicLevel";
import { useSpeech } from "./useSpeech";
import { useWhisper } from "./useWhisper";
import { useTts } from "./useTts";
import VoiceVisualizer from "./VoiceVisualizer";
import type { CoreState } from "@/app/components/vault-core/types";

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
  processing: "procesando comando…",
  speaking: "respondiendo…",
  success: "comando completado",
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
  const [feedback, setFeedback] = useState<CoreState>("idle");
  const [aliases, setAliases] = useState<VoiceAlias[]>([]);
  const [pendingAlias, setPendingAlias] = useState<{ alias: string; target: string } | null>(null);
  const holdingRef = useRef(false);
  const providerRef = useRef<SttProvider>("webspeech");
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mic = useMicLevel();
  const tts = useTts();

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

  useEffect(() => {
    void fetch("/api/assistant/aliases")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { aliases?: VoiceAlias[] }) => setAliases(data.aliases ?? []))
      .catch(() => undefined);
  }, []);

  const pushLog = (text: string, kind: "heard" | "action" | "hint") => {
    setLog((previous) => [...previous.slice(-4), { kind, text }]);
  };

  const setTemporaryFeedback = useCallback((state: "success" | "error") => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback(state);
    feedbackTimerRef.current = setTimeout(() => setFeedback("idle"), 900);
  }, []);

  const presentResponse = useCallback(
    (response: AssistantResponse, navigate = false) => {
      pushLog(response.displayText, "action");
      for (const evidence of response.evidence) pushLog(`fuente: ${evidence.label}`, "hint");
      tts.speak(response.speechText, () => {
        if (navigate && response.navigation) window.location.assign(response.navigation.href);
        else setTemporaryFeedback("success");
      });
    },
    [setTemporaryFeedback, tts],
  );

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    },
    [],
  );

  const execute = useCallback(async (action: VoiceAction) => {
    setFeedback("processing");

    switch (action.type) {
      case "formation":
        vaultSignals.formation = action.formation;
        vaultSignals.healthScroll = 0;
        presentResponse(action.response);
        break;
      case "navigate":
        presentResponse(action.response, true);
        break;
      case "enqueue":
        try {
          const response = await fetch("/api/intents", {
            body: JSON.stringify({ command: action.command, source: "voice" }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          if (!response.ok) throw new Error(`intent queue responded ${response.status}`);
          presentResponse(action.response);
        } catch {
          pushLog("error al encolar el comando", "hint");
          setTemporaryFeedback("error");
        }
        break;
      case "query":
        try {
          const response = await fetch("/api/assistant/query", {
            body: JSON.stringify({ query: action.query }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          if (!response.ok) throw new Error(`assistant responded ${response.status}`);
          presentResponse((await response.json()) as AssistantResponse, true);
        } catch {
          pushLog("no pude consultar la memoria autorizada", "hint");
          setTemporaryFeedback("error");
        }
        break;
      case "propose-alias":
        setPendingAlias({ alias: action.alias, target: action.target });
        presentResponse(action.response);
        break;
      default:
        pushLog(action.response.displayText, "hint");
        tts.speak(action.response.speechText);
        setTemporaryFeedback("error");
    }
  }, [presentResponse, setTemporaryFeedback, tts]);

  const handleTranscript = useCallback(
    async (transcript: string) => {
      pushLog(`«${transcript}»`, "heard");
      // await tolera router síncrono (reglas, hoy) o asíncrono (LLM, Sprint
      // 4): reemplazar el router no requiere tocar este panel.
      void execute(await routeCommand(transcript, projects, aliases));
    },
    [aliases, execute, projects],
  );

  const speech = useSpeech(handleTranscript);
  const whisper = useWhisper(handleTranscript, (message) => {
    pushLog(`${message} — usando Web Speech esta vez`, "hint");
  });

  const press = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    tts.stop();
    setHolding(true);
    void mic.start();
    if (providerRef.current === "whisper") void whisper.start();
    else speech.start();
  }, [mic, speech, tts, whisper]);

  const confirmAlias = async () => {
    if (!pendingAlias) return;
    setFeedback("processing");
    try {
      const response = await fetch("/api/assistant/aliases", {
        body: JSON.stringify({ ...pendingAlias, confirmed: true }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error(`aliases responded ${response.status}`);
      const { saved } = (await response.json()) as { saved: VoiceAlias };
      setAliases((current) => [...current.filter((item) => item.alias !== saved.alias), saved]);
      setPendingAlias(null);
      presentResponse({
        displayText: `Alias guardado: “${saved.alias}” → “${saved.target}”.`,
        evidence: [{ label: "registro auditable de alias", source: "registry" }],
        speechText: `Alias guardado. ${saved.alias} ahora significa ${saved.target}.`,
      });
    } catch {
      pushLog("no pude guardar el alias", "hint");
      setTemporaryFeedback("error");
    }
  };

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
      : tts.speaking
        ? STATUS_TEXT.speaking
      : feedback !== "idle"
        ? STATUS_TEXT[feedback]
        : STATUS_TEXT[mic.status] ?? STATUS_TEXT.idle;
  const voiceState: CoreState = holding
    ? "listening"
    : whisper.busy
      ? "transcribing"
      : tts.speaking
        ? "speaking"
      : ["busy", "denied", "error", "insecure", "nodevice", "unsupported"].includes(mic.status)
        ? "error"
        : feedback;

  useEffect(() => {
    vaultSignals.state = voiceState;
  }, [voiceState]);

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
        className="voiceSynthDeck"
        data-state={voiceState}
        onContextMenu={(event) => event.preventDefault()}
        onPointerCancel={release}
        onPointerDown={press}
        onPointerLeave={release}
        onPointerUp={release}
        type="button"
      >
        <VoiceVisualizer active={holding || tts.speaking} />
        <span className="synthLabel">
          {holding ? "● REC" : whisper.busy ? "◌ STT" : "HOLD · PTT"}
        </span>
      </button>
      <div aria-live="polite" className="voiceStatus" role="status">
        <b>{statusText}</b>
        <small>mantén presionado el sintetizador — o la tecla V</small>
      </div>

      {speech.interim && <p className="voiceInterim">{speech.interim}…</p>}

      {pendingAlias && (
        <div className="voiceConfirm" role="group" aria-label="Confirmar alias de voz">
          <p>“{pendingAlias.alias}” → “{pendingAlias.target}”</p>
          <button onClick={() => void confirmAlias()} type="button">Confirmar</button>
          <button onClick={() => setPendingAlias(null)} type="button">Cancelar</button>
        </div>
      )}

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

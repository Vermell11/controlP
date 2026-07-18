"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FeedView,
  InboxView,
  MetricsView,
  PlanView,
  ScheduleView,
  TrendView,
  type DeckView,
} from "./DeckViews";
import type { PanelProps } from "./types";

/** Comandos-vista: efecto inmediato en el display del deck. */
const VIEW_COMMANDS: { command: string; view: DeckView }[] = [
  { command: "Metrics Pull", view: "metrics" },
  { command: "Trend Scan", view: "trend" },
  { command: "Inbox Brief", view: "inbox" },
  { command: "Plan Today", view: "plan" },
  { command: "Schedule", view: "schedule" },
  { command: "System Feed", view: "feed" },
];

/** Comandos-intent: encolan para el runner (Sprint 3/4). */
const QUEUE_COMMANDS = ["WK Review", "AM Report", "GH Trending", "Vault Clean"];

const VIEW_TITLE: Record<DeckView, string> = {
  inbox: "Inbox Brief",
  metrics: "Metrics Pull",
  plan: "Plan Today",
  schedule: "Schedule",
  feed: "System Feed",
  trend: "Trend Scan",
};

/**
 * Command Deck operativo: los comandos-vista transforman el display del panel
 * (métricas, tendencias, inbox, plan); los comandos-intent encolan para el
 * runner con feedback honesto. El contador enlaza a /queue.
 */
export default function CommandDeckPanel({ projects }: PanelProps) {
  const activeCount = projects.filter((project) => project.openSession).length;
  const [queued, setQueued] = useState<number | null>(null);
  const [view, setView] = useState<DeckView | null>(null);
  const [queueFeedback, setQueueFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/intents");
      const data = (await response.json()) as { count: number };
      setQueued(data.count);
    } catch {
      setQueued(null);
    }
  }, []);

  useEffect(() => {
    // Patrón deliberado: cargar el contador real de la cola tras montar;
    // el setState ocurre tras un await, no sincrónicamente en el efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("deck");
    if (requested && Object.hasOwn(VIEW_TITLE, requested)) {
      // Estado derivado de la URL tras hidratación.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(requested as DeckView);
    }
    const showVoiceView = (event: Event) => {
      const next = (event as CustomEvent<DeckView>).detail;
      if (!Object.hasOwn(VIEW_TITLE, next)) return;
      event.preventDefault();
      setQueueFeedback(null);
      setView(next);
    };
    const closeVoiceView = (event: Event) => {
      event.preventDefault();
      setView(null);
    };
    window.addEventListener("controlp:deck-view", showVoiceView);
    window.addEventListener("controlp:deck-close", closeVoiceView);
    return () => {
      window.removeEventListener("controlp:deck-view", showVoiceView);
      window.removeEventListener("controlp:deck-close", closeVoiceView);
    };
  }, []);

  const enqueue = async (command: string) => {
    setQueueFeedback(`${command} → encolando…`);
    try {
      await fetch("/api/intents", {
        body: JSON.stringify({ command }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      await refresh();
      setQueueFeedback(`${command} → en cola para el runner (Sprint 3)`);
    } catch {
      setQueueFeedback(`${command} → error al encolar`);
    }
  };

  return (
    <>
      <div className="panelTitle">
        <strong>Command Deck</strong>
        <a className="queueLink" href="/queue" title="Ver la cola de intents">
          {`${activeCount} active · ${queued ?? "–"} queued`}
        </a>
      </div>

      <div className="commandDeck">
        {VIEW_COMMANDS.map(({ command, view: commandView }) => (
          <button
            className={view === commandView ? "viewActive" : ""}
            key={command}
            onClick={() => {
              setQueueFeedback(null);
              setView(view === commandView ? null : commandView);
            }}
            type="button"
          >
            {command}
          </button>
        ))}
        {QUEUE_COMMANDS.map((command) => (
          <button key={command} onClick={() => void enqueue(command)} type="button">
            {command}
          </button>
        ))}
      </div>

      {queueFeedback && (
        <p className="deckFeedback">
          {queueFeedback}
          {" · "}
          <a href="/queue">ver cola</a>
        </p>
      )}

      {view && (
        <div className="deckDisplay">
          <div className="deckDisplayHead">
            <strong>{VIEW_TITLE[view]}</strong>
            <button aria-label="Cerrar vista" onClick={() => setView(null)} type="button">
              ✕
            </button>
          </div>
          {view === "metrics" && <MetricsView projects={projects} />}
          {view === "trend" && <TrendView />}
          {view === "inbox" && <InboxView projects={projects} />}
          {view === "plan" && <PlanView projects={projects} />}
          {view === "schedule" && <ScheduleView projects={projects} />}
          {view === "feed" && <FeedView projects={projects} />}
        </div>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import type { PanelProps } from "./types";

const COMMANDS = [
  "Metrics Pull",
  "Inbox Brief",
  "Trend Scan",
  "Plan Today",
  "WK Review",
  "AM Report",
  "GH Trending",
  "Vault Clean",
] as const;

/**
 * Command Deck operativo: cada botón encola un intent en /api/intents
 * (runtime/intents.jsonl). El contador "queued" refleja la cola real.
 */
export default function CommandDeckPanel({ projects }: PanelProps) {
  const activeCount = projects.filter((project) => project.openSession).length;
  const [queued, setQueued] = useState<number | null>(null);
  const [sent, setSent] = useState<string | null>(null);

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
    void refresh();
  }, [refresh]);

  const send = async (command: string) => {
    setSent(command);
    try {
      await fetch("/api/intents", {
        body: JSON.stringify({ command }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      await refresh();
    } finally {
      setTimeout(() => setSent(null), 1400);
    }
  };

  return (
    <>
      <div className="panelTitle">
        <strong>Command Deck</strong>
        <span>{`${activeCount} active · ${queued ?? "–"} queued`}</span>
      </div>
      <div className="commandDeck">
        {COMMANDS.map((command) => (
          <button
            className={sent === command ? "sent" : ""}
            key={command}
            onClick={() => void send(command)}
            type="button"
          >
            {command}
          </button>
        ))}
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import PanelTitle from "@/app/components/ui/PanelTitle";
import type { PanelProps } from "./types";

const storageKey = () => `controlp.schedule.${new Date().toISOString().slice(0, 10)}`;

/**
 * Agenda interactiva: click marca/desmarca un ítem como hecho.
 * Persistencia por día en localStorage (estado efímero de UI, no del sistema).
 */
export default function SchedulePanel({ projects }: PanelProps) {
  const items = projects
    .slice(0, 5)
    .map((project) => ({ challenge: project.currentChallenge, name: project.name }));
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      // Patrón deliberado: localStorage solo existe en cliente; hidratar
      // primero vacío y cargar el estado guardado tras montar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* estado limpio si el almacenamiento falla */
    }
  }, []);

  const toggle = (name: string) => {
    setDone((previous) => {
      const next = { ...previous, [name]: !previous[name] };
      try {
        window.localStorage.setItem(storageKey(), JSON.stringify(next));
      } catch {
        /* sin persistencia, el toggle sigue funcionando en memoria */
      }
      return next;
    });
  };

  return (
    <>
      <PanelTitle title="Schedule" meta="today" />
      <div className="schedule">
        {items.map((item, index) => (
          <div
            className={`${index === 0 && !done[item.name] ? "now" : ""}${done[item.name] ? " done" : ""}`}
            key={item.name}
            onClick={() => toggle(item.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") toggle(item.name);
            }}
          >
            <time>{`${9 + index * 2}:30`}</time>
            <p>{item.challenge}</p>
          </div>
        ))}
      </div>
    </>
  );
}

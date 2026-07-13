"use client";

import { useEffect, useState } from "react";
import PanelTitle from "@/app/components/ui/PanelTitle";
import { vaultSignals } from "@/app/components/vault-core/signals";
import type { PanelProps } from "./types";

function Vital({
  label,
  value,
  note,
  href,
  onClick,
  active,
}: {
  label: string;
  value: string | number;
  note: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const body = (
    <>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span>{note}</span>
      <i />
    </>
  );

  if (href) {
    return (
      <a className="vital" href={href}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <div
        className={`vital vitalAction${active ? " active" : ""}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter") onClick();
        }}
      >
        {body}
      </div>
    );
  }
  return <div className="vital">{body}</div>;
}

/**
 * Vitals interactivos: Project Health alterna la formación 3D de los nodos
 * (órbita ↔ ranking por salud); Open Sessions e Intents navegan a su destino.
 */
export default function VitalsPanel({ projects }: PanelProps) {
  const active = projects.filter((project) => /activo/i.test(project.status)).length;
  const open = projects.filter((project) => project.openSession).length;
  const dirty = projects.filter((project) => project.git.dirty).length;
  const graphified = projects.filter((project) => project.graphify.present).length;
  const unresolved = projects.filter((project) => !project.resolved).length;
  const signals = projects.reduce(
    (total, project) => total + (project.graphify.nodes ?? 0) + (project.graphify.edges ?? 0),
    0,
  );
  const avgHealth = projects.length
    ? Math.round(projects.reduce((total, project) => total + project.health, 0) / projects.length)
    : 0;
  const openProject = projects.find((project) => project.openSession);

  const [ranking, setRanking] = useState(false);
  const [queued, setQueued] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/intents");
        const data = (await response.json()) as { count: number };
        setQueued(data.count);
      } catch {
        /* sin cola visible */
      }
    })();
  }, []);

  const toggleFormation = () => {
    const next = !ranking;
    setRanking(next);
    vaultSignals.formation = next ? "health" : "orbit";
  };

  return (
    <>
      <PanelTitle title="System Vitals" meta="trace.link" />
      <Vital
        active={ranking}
        label="Project Health"
        note={ranking ? "ranking 3D · tap para orbitar" : `${active} active · tap: ranking 3D`}
        onClick={toggleFormation}
        value={`${avgHealth}%`}
      />
      <Vital label="Vault Projects" value={projects.length} note={`${unresolved} unresolved`} />
      <Vital label="Graphify Nodes" value={graphified} note={`${signals || 0} signals`} />
      <Vital
        href={openProject ? `/p/${openProject.slug}` : undefined}
        label="Open Sessions"
        note={open > 0 ? `${dirty} dirty · abrir ficha` : `${dirty} dirty repos`}
        value={open}
      />
      <Vital
        href="/queue"
        label="Intents Queued"
        note="ver cola del runner"
        value={queued ?? "–"}
      />
    </>
  );
}

"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import PanelTitle from "@/app/components/ui/PanelTitle";
import { vaultSignals } from "@/app/components/vault-core/signals";
import type { NodeFormation } from "@/app/components/vault-core/types";
import type { PanelProps } from "./types";

function fillStyle(value: number): CSSProperties {
  return { "--fill": `${Math.max(0, Math.min(100, Math.round(value)))}%` } as CSSProperties;
}

function Vital({
  label,
  value,
  note,
  href,
  onClick,
  active,
  fill,
}: {
  label: string;
  value: string | number;
  note: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  fill: number;
}) {
  const body = (
    <>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span>{note}</span>
      <i style={fillStyle(fill)} />
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
 * Vitals interactivos: Project Health abre el diagnóstico vertical; Vault
 * Projects devuelve el mapa a la órbita. Open Sessions e Intents navegan.
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

  const [formation, setFormation] = useState<NodeFormation>("orbit");
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

  const showHealth = () => {
    const next = formation === "health" ? "orbit" : "health";
    setFormation(next);
    vaultSignals.formation = next;
    if (next === "health") vaultSignals.healthScroll = 0;
  };

  const showVault = () => {
    const next = formation === "grid" ? "orbit" : "grid";
    setFormation(next);
    vaultSignals.formation = next;
    vaultSignals.healthScroll = 0;
  };

  return (
    <>
      <PanelTitle title="System Vitals" meta="trace.link" />
      <Vital
        active={formation === "health"}
        fill={avgHealth}
        label="Project Health"
        note={formation === "health" ? "scroll: diagnóstico vertical" : `${active} active · tap: health list`}
        onClick={showHealth}
        value={`${avgHealth}%`}
      />
      <Vital
        active={formation === "grid"}
        fill={projects.length ? ((projects.length - unresolved) / projects.length) * 100 : 0}
        label="Vault Projects"
        note={formation === "grid" ? "grid por salud · tap: órbita" : `${unresolved} unresolved · tap: grid`}
        onClick={showVault}
        value={projects.length}
      />
      <Vital
        fill={projects.length ? (graphified / projects.length) * 100 : 0}
        label="Graphify Nodes"
        value={graphified}
        note={`${signals || 0} signals`}
      />
      <Vital
        fill={projects.length ? (open / projects.length) * 100 : 0}
        href={openProject ? `/p/${openProject.slug}` : undefined}
        label="Open Sessions"
        note={open > 0 ? `${dirty} dirty · abrir ficha` : `${dirty} dirty repos`}
        value={open}
      />
      <Vital
        fill={queued === null ? 0 : Math.min(queued * 10, 100)}
        href="/queue"
        label="Intents Queued"
        note="ver cola del runner"
        value={queued ?? "–"}
      />
    </>
  );
}

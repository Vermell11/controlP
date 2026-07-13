"use client";

import { useEffect, useState } from "react";
import { ScheduleBody } from "./SchedulePanel";
import type { PanelProps } from "./types";
import { WireBody } from "./WirePanel";

export type DeckView = "metrics" | "trend" | "inbox" | "plan" | "schedule" | "feed";

function sessionParts(value: string) {
  const date = value.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "sin fecha";
  const version = value.match(/V\d+(?:\.\d+)*/i)?.[0] ?? "sin versión";
  return `${date} · ${version}`;
}

function daysSince(value: string | null) {
  if (!value) return "sin ritmo";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  return `${days}d sin commit`;
}

function formatHours(minutes: number) {
  if (minutes <= 0) return "0h";
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

/** Metrics Pull: operación compacta por proyecto — sesiones, tiempo, versión y ritmo. */
export function MetricsView({ projects }: PanelProps) {
  return (
    <div className="metricOps">
      {projects.map((project) => (
        <div className="metricOpsRow" key={project.id}>
          <div className="metricOpsProject">
            <b>{project.name}</b>
          </div>
          <div>
            <small>sesiones</small>
            <strong>{project.sessionCount}</strong>
          </div>
          <div>
            <small>horas</small>
            <strong>{formatHours(project.totalSessionMinutes)}</strong>
          </div>
          <div>
            <small>última</small>
            <span>{sessionParts(project.latestSession)}</span>
          </div>
          <div>
            <small>tag · ritmo</small>
            <span>{`${project.git.latestTag ?? "sin tag"} · ${daysSince(project.git.latestCommitDate)}`}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TrendData {
  days: number;
  projects: { slug: string; name: string; days: number[] | null; total: number | null }[];
}

/** Trend Scan: commits por día (14d) por proyecto, sparkline SVG. */
export function TrendView() {
  const [data, setData] = useState<TrendData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/metrics");
        setData((await response.json()) as TrendData);
      } catch {
        setFailed(true);
      }
    })();
  }, []);

  if (failed) return <p className="deckNote">No se pudo leer la actividad de commits.</p>;
  if (!data) return <p className="deckNote">Leyendo actividad de commits…</p>;

  return (
    <div className="deckMetrics">
      {data.projects.map((project) => (
        <div className="deckMetric" key={project.slug}>
          <div className="deckMetricHead">
            <b>{project.name}</b>
            <span>
              {project.total === null ? "sin repo local" : `${project.total} commits · 14d`}
            </span>
          </div>
          {project.days && <Sparkline series={project.days} />}
        </div>
      ))}
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  const max = Math.max(...series, 1);
  const width = 220;
  const height = 26;
  const step = width / (series.length - 1 || 1);
  const points = series
    .map((value, index) => `${index * step},${height - 2 - (value / max) * (height - 6)}`)
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" points={points} strokeWidth="1.5" />
      {series.map((value, index) =>
        value > 0 ? (
          <circle
            cx={index * step}
            cy={height - 2 - (value / max) * (height - 6)}
            key={index}
            r="1.8"
          />
        ) : null,
      )}
    </svg>
  );
}

/** Inbox Brief: alertas e issues del protocolo de verdad, por proyecto. */
export function InboxView({ projects }: PanelProps) {
  const withAlerts = projects.filter((project) => project.alerts.length > 0);
  if (withAlerts.length === 0) return <p className="deckNote">Sin alertas: todo en orden.</p>;

  return (
    <div className="deckInbox">
      {withAlerts.map((project) => (
        <div key={project.id}>
          <b>{project.name}</b>
          <ul>
            {project.alerts.map((alert) => (
              <li className={/rota/i.test(alert) ? "broken" : ""} key={alert}>
                {alert}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Plan Today: el plan del día en modo lectura (se marca en la vista Schedule). */
export function PlanView({ projects }: PanelProps) {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/schedule");
        const plan = (await response.json()) as { done: Record<string, boolean> };
        setDone(plan.done ?? {});
      } catch {
        /* plan vacío */
      }
    })();
  }, []);

  return (
    <div className="deckPlan">
      {projects.slice(0, 5).map((project) => (
        <div className={done[project.slug] ? "done" : ""} key={project.id}>
          <b>{done[project.slug] ? "✓" : "○"}</b>
          <div>
            <span className="directiveProject">{project.name}</span>
            {" — "}
            {project.nextStep}
          </div>
        </div>
      ))}
      <p className="deckNote">Marca avances desde la vista Schedule.</p>
    </div>
  );
}

export function ScheduleView({ projects }: PanelProps) {
  return <ScheduleBody projects={projects} />;
}

export function FeedView({ projects }: PanelProps) {
  return <WireBody projects={projects} />;
}

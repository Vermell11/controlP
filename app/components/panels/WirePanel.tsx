import { formatDate } from "@/lib/ui";
import type { PanelProps } from "./types";

interface FeedEntry {
  text: string;
  tone: "info" | "warn" | "alert";
  sortKey: string;
}

/**
 * System Feed: el telégrafo del sistema. Commits recientes, sesiones abiertas
 * y alertas reales (incluidas fuentes rotas del protocolo de verdad).
 * Aquí caerán también las notificaciones del asistente (Sprint 4).
 */
export function WireBody({ projects }: PanelProps) {
  const entries: FeedEntry[] = [];

  for (const project of projects) {
    if (project.git.latestCommit && project.git.latestCommitDate) {
      entries.push({
        sortKey: project.git.latestCommitDate,
        text: `${project.name} · ${project.git.latestCommit} · ${formatDate(project.git.latestCommitDate)}`,
        tone: "info",
      });
    }
    if (project.openSession) {
      entries.push({
        sortKey: "9998",
        text: `${project.name} · sesión abierta (${project.latestSession})`,
        tone: "warn",
      });
    }
    for (const issue of project.issues) {
      if (issue.level === "broken") {
        entries.push({
          sortKey: "9999",
          text: `${project.name} · fuente rota: ${issue.source}/${issue.field}`,
          tone: "alert",
        });
      }
    }
    if (project.git.dirty) {
      entries.push({
        sortKey: "9997",
        text: `${project.name} · cambios sin commit`,
        tone: "warn",
      });
    }
  }

  const feed = entries
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .slice(0, 8);

  return (
    <div className="wire">
      {feed.length === 0 ? (
        <p>Sin señales todavía: el sistema está en silencio.</p>
      ) : (
        feed.map((entry, index) => (
          <p className={`feed-${entry.tone}`} key={`${entry.text}-${index}`}>
            {entry.text}
          </p>
        ))
      )}
    </div>
  );
}

/** Utilidades de presentación compartidas entre server y client components. */

export function tone(score: number): "good" | "warn" | "bad" {
  if (score >= 80) return "good";
  if (score >= 55) return "warn";
  return "bad";
}

/** Deep link a la nota del proyecto en la bóveda Cerebro. */
export function obsidianUrl(projectName: string): string {
  return `obsidian://open?vault=Cerebro&file=${encodeURIComponent(`Proyectos/${projectName}/Resumen`)}`;
}

export function formatDate(value: string | null): string {
  if (!value) return "sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

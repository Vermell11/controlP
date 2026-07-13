import { NextResponse } from "next/server";
import { readCommitActivity } from "@/lib/adapters/evidence-git";
import { loadRegistry } from "@/lib/registry";

const DAYS = 14;

/**
 * Tendencia de actividad: commits por día (últimos 14) por proyecto,
 * vía el adaptador de evidencia. Consumido por la vista Trend Scan del deck.
 */
export async function GET() {
  const { entries } = await loadRegistry();
  const projects = await Promise.all(
    entries.map(async (entry) => {
      const series = entry.sources.repoPath
        ? await readCommitActivity(entry.sources.repoPath, DAYS)
        : null;
      return {
        days: series,
        name: entry.displayName,
        slug: entry.slug,
        total: series ? series.reduce((sum, value) => sum + value, 0) : null,
      };
    }),
  );

  return NextResponse.json({ days: DAYS, projects });
}

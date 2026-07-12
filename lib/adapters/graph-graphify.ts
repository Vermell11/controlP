import { promises as fs } from "node:fs";
import path from "node:path";
import type { DataIssue, ProjectGraph } from "../schema";

/**
 * Adaptador del rol GRAFO sobre Graphify (reemplazable).
 * Un graph.json ilegible es "broken" (antes se silenciaba como presente-vacío).
 */
export interface GraphReading {
  graphify: ProjectGraph;
  issues: DataIssue[];
}

export async function readGraph(repoPath: string | null): Promise<GraphReading> {
  const issues: DataIssue[] = [];

  if (!repoPath) return { graphify: emptyGraph(), issues };

  const graphPath = path.join(repoPath, "graphify-out", "graph.json");
  let raw: string;
  try {
    raw = await fs.readFile(graphPath, "utf8");
  } catch {
    issues.push({ field: "graph.json", level: "missing", source: "graph" });
    return { graphify: emptyGraph(), issues };
  }

  try {
    const stat = await fs.stat(graphPath);
    const graph = JSON.parse(raw) as { nodes?: unknown[]; edges?: unknown[]; links?: unknown[] };
    const edges = graph.edges ?? graph.links;
    return {
      graphify: {
        edges: edges?.length ?? null,
        nodes: graph.nodes?.length ?? null,
        present: true,
        updated: stat.mtime.toISOString(),
      },
      issues,
    };
  } catch (error) {
    issues.push({
      detail: (error as Error).message.split("\n")[0],
      field: "graph.json",
      level: "broken",
      source: "graph",
    });
    return { graphify: { edges: null, nodes: null, present: true, updated: null }, issues };
  }
}

export function emptyGraph(): ProjectGraph {
  return { edges: null, nodes: null, present: false, updated: null };
}

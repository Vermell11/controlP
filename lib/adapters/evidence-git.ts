import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { DataIssue, ProjectEvidence } from "../schema";

const execFileAsync = promisify(execFile);

/**
 * Adaptador del rol EVIDENCIA sobre Git (permanente, no reemplazable).
 * Distingue "no hay dato" (p. ej. repo sin tags) de "la lectura falló"
 * (permisos, repo corrupto): lo segundo genera issue "broken".
 */
export interface EvidenceReading {
  git: ProjectEvidence;
  issues: DataIssue[];
}

export async function readEvidence(repoPath: string | null): Promise<EvidenceReading> {
  const issues: DataIssue[] = [];

  if (!repoPath) {
    issues.push({ field: "repoPath", level: "missing", source: "evidence" });
    return { git: emptyEvidence(), issues };
  }

  if (!(await exists(path.join(repoPath, ".git")))) {
    issues.push({ field: ".git", level: "missing", source: "evidence" });
    return { git: emptyEvidence(), issues };
  }

  const [branch, status, commit, date, tag] = await Promise.all([
    git(repoPath, ["rev-parse", "--abbrev-ref", "HEAD"], issues, "branch"),
    git(repoPath, ["status", "--porcelain"], issues, "status"),
    git(repoPath, ["log", "-1", "--pretty=%h %s"], issues, "commit"),
    git(repoPath, ["log", "-1", "--pretty=%cI"], issues, "commitDate"),
    // Un repo sin tags no es un error: se tolera sin issue.
    git(repoPath, ["describe", "--tags", "--abbrev=0"], null, "tag"),
  ]);

  return {
    git: {
      branch,
      dirty: Boolean(status),
      latestCommit: commit,
      latestCommitDate: date,
      latestTag: tag,
      present: true,
    },
    issues,
  };
}

/**
 * Actividad de commits: conteo por día para los últimos `days` días
 * (índice 0 = el día más antiguo). null si la lectura falla.
 */
export async function readCommitActivity(
  repoPath: string,
  days: number,
): Promise<number[] | null> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["log", `--since=${days} days ago`, "--pretty=%cs"],
      { cwd: repoPath },
    );
    const counts = new Map<string, number>();
    for (const line of stdout.split("\n")) {
      const date = line.trim();
      if (date) counts.set(date, (counts.get(date) ?? 0) + 1);
    }
    const series: number[] = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
      series.push(counts.get(date) ?? 0);
    }
    return series;
  } catch {
    return null;
  }
}

async function git(
  cwd: string,
  args: string[],
  issues: DataIssue[] | null,
  field: string,
): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd });
    return stdout.trim() || null;
  } catch (error) {
    issues?.push({
      detail: `git ${args[0]}: ${(error as Error).message.split("\n")[0]}`,
      field,
      level: "broken",
      source: "evidence",
    });
    return null;
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export function emptyEvidence(): ProjectEvidence {
  return {
    branch: null,
    dirty: false,
    latestCommit: null,
    latestCommitDate: null,
    latestTag: null,
    present: false,
  };
}

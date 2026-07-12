import { promises as fs } from "node:fs";
import path from "node:path";
import { adapterConfig } from "./config";
import type { DataIssue } from "./schema";

/**
 * Registro explícito de proyectos: identidad estable (id/slug) + fuentes por
 * proveedor. Fuente: config/projects.json. Si falta o está roto, cae a
 * descubrimiento automático desde la bóveda (con issue registrado).
 */
export interface RegistryEntry {
  id: string;
  slug: string;
  displayName: string;
  sources: {
    obsidianFolder: string;
    repoPath: string | null;
    mirrors?: string[];
  };
}

const REGISTRY_FILE = path.join(process.cwd(), "config", "projects.json");

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function loadRegistry(): Promise<{ entries: RegistryEntry[]; issues: DataIssue[] }> {
  const issues: DataIssue[] = [];

  try {
    const raw = await fs.readFile(REGISTRY_FILE, "utf8");
    try {
      const parsed = JSON.parse(raw) as { projects?: RegistryEntry[] };
      const entries = (parsed.projects ?? []).filter(isValidEntry);
      const dropped = (parsed.projects?.length ?? 0) - entries.length;
      if (dropped > 0) {
        issues.push({
          detail: `${dropped} entradas inválidas ignoradas`,
          field: "projects",
          level: "broken",
          source: "registry",
        });
      }
      if (entries.length > 0) return { entries, issues };
    } catch (error) {
      issues.push({
        detail: `projects.json ilegible: ${(error as Error).message}`,
        field: "projects.json",
        level: "broken",
        source: "registry",
      });
    }
  } catch {
    issues.push({ field: "projects.json", level: "missing", source: "registry" });
  }

  const discovered = await discoverFromVault();
  return { entries: discovered, issues };
}

function isValidEntry(entry: unknown): entry is RegistryEntry {
  const candidate = entry as RegistryEntry;
  return Boolean(
    candidate &&
      typeof candidate.id === "string" &&
      typeof candidate.slug === "string" &&
      typeof candidate.displayName === "string" &&
      candidate.sources &&
      typeof candidate.sources.obsidianFolder === "string",
  );
}

/** Fallback: la bóveda como índice, igual que antes del registry. */
async function discoverFromVault(): Promise<RegistryEntry[]> {
  const projectsDir = path.join(adapterConfig.vaultRoot, "Proyectos");
  let names: string[] = [];
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    names = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }

  return Promise.all(
    names.map(async (name) => ({
      displayName: name,
      id: slugify(name),
      slug: slugify(name),
      sources: { obsidianFolder: name, repoPath: await resolveRepoPath(name) },
    })),
  );
}

async function resolveRepoPath(name: string): Promise<string | null> {
  for (const root of adapterConfig.projectRoots) {
    const direct = path.join(root, name);
    try {
      await fs.access(direct);
      return direct;
    } catch {
      /* siguiente raíz */
    }
  }
  return null;
}

import PanelTitle from "@/app/components/ui/PanelTitle";
import { formatDate, obsidianUrl } from "@/lib/ui";
import type { PanelProps } from "./types";

export default function DocumentsPanel({ projects }: PanelProps) {
  return (
    <>
      <PanelTitle title="Documents" meta="inbox.trail" />
      <div className="docTrail">
        {projects.map((project) => (
          <a
            href={obsidianUrl(project.obsidianFolder)}
            key={project.id}
            title={`Abrir ${project.name} en Obsidian`}
          >
            <span>{project.name}</span>
            <small>{project.openSession ? "now" : formatDate(project.git.latestCommitDate)}</small>
          </a>
        ))}
      </div>
    </>
  );
}

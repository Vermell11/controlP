import PanelTitle from "@/app/components/ui/PanelTitle";
import type { PanelProps } from "./types";

export default function DirectivesPanel({ projects }: PanelProps) {
  return (
    <>
      <PanelTitle title="Directives" meta="top.3" />
      <ul className="directives">
        {projects.slice(0, 3).map((project) => (
          <li key={project.name}>
            <span />
            {project.nextStep}
          </li>
        ))}
      </ul>
    </>
  );
}

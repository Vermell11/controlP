import PanelTitle from "@/app/components/ui/PanelTitle";
import type { PanelProps } from "./types";

/** Directivas: primero el proyecto (referencia), luego su siguiente paso. */
export default function DirectivesPanel({ projects }: PanelProps) {
  return (
    <>
      <PanelTitle title="Directives" meta="top.3" />
      <ul className="directives">
        {projects.slice(0, 3).map((project) => (
          <li key={project.id}>
            <span />
            <div>
              <b className="directiveProject">{project.name}</b>
              {" — "}
              {project.nextStep}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

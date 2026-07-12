import "./record.css";
import type { ProjectCard } from "@/lib/controlp";
import { formatDate, tone } from "@/lib/ui";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="recordFact">
      <small>{label}</small>
      <span>{value}</span>
    </div>
  );
}

/** Ficha completa de un proyecto (usada por las páginas /p/[proyecto]). */
export default function ProjectRecord({ project }: { project: ProjectCard }) {
  return (
    <article className="projectRecord" id={project.name}>
      <header>
        <div>
          <small>{project.status}</small>
          <h2>{project.name}</h2>
        </div>
        <strong className={tone(project.health)}>{project.health}</strong>
      </header>
      <p>{project.purpose}</p>
      <div className="recordGrid">
        <Fact label="Stack" value={project.stack} />
        <Fact label="Tag" value={project.git.latestTag ?? "sin tag"} />
        <Fact label="Commit" value={project.git.latestCommit ?? "sin commit"} />
        <Fact label="Branch" value={project.git.branch ?? "sin rama"} />
        <Fact
          label="Graph"
          value={
            project.graphify.present
              ? `${project.graphify.nodes ?? "?"}/${project.graphify.edges ?? "?"}`
              : "ausente"
          }
        />
        <Fact label="Updated" value={formatDate(project.git.latestCommitDate)} />
      </div>
      <div className="recordBody">
        <section>
          <h3>Reto</h3>
          <p>{project.currentChallenge}</p>
        </section>
        <section>
          <h3>Validación</h3>
          <p>{project.validation}</p>
        </section>
        <section>
          <h3>Siguiente</h3>
          <p>{project.nextStep}</p>
        </section>
      </div>
      <footer>
        <span>{project.latestSession}</span>
        <div>
          {project.alerts.map((alert) => (
            <b key={alert}>{alert}</b>
          ))}
        </div>
      </footer>
    </article>
  );
}

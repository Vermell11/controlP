import CenterStage from "@/app/components/CenterStage";
import { getProjects } from "@/lib/controlp";
import { formatDate, tone } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjects();
  const active = projects.filter((project) => /activo/i.test(project.status)).length;
  const open = projects.filter((project) => project.openSession).length;
  const dirty = projects.filter((project) => project.git.dirty).length;
  const graphified = projects.filter((project) => project.graphify.present).length;
  const unresolved = projects.filter((project) => !project.repoPath).length;
  const signals = projects.reduce(
    (total, project) => total + (project.graphify.nodes ?? 0) + (project.graphify.edges ?? 0),
    0,
  );
  const avgHealth = projects.length
    ? Math.round(projects.reduce((total, project) => total + project.health, 0) / projects.length)
    : 0;
  const primary = projects[0];

  return (
    <main className="vaultShell">
      <header className="vaultTop">
        <div className="brand">
          <h1>V.A.U.L.T.</h1>
          <p>Visual Agentic Unified Logic Terminal</p>
        </div>
        <div className="stateLine">
          <span>Core</span>
          <span>Idle</span>
          <span>Link</span>
          <span>Online</span>
          <span>Runner</span>
          <span>Alive</span>
        </div>
        <div className="timeBlock">
          <strong>{new Date().toLocaleTimeString("es-CO", { hour12: false })}</strong>
          <small>Local · Read only</small>
        </div>
      </header>

      <section className="osGrid">
        <aside className="leftPanel">
          <PanelTitle title="System Vitals" meta="trace.link" />
          <Vitals label="Project Health" value={`${avgHealth}%`} note={`${active} active`} />
          <Vitals label="Vault Projects" value={projects.length} note={`${unresolved} unresolved`} />
          <Vitals label="Graphify Nodes" value={graphified} note={`${signals || 0} signals`} />
          <Vitals label="Open Sessions" value={open} note={`${dirty} dirty repos`} />

          <PanelTitle title="Directives" meta="top.3" />
          <ul className="directives">
            {projects.slice(0, 3).map((project) => (
              <li key={project.name}>
                <span />
                {project.nextStep}
              </li>
            ))}
          </ul>

          <PanelTitle title="Documents" meta="inbox.trail" />
          <div className="docTrail">
            {projects.map((project) => (
              <a href={`#${project.name}`} key={project.name}>
                <span>{project.name}</span>
                <small>{project.openSession ? "now" : formatDate(project.git.latestCommitDate)}</small>
              </a>
            ))}
          </div>
        </aside>

        <section className="centerStage">
          <CenterStage
            nodes={projects.map((project) => ({ health: project.health, name: project.name }))}
          />

          <div className="primaryDirective">
            <small>Primary Directive · Road to connected project OS</small>
            <strong>{signals || projects.length * 135}</strong>
            <span>signals · {primary?.name ?? "No project"} leads current focus</span>
          </div>
        </section>

        <aside className="rightPanel">
          <PanelTitle title="Command Deck" meta={`${open} active · 0 queued`} />
          <div className="commandDeck">
            {[
              "Metrics Pull",
              "Inbox Brief",
              "Trend Scan",
              "Plan Today",
              "WK Review",
              "AM Report",
              "GH Trending",
              "Vault Clean",
            ].map((command) => (
              <button key={command} type="button">
                {command}
              </button>
            ))}
          </div>

          <PanelTitle title="Schedule" meta="today" />
          <div className="schedule">
            {projects.slice(0, 5).map((project, index) => (
              <div className={index === 0 ? "now" : ""} key={project.name}>
                <time>{`${9 + index * 2}:30`}</time>
                <p>{project.currentChallenge}</p>
              </div>
            ))}
          </div>

          <PanelTitle title="AI Wire" meta="morning.intel" />
          <div className="wire">
            <p>Obsidian is the project index. Git is evidence. Graphify is derived context.</p>
            <p>OneDrive copies should mirror the latest version only, never own change control.</p>
            <p>Notion remains the ledger; closing requires explicit human confirmation.</p>
          </div>
        </aside>
      </section>

      <section className="projectDeck">
        {projects.map((project) => (
          <article className="projectRecord" id={project.name} key={project.name}>
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
                value={project.graphify.present ? `${project.graphify.nodes ?? "?"}/${project.graphify.edges ?? "?"}` : "ausente"}
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
        ))}
      </section>
    </main>
  );
}

function PanelTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="panelTitle">
      <strong>{title}</strong>
      <span>{meta}</span>
    </div>
  );
}

function Vitals({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="vital">
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span>{note}</span>
      <i />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="recordFact">
      <small>{label}</small>
      <span>{value}</span>
    </div>
  );
}

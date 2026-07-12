import "../core.css";
import CenterStage from "@/app/components/CenterStage";
import Clock from "@/app/components/core/Clock";
import { leftPanels, rightPanels } from "@/app/components/panels/registry";
import { getProjects } from "@/lib/controlp";

export const dynamic = "force-dynamic";

/**
 * CORE — dashboard principal V.A.U.L.T.
 * Cerrado a modificación: los paneles se agregan vía el registry
 * (app/components/panels/registry.ts) y las funcionalidades nuevas viven en
 * rutas propias. Ver la regla de extensibilidad en AGENTS.md.
 */
export default async function Home() {
  const projects = await getProjects();
  const signals = projects.reduce(
    (total, project) => total + (project.graphify.nodes ?? 0) + (project.graphify.edges ?? 0),
    0,
  );
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
          <Clock />
          <small>Local · Read only</small>
        </div>
      </header>

      <section className="osGrid">
        <aside className="leftPanel">
          {leftPanels.map(({ Component, id }) => (
            <Component key={id} projects={projects} />
          ))}
        </aside>

        <section className="centerStage">
          <CenterStage
            nodes={projects.map((project) => ({
              health: project.health,
              name: project.name,
              slug: project.slug,
            }))}
          />

          <div className="primaryDirective">
            <small>Primary Directive · Road to connected project OS</small>
            <strong>{signals || projects.length * 135}</strong>
            <span>signals · {primary?.name ?? "No project"} leads current focus</span>
          </div>
        </section>

        <aside className="rightPanel">
          {rightPanels.map(({ Component, id }) => (
            <Component key={id} projects={projects} />
          ))}
        </aside>
      </section>
    </main>
  );
}

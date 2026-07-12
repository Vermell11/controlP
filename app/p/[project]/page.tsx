import "./project-page.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectRecord from "@/app/components/records/ProjectRecord";
import { getProjects } from "@/lib/controlp";
import { obsidianUrl } from "@/lib/ui";

export const dynamic = "force-dynamic";

/**
 * Ficha de proyecto como página secundaria (módulo fuera del core).
 * Los nodos 3D del dashboard navegan aquí.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: raw } = await params;
  const name = decodeURIComponent(raw);
  const projects = await getProjects();
  const project = projects.find((candidate) => candidate.name === name);

  if (!project) notFound();

  return (
    <main className="vaultShell recordPage">
      <header className="recordPageTop">
        <Link className="backLink" href="/">
          ← V.A.U.L.T.
        </Link>
        <a className="backLink" href={obsidianUrl(project.name)}>
          Obsidian ↗
        </a>
      </header>
      <ProjectRecord project={project} />
    </main>
  );
}

import "./project-page.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectRecord from "@/app/components/records/ProjectRecord";
import { getProjects } from "@/lib/controlp";
import { obsidianUrl } from "@/lib/ui";

export const dynamic = "force-dynamic";

/**
 * Ficha de proyecto como página secundaria (módulo fuera del core).
 * Identificada por slug estable del registry, no por el nombre visible.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((candidate) => candidate.slug === slug);

  if (!project) notFound();

  return (
    <main className="vaultShell recordPage">
      <header className="recordPageTop">
        <Link className="backLink" href="/">
          ← V.A.U.L.T.
        </Link>
        <a className="backLink" href={obsidianUrl(project.obsidianFolder)}>
          Obsidian ↗
        </a>
      </header>
      <ProjectRecord project={project} />
    </main>
  );
}

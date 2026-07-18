import type { ProjectCard } from "./schema";
import type { KnowledgeChunk } from "./assistant-rag";
import { readGraphContext } from "./adapters/graph-graphify";
import { readProjectSkills, readSkillBankKnowledge } from "./adapters/memory-obsidian";
import { loadRegistry } from "./registry";

export async function buildKnowledgeCorpus(projects: ProjectCard[]): Promise<KnowledgeChunk[]> {
  const { entries } = await loadRegistry();
  const projectChunks = await Promise.all(
    projects.map(async (project) => {
      const entry = entries.find(({ slug }) => slug === project.slug);
      const [skills, graph] = await Promise.all([
        readProjectSkills(project.obsidianFolder),
        readGraphContext(entry?.sources.repoPath ?? null),
      ]);
      const chunks: KnowledgeChunk[] = [
        {
          content: [
            `Estado: ${project.status}`,
            `Propósito: ${project.purpose}`,
            `Reto actual: ${project.currentChallenge}`,
            `Siguiente paso: ${project.nextStep}`,
            `Validación: ${project.validation}`,
            `Stack: ${project.stack}`,
            `Salud: ${project.health}%`,
            `Razones de salud: ${project.healthReasons?.join(", ") || "sin ajustes documentados"}`,
          ].join("\n"),
          id: `memory:${project.slug}`,
          kind: "canonical",
          label: `${project.name} · cápsula y Estado actual`,
        },
      ];
      if (skills.length > 0) {
        chunks.push({
          content: skills.map((skill) => `${skill.name} [${skill.type}]: ${skill.usage}`).join("\n"),
          id: `skills:${project.slug}`,
          kind: "canonical",
          label: `${project.name} · Skills.md`,
        });
      }
      chunks.push(...graph.map((section, index) => ({
        content: section.content,
        id: `graph:${project.slug}:${index}`,
        kind: "derived" as const,
        label: `${project.name} · Graphify · ${section.label}`,
      })));
      return chunks;
    }),
  );
  const bank = await readSkillBankKnowledge();
  return [
    ...projectChunks.flat(),
    ...bank.map((document, index) => ({
      content: document.content.slice(0, 8_000),
      id: `memory:skill-bank:${index}`,
      kind: "canonical" as const,
      label: `Banco de Skills · ${document.label}`,
    })),
  ];
}

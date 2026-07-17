import type { ProjectCard } from "./schema";

export interface AssistantEvidence {
  label: string;
  source: "memory" | "registry";
}

export interface AssistantResponse {
  displayText: string;
  speechText: string;
  evidence: AssistantEvidence[];
  navigation?: { href: string; label: string };
}

export interface ProjectSkill {
  name: string;
  type: string;
  usage: string;
}

const NOTE_NAMES: Record<string, string> = {
  backlog: "Backlog",
  estado: "Estado actual",
  roadmap: "Roadmap",
  resumen: "Resumen",
  skills: "Skills",
};

export function normalizeVoiceText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function compactVoiceText(text: string): string {
  return normalizeVoiceText(text).replace(/[^a-z0-9]+/g, "");
}

export function isHomeNavigation(text: string): boolean {
  const normalized = normalizeVoiceText(text);
  return /(volv|regres|llevame|vamos).*(inicio|pagina principal|principal|vault|v\W*a\W*u\W*l\W*t|control p)/.test(
    normalized,
  );
}

export function suggestProjectAlias<T extends { name: string }>(
  text: string,
  projects: T[],
): { alias: string; project: T } | undefined {
  const words = normalizeVoiceText(text).match(/[a-z0-9]+/g) ?? [];
  for (const word of words.filter((candidate) => candidate.length >= 3)) {
    const project = projects.find((candidate) => oneEditApart(word, compactVoiceText(candidate.name)));
    if (project) return { alias: word, project };
  }
}

function oneEditApart(left: string, right: string): boolean {
  if (left === right || Math.abs(left.length - right.length) > 1) return false;
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  let edits = 0;
  for (let short = 0, long = 0; long < longer.length; short += 1, long += 1) {
    if (shorter[short] === longer[long]) continue;
    edits += 1;
    if (edits > 1) return false;
    if (shorter.length !== longer.length) short -= 1;
  }
  return true;
}

export function findProject(text: string, projects: ProjectCard[]): ProjectCard | undefined {
  const heard = compactVoiceText(text);
  return projects.find((project) => {
    const name = compactVoiceText(project.name);
    const slug = compactVoiceText(project.slug);
    return (name && heard.includes(name)) || (slug && heard.includes(slug));
  });
}

export async function answerKnowledgeQuery(
  transcript: string,
  projects: ProjectCard[],
  readSkills: (obsidianFolder: string) => Promise<ProjectSkill[]>,
): Promise<AssistantResponse> {
  const text = normalizeVoiceText(transcript);
  const project = findProject(text, projects);

  if (/\bproyectos?\b/.test(text) && !project && /(cuales|lista|dime|muestra)/.test(text)) {
    const names = projects.map(({ name }) => name);
    return response(
      `Proyectos: ${names.join(", ")}.`,
      `Tienes ${names.length} proyectos: ${names.join(", ")}.`,
      [{ label: "registro de proyectos", source: "registry" }],
    );
  }

  if (!project) {
    return response(
      "No pude identificar el proyecto.",
      "No pude identificar el proyecto. Di su nombre completo.",
      [{ label: "registro de proyectos", source: "registry" }],
    );
  }

  const projectNavigation = { href: `/p/${project.slug}`, label: `Abrir ${project.name}` };

  if (/\bskills?\b/.test(text)) {
    const skills = await readSkills(project.obsidianFolder);
    if (skills.length === 0) {
      return response(
        `${project.name} no tiene skills documentadas.`,
        `${project.name} no tiene skills documentadas.`,
        [{ label: `${project.obsidianFolder}/Skills.md`, source: "memory" }],
        projectNavigation,
      );
    }
    const names = skills.map(({ name }) => name);
    return response(
      `${project.name} · Skills: ${names.join(", ")}.`,
      `${project.name} tiene ${names.length} grupos de skills: ${names.join(", ")}.`,
      [{ label: `${project.obsidianFolder}/Skills.md`, source: "memory" }],
      projectNavigation,
    );
  }

  if (/(siguiente paso|que sigue|proximo paso)/.test(text)) {
    return response(
      `${project.name} · Siguiente paso: ${project.nextStep}`,
      `El siguiente paso de ${project.name} es: ${project.nextStep}`,
      [{ label: `${project.obsidianFolder}/Estado actual.md`, source: "memory" }],
      projectNavigation,
    );
  }

  if (/\b(estado|status)\b/.test(text)) {
    return response(
      `${project.name} · Estado: ${project.status}. Reto: ${project.currentChallenge}`,
      `${project.name} está ${project.status}. Su reto actual es: ${project.currentChallenge}`,
      [{ label: `${project.obsidianFolder}/Estado actual.md`, source: "memory" }],
      projectNavigation,
    );
  }

  const note = Object.entries(NOTE_NAMES).find(([heard]) => text.includes(heard));
  if (note && /(abre|abrir|muestra|ver)/.test(text)) {
    const file = `Proyectos/${project.obsidianFolder}/${note[1]}`;
    return response(
      `Abriendo ${note[1]} de ${project.name}.`,
      `Abriendo ${note[1]} de ${project.name}.`,
      [{ label: `${file}.md`, source: "memory" }],
      {
        href: `obsidian://open?vault=Cerebro&file=${encodeURIComponent(file)}`,
        label: `Abrir ${note[1]} en Obsidian`,
      },
    );
  }

  return response(
    `Puedo consultar el estado, siguiente paso y skills de ${project.name}.`,
    `Puedo consultar el estado, siguiente paso y skills de ${project.name}.`,
    [{ label: "consulta estructurada", source: "registry" }],
    projectNavigation,
  );
}

function response(
  displayText: string,
  speechText: string,
  evidence: AssistantEvidence[],
  navigation?: AssistantResponse["navigation"],
): AssistantResponse {
  return { displayText, evidence, navigation, speechText };
}

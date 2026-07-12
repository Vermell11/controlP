import type { ProjectCard } from "@/lib/controlp";

/**
 * Contrato de los módulos de panel: todo panel recibe la lista de proyectos
 * y deriva internamente lo que necesita. Así el core no conoce el interior
 * de ningún panel y agregar uno nuevo no lo modifica.
 */
export interface PanelProps {
  projects: ProjectCard[];
}

import "./panels.css";
import type { ComponentType } from "react";
import CommandDeckPanel from "./CommandDeckPanel";
import DirectivesPanel from "./DirectivesPanel";
import DocumentsPanel from "./DocumentsPanel";
import type { PanelProps } from "./types";
import VitalsPanel from "./VitalsPanel";

export interface PanelEntry {
  id: string;
  Component: ComponentType<PanelProps>;
}

/**
 * Punto de extensión oficial del core (regla en AGENTS.md).
 * Para agregar un panel: crear el módulo en app/components/panels/ y
 * registrarlo aquí. El core (app/(core)/page.tsx) no se modifica.
 */
export const leftPanels: PanelEntry[] = [
  { Component: VitalsPanel, id: "vitals" },
  { Component: DirectivesPanel, id: "directives" },
  { Component: DocumentsPanel, id: "documents" },
];

export const rightPanels: PanelEntry[] = [
  { Component: CommandDeckPanel, id: "command-deck" },
];

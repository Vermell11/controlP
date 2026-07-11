"use client";

import dynamic from "next/dynamic";
import type { StageNode } from "./vault-core/types";

const VaultCore = dynamic(() => import("./vault-core/VaultCore"), {
  loading: () => <div className="coreGlow" />,
  ssr: false,
});

export type { StageNode };

/**
 * Centro del dashboard: núcleo 3D con los nodos de proyecto dentro de la
 * escena (orbitan con la esfera, hover pausa el giro, click navega al
 * registro #proyecto).
 */
export default function CenterStage({ nodes }: { nodes: StageNode[] }) {
  return (
    <div className="vaultGraph" aria-label="Mapa visual de proyectos">
      <div className="stars" />
      <div className="coreGlow" />
      <VaultCore nodes={nodes} />
      <div className="floorGrid" />
    </div>
  );
}

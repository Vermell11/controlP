"use client";

import "./center-stage.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { StageNode } from "./vault-core/types";

const VaultCore = dynamic(() => import("./vault-core/VaultCore"), { ssr: false });

export type { StageNode };

/**
 * Centro del dashboard: núcleo 3D con los nodos de proyecto dentro de la
 * escena (orbitan con la esfera, hover pausa el giro, click navega a
 * /p/[proyecto]).
 *
 * El canvas se monta solo tras la hidratación (flag `mounted`): así el HTML
 * del servidor y el primer render del cliente son idénticos y se evita el
 * error de hidratación del import dinámico.
 */
export default function CenterStage({ nodes }: { nodes: StageNode[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Patrón deliberado: montar el canvas solo tras la hidratación para que
    // el HTML del servidor y el primer render del cliente coincidan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="vaultGraph" aria-label="Mapa visual de proyectos">
      <div className="stars" />
      <div className="coreGlow" />
      {mounted ? <VaultCore nodes={nodes} /> : null}
      <div className="floorGrid" />
    </div>
  );
}

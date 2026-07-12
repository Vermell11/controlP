"use client";

import "./project-nodes.css";
import { useMemo, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { tone } from "@/lib/ui";
import { vaultSignals } from "./signals";
import type { StageNode } from "./types";

/** Colores en sync con las variables CSS (--green, --amber, --red). */
const TONE_COLORS = { bad: "#d97858", good: "#bcca74", warn: "#d7ac64" } as const;

const NODE_RADIUS = 9.6;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Distribución fibonacci: nodos repartidos uniformemente sobre la esfera. */
function nodePosition(index: number, total: number): [number, number, number] {
  const y = total === 1 ? 0 : 1 - (2 * (index + 0.5)) / total;
  const r = Math.sqrt(1 - y * y);
  const angle = GOLDEN_ANGLE * index;
  return [Math.cos(angle) * r * NODE_RADIUS, y * NODE_RADIUS * 0.72, Math.sin(angle) * r * NODE_RADIUS];
}

/** Ruta de la ficha del proyecto (página secundaria /p/[proyecto]). */
function projectPath(name: string) {
  return `/p/${encodeURIComponent(name)}`;
}

function goTo(name: string) {
  window.location.assign(projectPath(name));
}

function ProjectNode({ node, position }: { node: StageNode; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const health = tone(node.health);
  const scale = 0.75 + node.health / 200;

  const { baseColor, hoverColor } = useMemo(() => {
    const base = new THREE.Color(TONE_COLORS[health]);
    return { baseColor: base, hoverColor: base.clone().lerp(new THREE.Color("#ffffff"), 0.5) };
  }, [health]);

  const setHover = (value: boolean) => {
    setHovered(value);
    vaultSignals.hold = value;
  };

  return (
    <group position={position}>
      <mesh
        onClick={() => goTo(node.name)}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHover(false);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHover(true);
        }}
        scale={scale * (hovered ? 1.35 : 1)}
      >
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={hovered ? hoverColor : baseColor} />
      </mesh>
      <mesh scale={scale * (hovered ? 2.6 : 1.9)}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={baseColor} opacity={hovered ? 0.4 : 0.22} transparent />
      </mesh>
      <Html center distanceFactor={24} position={[0, 0.8 * scale, 0]} zIndexRange={[10, 5]}>
        <a
          className={`projectNode3d${hovered ? " isHover" : ""}`}
          href={projectPath(node.name)}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          {node.name}
        </a>
      </Html>
    </group>
  );
}

/**
 * Nodos de proyecto dentro de la escena: orbitan con el grupo padre.
 * Hover (sobre esfera o etiqueta) ilumina el nodo y pausa el giro;
 * click navega al registro #proyecto.
 */
export default function ProjectNodes({ nodes }: { nodes: StageNode[] }) {
  const positions = useMemo(
    () => nodes.map((_, index) => nodePosition(index, nodes.length)),
    [nodes],
  );

  return (
    <>
      {nodes.map((node, index) => (
        <ProjectNode key={node.name} node={node} position={positions[index]} />
      ))}
    </>
  );
}

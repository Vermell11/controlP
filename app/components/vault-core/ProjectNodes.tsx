"use client";

import "./project-nodes.css";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
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
function orbitPosition(index: number, total: number): [number, number, number] {
  const y = total === 1 ? 0 : 1 - (2 * (index + 0.5)) / total;
  const r = Math.sqrt(1 - y * y);
  const angle = GOLDEN_ANGLE * index;
  return [Math.cos(angle) * r * NODE_RADIUS, y * NODE_RADIUS * 0.72, Math.sin(angle) * r * NODE_RADIUS];
}

/**
 * Formación "health": ranking vertical frente a la esfera, mejor salud arriba.
 * `rank` es la posición en el orden descendente de salud.
 */
function healthPosition(rank: number, total: number): [number, number, number] {
  const span = Math.min((total - 1) * 3.5, 15);
  const top = span / 2;
  return [0, top - rank * (total > 1 ? span / (total - 1) : 0), 10.5];
}

/** Ruta de la ficha del proyecto (página secundaria /p/[slug]). */
function projectPath(slug: string) {
  return `/p/${slug}`;
}

function goTo(slug: string) {
  window.location.assign(projectPath(slug));
}

function ProjectNode({
  node,
  orbit,
  ranking,
}: {
  node: StageNode;
  orbit: [number, number, number];
  ranking: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const health = tone(node.health);
  const scale = 0.75 + node.health / 200;

  const { baseColor, hoverColor, orbitVec, rankingVec } = useMemo(() => {
    const base = new THREE.Color(TONE_COLORS[health]);
    return {
      baseColor: base,
      hoverColor: base.clone().lerp(new THREE.Color("#ffffff"), 0.5),
      orbitVec: new THREE.Vector3(...orbit),
      rankingVec: new THREE.Vector3(...ranking),
    };
  }, [health, orbit, ranking]);

  // Desplazamiento suave hacia la formación activa (leída por frame).
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = vaultSignals.formation === "health" ? rankingVec : orbitVec;
    groupRef.current.position.lerp(target, Math.min(delta * 3, 1));
  });

  const setHover = (value: boolean) => {
    setHovered(value);
    vaultSignals.hold = value;
  };

  return (
    <group position={orbit} ref={groupRef}>
      <mesh
        onClick={() => goTo(node.slug)}
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
          href={projectPath(node.slug)}
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
 * Nodos de proyecto dentro de la escena. Dos formaciones (vaultSignals):
 * "orbit" acompaña la esfera; "health" forma el ranking vertical por salud.
 * Hover ilumina y pausa el giro; click navega a /p/[slug].
 */
export default function ProjectNodes({ nodes }: { nodes: StageNode[] }) {
  const { orbits, rankings } = useMemo(() => {
    const byHealth = [...nodes].sort((a, b) => b.health - a.health);
    const rankBySlug = new Map(byHealth.map((node, rank) => [node.slug, rank]));
    return {
      orbits: nodes.map((_, index) => orbitPosition(index, nodes.length)),
      rankings: nodes.map((node) =>
        healthPosition(rankBySlug.get(node.slug) ?? 0, nodes.length),
      ),
    };
  }, [nodes]);

  return (
    <>
      {nodes.map((node, index) => (
        <ProjectNode key={node.slug} node={node} orbit={orbits[index]} ranking={rankings[index]} />
      ))}
    </>
  );
}

"use client";

import "./project-nodes.css";
import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { tone } from "@/lib/ui";
import { vaultSignals } from "./signals";
import type { StageNode } from "./types";

/** Colores en sync con las variables CSS (--green, --amber, --red). */
const TONE_COLORS = { bad: "#d97858", good: "#bcca74", warn: "#d7ac64" } as const;

/** Blanco cálido hacia el que brillan los orbes cuando el núcleo escucha. */
const WARM_WHITE = new THREE.Color("#fff6e0");

const NODE_RADIUS = 9.6;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Distribución fibonacci: nodos repartidos uniformemente sobre la esfera. */
function orbitPosition(index: number, total: number): [number, number, number] {
  const y = total === 1 ? 0 : 1 - (2 * (index + 0.5)) / total;
  const r = Math.sqrt(1 - y * y);
  const angle = GOLDEN_ANGLE * index;
  return [Math.cos(angle) * r * NODE_RADIUS, y * NODE_RADIUS * 0.72, Math.sin(angle) * r * NODE_RADIUS];
}

const HEALTH_GAP = 2.6;

/**
 * Formación "grid": matriz autosize frente a la esfera, ordenada por salud.
 * Plano más lejano (z=7) y separación amplia para que orbes y etiquetas
 * compactas no se solapen.
 */
function gridPosition(rank: number, total: number): [number, number, number] {
  const columns = Math.max(1, Math.ceil(Math.sqrt(total)));
  const rows = Math.max(1, Math.ceil(total / columns));
  const column = rank % columns;
  const row = Math.floor(rank / columns);

  return [
    (column - (columns - 1) / 2) * 4.6,
    ((rows - 1) / 2 - row) * 3.6,
    7,
  ];
}

/**
 * Formación "health": lista vertical escroleable con efecto lente de pez.
 * El orbe queda a la izquierda (x=-3) y su panel se abre a la derecha,
 * alineado con el orbe. Los ítems lejos del centro retroceden en Z (se ven
 * más pequeños y lejanos, como sobre una esfera).
 */
function healthPosition(rank: number, total: number, scroll: number): [number, number, number] {
  const centerRank = (total - 1) / 2 + scroll;
  const y = (centerRank - rank) * HEALTH_GAP;
  const z = 10.5 - Math.abs(y) * 0.55 - (y * y) * 0.05;
  return [-3, y, z];
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
  rank,
  total,
  reducedMotion,
}: {
  node: StageNode;
  orbit: [number, number, number];
  rank: number;
  total: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLAnchorElement>(null);
  const modeRef = useRef(vaultSignals.formation);
  const targetRef = useRef(new THREE.Vector3(...orbit));
  const scaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const smoothPosRef = useRef<THREE.Vector3 | null>(null);
  const haloRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const health = tone(node.health);
  const scale = 0.75 + node.health / 200;

  const { baseColor, hoverColor, orbitVec } = useMemo(() => {
    const base = new THREE.Color(TONE_COLORS[health]);
    return {
      baseColor: base,
      hoverColor: base.clone().lerp(new THREE.Color("#ffffff"), 0.5),
      orbitVec: new THREE.Vector3(...orbit),
    };
  }, [health, orbit]);

  // Desplazamiento suave hacia la formación activa (leída por frame).
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (labelRef.current && modeRef.current !== vaultSignals.formation) {
      modeRef.current = vaultSignals.formation;
      labelRef.current.dataset.mode = vaultSignals.formation;
    }
    const health = healthPosition(rank, total, vaultSignals.healthScroll);
    const grid = gridPosition(rank, total);
    const inHealth = vaultSignals.formation === "health";
    const target = inHealth
      ? targetRef.current.set(...health)
      : vaultSignals.formation === "grid"
        ? targetRef.current.set(...grid)
        : orbitVec;
    // Lente de pez: el ítem centrado domina; el resto se encoge con la
    // distancia al centro (además del retroceso en Z de healthPosition).
    const focus = inHealth
      ? Math.max(0, 1 - Math.abs(health[1]) / (HEALTH_GAP * 1.4))
      : 0;
    const targetScale = inHealth ? 0.6 + focus * 0.55 : 1;

    // Posición suave (sin jitter) + vibración de escucha encima.
    const smooth = (smoothPosRef.current ??= groupRef.current.position.clone());
    smooth.lerp(target, reducedMotion ? 1 : Math.min(delta * 3, 1));
    groupRef.current.position.copy(smooth);

    // Voz: cuando el núcleo escucha (hoy tu voz; mañana la respuesta del
    // asistente), los nodos BRILLAN con el nivel — sin moverse: el halo se
    // intensifica y el orbe se aclara hacia blanco cálido.
    const listening = vaultSignals.state !== "idle" ? vaultSignals.level : 0;
    if (haloRef.current) {
      const baseOpacity = hovered ? 0.4 : 0.22;
      haloRef.current.opacity = Math.min(baseOpacity + listening * 0.5, 0.9);
    }
    if (coreMatRef.current) {
      coreMatRef.current.color
        .copy(hovered ? hoverColor : baseColor)
        .lerp(WARM_WHITE, Math.min(listening * 0.7, 0.7));
    }

    scaleRef.current.setScalar(targetScale);
    groupRef.current.scale.lerp(scaleRef.current, reducedMotion ? 1 : Math.min(delta * 6, 1));
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
        <meshBasicMaterial color={hovered ? hoverColor : baseColor} ref={coreMatRef} />
      </mesh>
      <mesh scale={scale * (hovered ? 2.6 : 1.9)}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial
          color={baseColor}
          opacity={hovered ? 0.4 : 0.22}
          ref={haloRef}
          transparent
        />
      </mesh>
      <Html center distanceFactor={24} position={[0, 0, 0]} zIndexRange={[10, 5]}>
        <a
          className={`projectNode3d ${health}${hovered ? " isHover" : ""}`}
          data-mode={vaultSignals.formation}
          href={projectPath(node.slug)}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          ref={labelRef}
          style={{ "--health": `${node.health}%` } as CSSProperties}
        >
          <span className="nodeName">{node.name}</span>
          <span className="nodeMeta">{node.meta}</span>
          <span className="healthTrack">
            <i />
          </span>
          <b className="healthLabel">{`salud ${node.health}%`}</b>
        </a>
      </Html>
    </group>
  );
}

/**
 * Nodos de proyecto dentro de la escena. Formaciones (vaultSignals):
 * "orbit" acompaña la esfera; "grid" organiza por salud; "health" abre
 * diagnóstico vertical con barras.
 * Hover ilumina y pausa el giro; click navega a /p/[slug].
 */
export default function ProjectNodes({
  nodes,
  reducedMotion,
}: {
  nodes: StageNode[];
  reducedMotion: boolean;
}) {
  const { orbits, ranks } = useMemo(() => {
    const byHealth = [...nodes].sort((a, b) => b.health - a.health);
    const rankBySlug = new Map(byHealth.map((node, rank) => [node.slug, rank]));
    return {
      orbits: nodes.map((_, index) => orbitPosition(index, nodes.length)),
      ranks: nodes.map((node) => rankBySlug.get(node.slug) ?? 0),
    };
  }, [nodes]);

  return (
    <>
      {nodes.map((node, index) => (
        <ProjectNode
          key={node.slug}
          node={node}
          orbit={orbits[index]}
          rank={ranks[index]}
          total={nodes.length}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  );
}

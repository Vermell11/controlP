"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ParticleCore from "./ParticleCore";
import type { StageNode } from "./types";

/**
 * Canvas 3D del núcleo. Se monta solo en cliente (importado con ssr: false).
 * Cuando exista el hook de micrófono, escribirá en `vaultSignals` (signals.tsx)
 * y la escena reaccionará sin cambios aquí.
 */
export default function VaultCore({ nodes }: { nodes: StageNode[] }) {
  // Solo cliente (ssr: false): en pantallas angostas la cámara arranca más
  // lejos para que toda la esfera y sus nodos entren en el encuadre.
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 700;

  return (
    <div className="vaultCanvas">
      <Canvas
        camera={{ fov: 42, position: [0, 0, isNarrow ? 44 : 24] }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ParticleCore nodes={nodes} />
        <OrbitControls
          dampingFactor={0.08}
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={52}
          minDistance={13}
          rotateSpeed={0.5}
          target={isNarrow ? [0, -5.5, 0] : [0, 0, 0]}
          zoomSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}

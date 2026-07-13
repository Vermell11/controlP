"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ParticleCore from "./ParticleCore";
import { vaultSignals } from "./signals";
import type { StageNode } from "./types";

interface ManagedControls {
  enableZoom?: boolean;
  enableRotate?: boolean;
  target?: THREE.Vector3;
}

/**
 * Director de cámara: en las formaciones grid/health la cámara vuelve
 * suavemente a su posición "home" (sin importar cómo la haya orbitado el
 * usuario) y se bloquean rotación/zoom — la rueda pasa a ser scroll de la
 * lista. En órbita, control libre.
 */
function CameraDirector({
  home,
  homeTarget,
}: {
  home: [number, number, number];
  homeTarget: [number, number, number];
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => (state as { controls?: ManagedControls }).controls);
  const homeVec = useMemo(() => new THREE.Vector3(...home), [home]);
  const targetVec = useMemo(() => new THREE.Vector3(...homeTarget), [homeTarget]);

  useFrame((_, delta) => {
    const managed = vaultSignals.formation !== "orbit";
    if (controls) {
      controls.enableRotate = !managed;
      controls.enableZoom = !managed;
    }
    if (managed) {
      const step = Math.min(delta * 2.5, 1);
      camera.position.lerp(homeVec, step);
      controls?.target?.lerp(targetVec, step);
    }
  });
  return null;
}

/**
 * Canvas 3D del núcleo. Se monta solo en cliente (importado con ssr: false).
 * Cuando exista el hook de micrófono, escribirá en `vaultSignals` (signals.tsx)
 * y la escena reaccionará sin cambios aquí.
 */
export default function VaultCore({ nodes }: { nodes: StageNode[] }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  // Solo cliente (ssr: false): en pantallas angostas la cámara arranca más
  // lejos para que toda la esfera y sus nodos entren en el encuadre.
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 700;
  const maxHealthScroll = Math.max((nodes.length - 1) / 2, 0);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const onWheel = (event: globalThis.WheelEvent) => {
      if (vaultSignals.formation !== "health") return;
      event.preventDefault();
      event.stopPropagation();
      vaultSignals.healthScroll = Math.max(
        -maxHealthScroll,
        Math.min(maxHealthScroll, vaultSignals.healthScroll + event.deltaY / 280),
      );
    };
    // Captura en el contenedor: intercepta antes que OrbitControls (canvas).
    element.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => element.removeEventListener("wheel", onWheel, { capture: true });
  }, [maxHealthScroll]);

  return (
    <div className="vaultCanvas" ref={canvasRef}>
      <Canvas
        camera={{ fov: 42, position: [0, 0, isNarrow ? 44 : 24] }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <CameraDirector
          home={[0, 0, isNarrow ? 44 : 24]}
          homeTarget={isNarrow ? [0, -5.5, 0] : [0, 0, 0]}
        />
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

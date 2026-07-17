"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ParticleCore from "./ParticleCore";
import { useReducedMotion } from "@/app/components/useReducedMotion";
import { vaultSignals } from "./signals";
import type { StageNode } from "./types";

const CAMERA_FOV = 42;
const FRAME_RADIUS = 10.5;
const CAMERA_TARGET: [number, number, number] = [0, -1.25, 0];

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
  homeTarget,
  reducedMotion,
}: {
  homeTarget: [number, number, number];
  reducedMotion: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => (state as { controls?: ManagedControls }).controls);
  const size = useThree((state) => state.size);
  const initialized = useRef(false);
  const lastSize = useRef({ height: 0, width: 0 });
  const aspect = size.width / Math.max(size.height, 1);
  const distance =
    (FRAME_RADIUS * 1.08) /
    (Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * Math.min(aspect, 1));
  const homeVec = useMemo(() => new THREE.Vector3(0, 0, distance), [distance]);
  const targetVec = useMemo(() => new THREE.Vector3(...homeTarget), [homeTarget]);

  useFrame((_, delta) => {
    const managed = vaultSignals.formation !== "orbit";
    const resized = lastSize.current.width !== size.width || lastSize.current.height !== size.height;
    if (resized && (managed || !initialized.current)) {
      camera.position.copy(homeVec);
      controls?.target?.copy(targetVec);
      initialized.current = true;
    }
    if (resized) {
      lastSize.current = size;
    }

    if (controls) {
      controls.enableRotate = !managed;
      controls.enableZoom = !managed;
    }
    if (managed) {
      const step = reducedMotion ? 1 : Math.min(delta * 2.5, 1);
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
  const reducedMotion = useReducedMotion();
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
        camera={{ fov: CAMERA_FOV, position: [0, 0, 32] }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <CameraDirector homeTarget={CAMERA_TARGET} reducedMotion={reducedMotion} />
        <ParticleCore nodes={nodes} reducedMotion={reducedMotion} />
        <OrbitControls
          dampingFactor={0.08}
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={68}
          minDistance={13}
          rotateSpeed={0.5}
          target={CAMERA_TARGET}
          zoomSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}

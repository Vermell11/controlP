"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createLinkSegments, createParticleField } from "./geometry";
import ProjectNodes from "./ProjectNodes";
import { useVaultSignals } from "./signals";
import { STATE_PRESETS, type StageNode } from "./types";

const PARTICLE_COUNT = 2600;
const CORE_RADIUS = 9;
const LINK_DISTANCE = 1.7;

const GOLD = new THREE.Color("#d7ac64");
const PALE = new THREE.Color("#f3ede0");

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uPulseSpeed;
  varying float vGlow;

  void main() {
    float twinkle = 0.62 + 0.38 * sin(uTime * uPulseSpeed + aPhase);
    vGlow = twinkle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float size = aSize * twinkle * (1.0 + uIntensity * 0.9);
    gl_PointSize = size * (140.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, d);
    vec3 color = mix(uColorA, uColorB, vGlow * 0.8 + uIntensity * 0.2);
    gl_FragColor = vec4(color, alpha * (0.5 + vGlow * 0.5));
  }
`;

/**
 * Núcleo: nube de partículas doradas + red de conexiones + nodos de proyecto.
 * Todo rota como un solo grupo; la intensidad y velocidad reaccionan a
 * VaultSignals (voz en el futuro) y el hover sobre un nodo pausa el giro.
 */
export default function ParticleCore({ nodes }: { nodes: StageNode[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const intensityRef = useRef(STATE_PRESETS.idle.baseIntensity);
  const spinRef = useRef(1);
  const signals = useVaultSignals();

  const { pointsGeometry, linesGeometry } = useMemo(() => {
    const field = createParticleField(PARTICLE_COUNT, CORE_RADIUS);

    const points = new THREE.BufferGeometry();
    points.setAttribute("position", new THREE.BufferAttribute(field.positions, 3));
    points.setAttribute("aSize", new THREE.BufferAttribute(field.sizes, 1));
    points.setAttribute("aPhase", new THREE.BufferAttribute(field.phases, 1));

    const lines = new THREE.BufferGeometry();
    lines.setAttribute(
      "position",
      new THREE.BufferAttribute(createLinkSegments(field.positions, LINK_DISTANCE), 3),
    );

    return { pointsGeometry: points, linesGeometry: lines };
  }, []);

  const pointsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        uniforms: {
          uColorA: { value: GOLD },
          uColorB: { value: PALE },
          uIntensity: { value: STATE_PRESETS.idle.baseIntensity },
          uPulseSpeed: { value: STATE_PRESETS.idle.pulseSpeed },
          uTime: { value: 0 },
        },
        vertexShader: VERTEX_SHADER,
      }),
    [],
  );

  const linesMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: GOLD,
        depthWrite: false,
        opacity: 0.14,
        transparent: true,
      }),
    [],
  );

  useFrame((state, delta) => {
    const { state: coreState, level, hold, formation } = signals;
    const preset = STATE_PRESETS[coreState];

    // Intensidad objetivo = base del estado + energía externa (voz futura).
    const target = Math.min(preset.baseIntensity + level, 1.6);
    intensityRef.current = THREE.MathUtils.lerp(intensityRef.current, target, delta * 4);

    // Frenado suave con hover o en formación ranking (y reanudación suave).
    const stopSpin = hold || formation === "health";
    spinRef.current = THREE.MathUtils.lerp(spinRef.current, stopSpin ? 0 : 1, delta * 6);

    pointsMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    pointsMaterial.uniforms.uIntensity.value = intensityRef.current;
    pointsMaterial.uniforms.uPulseSpeed.value = preset.pulseSpeed;
    linesMaterial.opacity = 0.1 + intensityRef.current * 0.12;

    if (groupRef.current) {
      // En ranking, el grupo vuelve suavemente a rotación 0 para que la
      // columna quede de frente a la cámara.
      if (formation === "health") {
        const twoPi = Math.PI * 2;
        let offset = groupRef.current.rotation.y % twoPi;
        if (offset > Math.PI) offset -= twoPi;
        if (offset < -Math.PI) offset += twoPi;
        groupRef.current.rotation.y -= offset * Math.min(delta * 3, 1);
      }
      groupRef.current.rotation.y += delta * preset.rotationSpeed * spinRef.current;
      // Respiración sutil, amplificada por la intensidad.
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015 * (1 + intensityRef.current);
      groupRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={pointsGeometry} material={pointsMaterial} />
      <lineSegments geometry={linesGeometry} material={linesMaterial} />
      <ProjectNodes nodes={nodes} />
    </group>
  );
}

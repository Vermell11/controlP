/**
 * Generación determinista de la nube de partículas y sus conexiones.
 * Funciones puras (sin Three.js) para poder testearlas y reutilizarlas.
 */

export interface ParticleField {
  positions: Float32Array;
  sizes: Float32Array;
  phases: Float32Array;
}

/** PRNG determinista (mulberry32): mismo núcleo en cada carga. */
function createRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Nube esférica con volumen: ~70% de puntos cerca de la corteza y ~30%
 * hacia el interior, con jitter para que se vea orgánica.
 */
export function createParticleField(count: number, radius: number, seed = 7): ParticleField {
  const random = createRandom(seed);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    // Dirección uniforme en la esfera (método gaussiano aproximado).
    let x = random() * 2 - 1;
    let y = random() * 2 - 1;
    let z = random() * 2 - 1;
    const length = Math.hypot(x, y, z) || 1;
    x /= length;
    y /= length;
    z /= length;

    const shell = random() < 0.7;
    const r = shell
      ? radius * (0.72 + random() * 0.28)
      : radius * Math.cbrt(random()) * 0.7;

    positions[i * 3] = x * r;
    positions[i * 3 + 1] = y * r;
    positions[i * 3 + 2] = z * r;
    sizes[i] = 0.55 + random() * 1.15;
    phases[i] = random() * Math.PI * 2;
  }

  return { positions, sizes, phases };
}

/**
 * Segmentos entre puntos cercanos (efecto red neuronal).
 * Limita enlaces por punto y total de segmentos para mantener el costo bajo.
 */
export function createLinkSegments(
  positions: Float32Array,
  maxDistance: number,
  maxLinksPerPoint = 3,
  maxSegments = 2200,
): Float32Array {
  const count = positions.length / 3;
  const maxDistanceSq = maxDistance * maxDistance;
  const links: number[] = [];
  const linkCount = new Uint8Array(count);
  let segments = 0;

  for (let i = 0; i < count && segments < maxSegments; i += 1) {
    if (linkCount[i] >= maxLinksPerPoint) continue;
    const ix = positions[i * 3];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];

    for (let j = i + 1; j < count && segments < maxSegments; j += 1) {
      if (linkCount[i] >= maxLinksPerPoint) break;
      if (linkCount[j] >= maxLinksPerPoint) continue;

      const dx = ix - positions[j * 3];
      const dy = iy - positions[j * 3 + 1];
      const dz = iz - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz > maxDistanceSq) continue;

      links.push(ix, iy, iz, positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      linkCount[i] += 1;
      linkCount[j] += 1;
      segments += 1;
    }
  }

  return new Float32Array(links);
}

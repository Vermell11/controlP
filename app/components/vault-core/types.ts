/**
 * Estados del núcleo. Hoy solo se usa "idle"; "listening" y "processing"
 * quedan definidos para la fase de voz (micrófono → intents).
 */
export type CoreState = "idle" | "listening" | "processing";

/**
 * Señales mutables que alimentan la animación del núcleo.
 * Se leen por frame (sin re-render de React), así que un futuro hook de
 * micrófono solo tiene que escribir aquí: signals.level = nivelDeVoz.
 */
/** Formación de los nodos de proyecto en la escena. */
export type NodeFormation = "orbit" | "health";

export interface VaultSignals {
  state: CoreState;
  /** Energía externa 0..1 (voz en el futuro). 0 = reposo. */
  level: number;
  /** true mientras el cursor está sobre un nodo: pausa la rotación. */
  hold: boolean;
  /** orbit = sobre la esfera; health = ranking vertical por salud. */
  formation: NodeFormation;
}

export const DEFAULT_SIGNALS: VaultSignals = {
  formation: "orbit",
  hold: false,
  level: 0,
  state: "idle",
};

/** Proyecto tal como lo consume la escena (subset serializable de ProjectCard). */
export interface StageNode {
  name: string;
  slug: string;
  health: number;
}

/** Parámetros visuales por estado, para mapear estado → animación. */
export const STATE_PRESETS: Record<
  CoreState,
  { rotationSpeed: number; baseIntensity: number; pulseSpeed: number }
> = {
  idle: { rotationSpeed: 0.05, baseIntensity: 0.35, pulseSpeed: 0.6 },
  listening: { rotationSpeed: 0.12, baseIntensity: 0.7, pulseSpeed: 1.6 },
  processing: { rotationSpeed: 0.3, baseIntensity: 1, pulseSpeed: 2.4 },
};

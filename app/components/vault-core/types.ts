/** Estados observables del flujo de voz que alimentan el núcleo visual. */
export type CoreState =
  | "idle"
  | "listening"
  | "transcribing"
  | "processing"
  | "success"
  | "error";

/**
 * Señales mutables que alimentan la animación del núcleo.
 * Se leen por frame (sin re-render de React), así que un futuro hook de
 * micrófono solo tiene que escribir aquí: signals.level = nivelDeVoz.
 */
/** Formación de los nodos de proyecto en la escena. */
export type NodeFormation = "orbit" | "grid" | "health";

/** Bandas del ecualizador de voz (graves → agudos). */
export const SPECTRUM_BANDS = 16;

export interface VaultSignals {
  state: CoreState;
  /** Energía externa 0..1 (voz en el futuro). 0 = reposo. */
  level: number;
  /** true mientras el cursor está sobre un nodo: pausa la rotación. */
  hold: boolean;
  /** orbit = esfera; grid = autosize por salud; health = diagnóstico vertical. */
  formation: NodeFormation;
  /** Offset de scroll del diagnóstico health, en unidades de proyecto. */
  healthScroll: number;
  /**
   * Espectro de la voz (0..1 por banda, graves→agudos), mutado in-place por
   * frame. Lo alimenta el micrófono hoy y el TTS del asistente mañana; la
   * esfera de partículas lo renderiza como ecualizador.
   */
  spectrum: number[];
}

export const DEFAULT_SIGNALS: VaultSignals = {
  formation: "orbit",
  healthScroll: 0,
  hold: false,
  level: 0,
  spectrum: new Array<number>(SPECTRUM_BANDS).fill(0),
  state: "idle",
};

/** Proyecto tal como lo consume la escena (subset serializable de ProjectCard). */
export interface StageNode {
  name: string;
  slug: string;
  health: number;
  /** Métrica compacta para el diagnóstico (p. ej. "V1.3 · grafo 300/417"). */
  meta: string;
}

/** Parámetros visuales por estado, para mapear estado → animación. */
export const STATE_PRESETS: Record<
  CoreState,
  { rotationSpeed: number; baseIntensity: number; pulseSpeed: number }
> = {
  idle: { rotationSpeed: 0.05, baseIntensity: 0.35, pulseSpeed: 0.6 },
  listening: { rotationSpeed: 0.12, baseIntensity: 0.7, pulseSpeed: 1.6 },
  transcribing: { rotationSpeed: 0.16, baseIntensity: 0.75, pulseSpeed: 1.2 },
  processing: { rotationSpeed: 0.3, baseIntensity: 1, pulseSpeed: 2.4 },
  success: { rotationSpeed: 0.08, baseIntensity: 0.8, pulseSpeed: 0.9 },
  error: { rotationSpeed: 0, baseIntensity: 0.55, pulseSpeed: 0.3 },
};

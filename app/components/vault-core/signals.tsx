"use client";

import { DEFAULT_SIGNALS, type VaultSignals } from "./types";

/**
 * Señales del núcleo como singleton mutable de módulo.
 *
 * Nota: no se usa React Context porque el canvas de React Three Fiber
 * renderiza en un árbol separado y el contexto exterior no lo alcanza.
 * Los productores (futuro hook de micrófono) escriben directamente:
 *   vaultSignals.level = nivelDeVoz;
 *   vaultSignals.state = "listening";
 * y el loop 3D lo lee cada frame, sin re-renders.
 */
export const vaultSignals: VaultSignals = { ...DEFAULT_SIGNALS };

export function useVaultSignals(): VaultSignals {
  return vaultSignals;
}

import type { Intent } from "../intents.ts";

export interface IntentStoreReading {
  items: Intent[];
  corrupted: number;
}

export interface IntentStore {
  read(): IntentStoreReading;
  propose(intent: Intent): Intent;
  decide(id: string, previewHash: string, decision: "confirm" | "cancel"): Intent;
  claim(id: string, leaseMs: number): Intent | null;
  finish(id: string, status: "done" | "failed", detail: string): Intent;
}

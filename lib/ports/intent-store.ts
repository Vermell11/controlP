import type { Intent } from "../intents.ts";

export interface IntentStoreReading {
  items: Intent[];
  corrupted: number;
}

export interface IntentStore {
  read(): IntentStoreReading;
  propose(intent: Intent): Intent;
  decide(id: string, previewHash: string, decision: "confirm" | "cancel"): Intent;
}

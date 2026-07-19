"use server";

import { revalidatePath } from "next/cache";
import { confirmIntent, proposeProjectFieldIntent } from "@/lib/intents";
import { runIntent } from "@/lib/intent-runner";

export type EditableField = "reto" | "validacion" | "estado" | "siguiente";

export interface UpdateResult {
  ok: boolean;
  error?: string;
  proposal?: { id: string; preview: string; previewHash: string };
}

/**
 * Server action: edición de la cápsula del proyecto, siempre vía adaptador de
 * memoria y con traza en la Bitácora. La confirmación ocurre en la UI antes
 * de llamar aquí (regla del contrato).
 */
const VALID_FIELDS: ReadonlyArray<EditableField> = ["reto", "validacion", "estado", "siguiente"];

export async function proposeProjectField(
  slug: string,
  field: EditableField,
  value: string,
): Promise<UpdateResult> {
  // Frontera de escritura: validar explícitamente, no confiar en la UI.
  if (!VALID_FIELDS.includes(field)) {
    return { error: `Campo no editable: ${String(field)}.`, ok: false };
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length < 3 || cleaned.length > 600) {
    return { error: "El texto debe tener entre 3 y 600 caracteres.", ok: false };
  }

  const intent = await proposeProjectFieldIntent(slug, field, cleaned);
  return { ok: true, proposal: { id: intent.id, preview: intent.preview, previewHash: intent.previewHash } };
}

export async function executeProjectField(slug: string, id: string, previewHash: string): Promise<UpdateResult> {
  try {
    await confirmIntent(id, previewHash);
    const intent = await runIntent(id);
    if (intent.status !== "done") return { error: intent.error ?? "La ejecución falló.", ok: false };
    revalidatePath(`/p/${slug}`); revalidatePath("/");
    return { ok: true };
  } catch (error) { return { error: (error as Error).message, ok: false }; }
}

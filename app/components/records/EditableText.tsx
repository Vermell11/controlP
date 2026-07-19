"use client";

import { useState, useTransition } from "react";
import { executeProjectField, proposeProjectField, type EditableField } from "@/app/p/[slug]/actions";

/**
 * Texto editable de la ficha: lápiz → textarea → Guardar (confirmación
 * explícita). Escribe vía server action → adaptador de memoria.
 */
export default function EditableText({
  slug,
  field,
  initial,
}: {
  slug: string;
  field: EditableField;
  initial: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [proposal, setProposal] = useState<{ id: string; preview: string; previewHash: string } | null>(null);

  if (!editing) {
    return (
      <p className="editableText">
        {initial}
        <button
          aria-label={`Editar ${field}`}
          className="editButton"
          onClick={() => {
            setValue(initial);
            setError(null);
            setEditing(true);
          }}
          type="button"
        >
          ✎
        </button>
      </p>
    );
  }

  return (
    <div className="editableForm">
      <textarea
        disabled={pending}
        onChange={(event) => setValue(event.target.value)}
        rows={3}
        value={value}
      />
      {error && <p className="editError">{error}</p>}
      {proposal && <code>{proposal.preview}</code>}
      <div className="editActions">
        <button
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = proposal
                ? await executeProjectField(slug, proposal.id, proposal.previewHash)
                : await proposeProjectField(slug, field, value);
              if (result.proposal) setProposal(result.proposal);
              else if (result.ok) { setEditing(false); setProposal(null); }
              else {
                setError(result.error ?? "Error desconocido.");
              }
            });
          }}
          type="button"
        >
          {pending ? "Procesando…" : proposal ? "Confirmar hash y ejecutar" : "Preparar propuesta"}
        </button>
        <button disabled={pending} onClick={() => { setEditing(false); setProposal(null); }} type="button">
          Cancelar
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { PanelProps } from "./types";

/**
 * Plan del día con verdad en servidor (compartida entre dispositivos) y traza
 * permanente en la Bitácora del proyecto (Obsidian) vía adaptador.
 * El click abre un confirmador que muestra literalmente lo que se escribirá:
 * nada llega a la bóveda sin Confirmar (regla del contrato).
 */
export function ScheduleBody({ projects }: PanelProps) {
  const items = projects.slice(0, 5).map((project) => ({
    challenge: project.currentChallenge,
    name: project.name,
    slug: project.slug,
  }));

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<{ id: string; preview: string; previewHash: string } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/schedule");
        const plan = (await response.json()) as { done: Record<string, boolean> };
        setDone(plan.done ?? {});
      } catch {
        /* sin plan: arranca vacío */
      }
    })();
  }, []);

  const prepare = async (slug: string, challenge: string) => {
    setSaving(true);
    setSaveError(null);
    const next = !done[slug];
    try {
      const response = await fetch("/api/schedule", {
        body: JSON.stringify({ done: next, note: challenge, slug }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (response.ok) {
        const data = (await response.json()) as { intent: { id: string; preview: string; previewHash: string } };
        setProposal(data.intent);
      } else {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setSaveError(data?.error ?? `No se pudo registrar (HTTP ${response.status}).`);
      }
    } catch {
      setSaveError("No se pudo registrar: sin conexión con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  const confirm = async (slug: string) => {
    if (!proposal) return;
    setSaving(true);
    try {
      const response = await fetch("/api/intents", { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "confirm", id: proposal.id, previewHash: proposal.previewHash }) });
      const data = (await response.json().catch(() => null)) as { intent?: { status: string; error?: string }; error?: string } | null;
      if (!response.ok || data?.intent?.status !== "done") throw new Error(data?.intent?.error ?? data?.error ?? "ejecución fallida");
      setDone((previous) => ({ ...previous, [slug]: !previous[slug] }));
      setJustSaved(slug); setTimeout(() => setJustSaved(null), 2500);
      setConfirming(null); setProposal(null);
    } catch (error) { setSaveError((error as Error).message); }
    finally { setSaving(false); }
  };

  const previewLine = (item: { name: string; challenge: string; slug: string }) => {
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const action = done[item.slug] ? "avance del día reabierto" : "avance del día confirmado";
    return `- ${stamp} — ${action} desde ControlP: ${item.challenge}`;
  };

  return (
    <>
      <div className="schedule">
        {items.map((item, index) => {
          const isDone = done[item.slug];
          const isOpen = confirming === item.slug;
          return (
            <div className="scheduleItem" key={item.slug}>
              <div
                className={`${isDone ? "done" : index === 0 ? "now" : ""}`}
                onClick={() => {
                  setSaveError(null);
                  setProposal(null);
                  setConfirming(isOpen ? null : item.slug);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setSaveError(null);
                    setProposal(null);
                    setConfirming(isOpen ? null : item.slug);
                  }
                }}
              >
                <time>{`${9 + index * 2}:30`}</time>
                <p>
                  {item.challenge}
                  {justSaved === item.slug && <i className="savedBadge">registrado ✓</i>}
                </p>
              </div>

              {isOpen && (
                <div className="scheduleConfirm">
                  <small>
                    {isDone
                      ? `Reabrir el avance de ${item.name}. Se anotará en su Bitácora.md:`
                      : `Marcar avance de ${item.name}. Se anotará en su Bitácora.md:`}
                  </small>
                  <code>{proposal?.preview ?? previewLine(item)}</code>
                  {saveError && <p className="scheduleError">{saveError}</p>}
                  <div className="scheduleConfirmActions">
                    <button
                      disabled={saving}
                      onClick={() => proposal ? void confirm(item.slug) : void prepare(item.slug, item.challenge)}
                      type="button"
                    >
                      {saving ? "Procesando…" : proposal ? "Confirmar hash y ejecutar" : "Preparar propuesta"}
                    </button>
                    <button disabled={saving} onClick={() => { setConfirming(null); setProposal(null); }} type="button">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <small className="scheduleLegend">
        Marcar = registrar avance del día. Solo agrega una línea a la Bitácora del
        proyecto (append-only); nunca toca tus notas.
      </small>
    </>
  );
}

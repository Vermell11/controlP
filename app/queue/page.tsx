import "./queue.css";
import Link from "next/link";
import { readIntentQueue } from "@/lib/intents";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  done: "done",
  failed: "failed",
  queued: "queued",
  running: "running",
};

/**
 * Vista de la cola de intents (módulo fuera del core).
 * Hoy todo entra como "queued"; el runner (Sprint 3/4) moverá estados.
 */
export default async function QueuePage() {
  const { items, corrupted } = await readIntentQueue();
  const newestFirst = [...items].reverse();
  const pending = items.filter((intent) => intent.status === "queued").length;

  return (
    <main className="vaultShell recordPage">
      <header className="recordPageTop">
        <Link className="backLink" href="/">
          ← V.A.U.L.T.
        </Link>
        <span className="queueMeta">
          {`${items.length} intents · ${pending} en cola`}
        </span>
      </header>

      <section className="queuePanel">
        <div className="panelTitle">
          <strong>Intent Queue</strong>
          <span>runner.pending</span>
        </div>

        {corrupted > 0 && (
          <p className="queueWarning">
            {`${corrupted} línea(s) corrupta(s) detectada(s) en la cola — revisar runtime/intents.jsonl.`}
          </p>
        )}

        {newestFirst.length === 0 ? (
          <p className="queueEmpty">Cola vacía. El Command Deck y, pronto, tu voz escriben aquí.</p>
        ) : (
          <ul className="queueList">
            {newestFirst.map((intent, index) => (
              <li key={`${intent.at}-${index}`}>
                <time>
                  {new Intl.DateTimeFormat("es-CO", {
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                  }).format(new Date(intent.at))}
                </time>
                <span className="queueCommand">{intent.command}</span>
                <span className="queueSource">{intent.source}</span>
                <b className={`queueStatus ${intent.status}`}>
                  {STATUS_LABEL[intent.status] ?? intent.status}
                </b>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

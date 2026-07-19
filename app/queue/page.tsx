import "./queue.css";
import Link from "next/link";
import { readIntentQueue } from "@/lib/intents";

export const dynamic = "force-dynamic";

const VISIBLE_INTENTS = 100;

const STATUS_LABEL: Record<string, string> = {
  done: "done",
  failed: "failed",
  proposed: "proposed",
  cancelled: "cancelled",
  queued: "queued",
  running: "running",
};

/**
 * Vista de la cola de intents (módulo fuera del core).
 * Las propuestas sólo llegan a "queued" tras confirmar el hash de su preview.
 */
export default async function QueuePage() {
  const { items, corrupted } = await readIntentQueue();
  const newestFirst = [...items].reverse();
  const visible = newestFirst.slice(0, VISIBLE_INTENTS);
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

        {visible.length === 0 ? (
          <p className="queueEmpty">Cola vacía. El Command Deck y, pronto, tu voz escriben aquí.</p>
        ) : (
          <>
            {items.length > visible.length && (
              <p className="queueLimit">{`Mostrando los ${visible.length} intents más recientes.`}</p>
            )}
            <ul className="queueList">
              {visible.map((intent, index) => (
                <li key={`${intent.at}-${index}`}>
                  <time>
                    {new Intl.DateTimeFormat("es-CO", {
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                    }).format(new Date(intent.at))}
                  </time>
                  <span className="queueCommand" title={intent.preview}>{intent.command}</span>
                  <span className="queueSource">{intent.source}</span>
                  <b className={`queueStatus ${intent.status}`}>
                    {STATUS_LABEL[intent.status] ?? intent.status}
                  </b>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}

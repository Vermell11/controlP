import PanelTitle from "@/app/components/ui/PanelTitle";
import type { PanelProps } from "./types";

/** AI Wire (estático por ahora; evoluciona a System Feed en Sprint 2). */
export default function WirePanel(_props: PanelProps) {
  return (
    <>
      <PanelTitle title="AI Wire" meta="morning.intel" />
      <div className="wire">
        <p>Obsidian is the project index. Git is evidence. Graphify is derived context.</p>
        <p>OneDrive copies should mirror the latest version only, never own change control.</p>
        <p>Notion remains the ledger; closing requires explicit human confirmation.</p>
      </div>
    </>
  );
}

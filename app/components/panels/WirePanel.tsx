import PanelTitle from "@/app/components/ui/PanelTitle";

/** AI Wire (estático por ahora; evoluciona a System Feed en Sprint 2). */
export default function WirePanel() {
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

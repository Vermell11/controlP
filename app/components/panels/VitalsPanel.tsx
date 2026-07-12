import PanelTitle from "@/app/components/ui/PanelTitle";
import type { PanelProps } from "./types";

function Vital({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="vital">
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
      <span>{note}</span>
      <i />
    </div>
  );
}

export default function VitalsPanel({ projects }: PanelProps) {
  const active = projects.filter((project) => /activo/i.test(project.status)).length;
  const open = projects.filter((project) => project.openSession).length;
  const dirty = projects.filter((project) => project.git.dirty).length;
  const graphified = projects.filter((project) => project.graphify.present).length;
  const unresolved = projects.filter((project) => !project.repoPath).length;
  const signals = projects.reduce(
    (total, project) => total + (project.graphify.nodes ?? 0) + (project.graphify.edges ?? 0),
    0,
  );
  const avgHealth = projects.length
    ? Math.round(projects.reduce((total, project) => total + project.health, 0) / projects.length)
    : 0;

  return (
    <>
      <PanelTitle title="System Vitals" meta="trace.link" />
      <Vital label="Project Health" value={`${avgHealth}%`} note={`${active} active`} />
      <Vital label="Vault Projects" value={projects.length} note={`${unresolved} unresolved`} />
      <Vital label="Graphify Nodes" value={graphified} note={`${signals || 0} signals`} />
      <Vital label="Open Sessions" value={open} note={`${dirty} dirty repos`} />
    </>
  );
}

import "./panel-title.css";

/** Título estándar de panel: compartido por todos los módulos de panel. */
export default function PanelTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="panelTitle">
      <strong>{title}</strong>
      <span>{meta}</span>
    </div>
  );
}

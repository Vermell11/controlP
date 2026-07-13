import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Plan del día: estado operativo de ControlP (una sola verdad en servidor,
 * compartida entre dispositivos — reemplaza al localStorage por navegador).
 * La traza permanente de cada avance va a la Bitácora del proyecto en la
 * memoria (Obsidian) vía adaptador.
 */
export interface DayPlan {
  date: string;
  done: Record<string, boolean>;
}

const today = () => new Date().toISOString().slice(0, 10);
const planFile = () => path.join(process.cwd(), "runtime", `schedule-${today()}.json`);

export async function readDayPlan(): Promise<DayPlan> {
  try {
    const raw = await fs.readFile(planFile(), "utf8");
    const parsed = JSON.parse(raw) as DayPlan;
    if (parsed && typeof parsed.done === "object") return { date: today(), done: parsed.done };
  } catch {
    /* plan nuevo */
  }
  return { date: today(), done: {} };
}

export async function setDayItem(slug: string, done: boolean): Promise<DayPlan> {
  const plan = await readDayPlan();
  plan.done[slug] = done;
  await fs.mkdir(path.dirname(planFile()), { recursive: true });
  await fs.writeFile(planFile(), JSON.stringify(plan, null, 2), "utf8");
  return plan;
}

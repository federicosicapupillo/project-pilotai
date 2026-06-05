import { useEffect, useState } from "react";
import { SYNTHETIC_STEPS, type SyntheticStep, type StepStatus } from "@/components/SyntheticRoadmap";

// Unica fonte di verità per l'avanzamento della roadmap sintetica del progetto.
// Persistita in localStorage (chiave per progetto) e sincronizzata tra i
// componenti della stessa tab tramite un CustomEvent, e tra tab diverse
// tramite l'evento "storage" del browser.

const EVENT = "roadmap-progress-change";
const lsKey = (id: string) => `pm_completed_steps:${id}`;

export type RoadmapStep = SyntheticStep & { status: StepStatus };

export function readCompletedSteps(projectId: string | null | undefined): string[] {
  if (!projectId || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(lsKey(projectId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeCompletedSteps(projectId: string, list: string[]) {
  if (!projectId || typeof window === "undefined") return;
  localStorage.setItem(lsKey(projectId), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { projectId } }));
}

export function computeRoadmap(projectId: string | null | undefined) {
  const completed = readCompletedSteps(projectId);
  const steps: RoadmapStep[] = SYNTHETIC_STEPS.map((s) =>
    completed.includes(s.title)
      ? { ...s, status: "done" as const }
      : { ...s, status: "todo" as const },
  );
  const firstOpenIdx = steps.findIndex((s) => s.status !== "done");
  if (firstOpenIdx >= 0) {
    steps[firstOpenIdx] = { ...steps[firstOpenIdx], status: "in_progress" as const };
  }
  const currentStep =
    firstOpenIdx >= 0 ? steps[firstOpenIdx] : steps[steps.length - 1];
  const nextStep =
    firstOpenIdx >= 0
      ? steps.slice(firstOpenIdx + 1).find((s) => s.status !== "done") ?? null
      : null;
  const done = steps.filter((s) => s.status === "done").length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { steps, currentStep, nextStep, done, total, pct };
}

export function useRoadmapProgress(projectId: string | null | undefined) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bump = () => setTick((t) => t + 1);
    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<{ projectId?: string }>;
      if (!projectId || !ce.detail?.projectId || ce.detail.projectId === projectId) {
        bump();
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (projectId && e.key === lsKey(projectId)) bump();
    };
    window.addEventListener(EVENT, onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [projectId]);
  return computeRoadmap(projectId);
}
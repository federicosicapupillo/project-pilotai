import { Link } from "@tanstack/react-router";
import {
  Lightbulb,
  Search,
  Rocket,
  LayoutGrid,
  LayoutDashboard,
  Database,
  ClipboardCheck,
  CheckCircle2,
  Check,
  Loader2,
  Lock,
  MessageSquare,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoadmapProgress } from "@/lib/roadmap-progress";

const STEP_ICONS: Record<number, LucideIcon> = {
  1: Lightbulb,
  2: Search,
  3: Rocket,
  4: LayoutGrid,
  5: LayoutDashboard,
  6: Database,
  7: ClipboardCheck,
  8: CheckCircle2,
};

export function DashboardRoadmap({
  hasAccess,
  projectId,
  onActivate,
}: {
  hasAccess: boolean;
  projectId?: string;
  onActivate?: () => void;
}) {
  const { steps: roadmapSteps, done: doneCount, total, pct, currentStep } =
    useRoadmapProgress(projectId);
  const STEPS = roadmapSteps.map((s) => ({
    n: s.n,
    title: s.title,
    micro: s.description,
    icon: STEP_ICONS[s.n] ?? Lightbulb,
    status:
      s.status === "done"
        ? ("done" as const)
        : s.status === "in_progress"
          ? ("current" as const)
          : ("todo" as const),
  }));
  const current =
    STEPS.find((s) => s.status === "current") ??
    (currentStep ? { title: currentStep.title, micro: currentStep.description } : null);

  return (
    <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] via-background to-accent/[0.07] p-6 sm:p-8 glow-soft">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
              {doneCount} di {total} step completati
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent">
              {pct}% completato
            </span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-display font-semibold">
            Roadmap del tuo progetto
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Il progetto è stato impostato. Ora il Team AI ti aiuterà a costruirlo passo dopo passo.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2 italic">
            Non stai partendo da zero, ma la costruzione dell'app deve ancora iniziare.
          </p>
        </div>
        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-4xl font-display font-semibold gradient-text leading-none">{pct}%</div>
          <div className="text-xs text-muted-foreground mt-1">avanzamento</div>
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-5 h-2 rounded-full bg-secondary/60 overflow-hidden border border-border/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_18px_oklch(0.7_0.18_280/0.55)] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="mt-8 -mx-2 sm:mx-0 overflow-x-auto sm:overflow-visible">
        <ol className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-3 px-2 sm:px-0 snap-x snap-mandatory">
          {STEPS.map((step) => {
            const status = step.status;
            const Icon = step.icon;
            const isDone = status === "done";
            const isCurrent = status === "current";

            return (
              <li
                key={step.n}
                className={[
                  "snap-start shrink-0 w-[200px] sm:w-auto rounded-xl p-4 border transition-all relative",
                  isDone
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : isCurrent
                      ? "border-accent/60 bg-accent/10 text-foreground shadow-[0_0_24px_oklch(0.75_0.18_300/0.35)]"
                      : "border-border/50 bg-background/40 text-muted-foreground opacity-70",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "size-9 rounded-lg grid place-items-center shrink-0 border",
                      isDone
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : isCurrent
                          ? "bg-accent/20 border-accent/50 text-accent"
                          : "bg-secondary/50 border-border text-muted-foreground",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <Check className="size-4" />
                    ) : isCurrent ? (
                      <Play className="size-3.5 fill-current" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Step {step.n}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-sm mt-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground/90 mt-1 line-clamp-2">{step.micro}</p>
                <div className="mt-3">
                  {isDone && (
                    <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
                      Completato
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] uppercase tracking-wider text-accent font-medium">
                      In corso
                    </span>
                  )}
                  {status === "todo" && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Da fare
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Next step CTA */}
      <div className="mt-8 rounded-xl border border-primary/30 bg-background/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-primary font-medium">
            Prossimo passo
          </div>
          <p className="text-base sm:text-lg font-display font-semibold mt-1">
            {current
              ? `Adesso il focus è: ${current.title.toLowerCase()}.`
              : "Hai completato tutti gli step della roadmap. Continua a rifinire la tua app."}
          </p>
          {current && (
            <p className="text-sm text-muted-foreground mt-1">{current.micro}</p>
          )}
        </div>
        <div className="shrink-0">
          {hasAccess ? (
            <Button variant="hero" size="lg" asChild>
              <Link
                to="/project-manager"
                search={projectId ? ({ projectId } as never) : (undefined as never)}
              >
                <MessageSquare className="size-4" /> Parla con il mio Project Manager{" "}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="hero" size="lg" onClick={onActivate}>
              <Lock className="size-4" /> Attiva il Team AI
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
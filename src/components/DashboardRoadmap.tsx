import { Link } from "@tanstack/react-router";
import {
  Lightbulb,
  Search,
  Rocket,
  LayoutGrid,
  Sparkles,
  Code2,
  Database,
  CheckCircle2,
  Check,
  Loader2,
  Lock,
  MessageSquare,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "done" | "current" | "todo";

type Step = {
  n: number;
  title: string;
  micro: string;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  { n: 1, title: "Idea definita", micro: "Idea chiarita e impostazione del progetto.", icon: Lightbulb },
  { n: 2, title: "Analisi completata", micro: "Punti di forza, criticità e direzione individuati.", icon: Search },
  { n: 3, title: "MVP impostato", micro: "Definizione della prima versione utile.", icon: Rocket },
  { n: 4, title: "Schermate da creare", micro: "Struttura, flussi e schermate principali.", icon: LayoutGrid },
  { n: 5, title: "Prompt pronti", micro: "Istruzioni operative pronte per gli agenti AI.", icon: Sparkles },
  { n: 6, title: "Costruzione frontend", micro: "Realizzazione dell'interfaccia della prima versione.", icon: Code2 },
  { n: 7, title: "Backend e database", micro: "Salvataggio dati, utenti e logica lato server.", icon: Database },
  { n: 8, title: "Test finale e rilascio", micro: "Controlli, rifiniture e lancio della prima versione.", icon: CheckCircle2 },
];

export type RoadmapSignals = {
  hasProject?: boolean;
  hasAnalysis?: boolean;
  hasMvp?: boolean;
  hasScreens?: boolean;
  hasPrompts?: boolean;
};

function computeStatuses(s: RoadmapSignals): Status[] {
  const done = [
    !!s.hasProject,
    !!s.hasAnalysis,
    !!s.hasMvp,
    !!s.hasScreens,
    !!s.hasPrompts,
    false,
    false,
    false,
  ];
  // ensure monotonic: once we hit a not-done, the rest are not-done for "done" calc
  let stopped = false;
  const monotonic = done.map((d) => {
    if (stopped) return false;
    if (!d) {
      stopped = true;
      return false;
    }
    return true;
  });
  const firstTodo = monotonic.findIndex((d) => !d);
  return monotonic.map((d, i) => {
    if (d) return "done";
    if (i === firstTodo) return "current";
    return "todo";
  });
}

export function DashboardRoadmap({
  signals,
  hasAccess,
  projectId,
  onActivate,
}: {
  signals: RoadmapSignals;
  hasAccess: boolean;
  projectId?: string;
  onActivate?: () => void;
}) {
  const statuses = computeStatuses(signals);
  const doneCount = statuses.filter((s) => s === "done").length;
  const total = STEPS.length;
  const pct = Math.round((doneCount / total) * 100);
  const currentIdx = statuses.findIndex((s) => s === "current");
  const current = currentIdx >= 0 ? STEPS[currentIdx] : null;

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
            Qui vedi in modo semplice a che punto sei e quali sono i prossimi step per arrivare alla prima versione della tua app.
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
          {STEPS.map((step, i) => {
            const status = statuses[i];
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
                      <Loader2 className="size-4 animate-spin" />
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
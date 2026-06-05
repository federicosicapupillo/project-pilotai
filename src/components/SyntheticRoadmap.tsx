import { Check, Loader2, Circle, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export type StepStatus = "done" | "in_progress" | "todo";

export type SyntheticStep = {
  n: number;
  title: string;
  description: string;
  status: StepStatus;
};

export const SYNTHETIC_STEPS: SyntheticStep[] = [
  { n: 1, title: "Progetto creato", description: "La tua idea è stata trasformata in una scheda progetto iniziale.", status: "done" },
  { n: 2, title: "Punti di forza individuati", description: "Il Team AI ha analizzato cosa rende interessante il progetto e dove può creare valore.", status: "done" },
  { n: 3, title: "Prima versione definita", description: "Abbiamo ridotto l'idea alle funzioni essenziali per creare una prima versione funzionante.", status: "in_progress" },
  { n: 4, title: "Struttura dell'app", description: "Definizione delle schermate principali, dei flussi utente e della logica generale.", status: "todo" },
  { n: 5, title: "Dashboard e area progetto", description: "Creazione dell'area dove l'utente potrà vedere dati, stato, contenuti o funzioni principali.", status: "todo" },
  { n: 6, title: "Backend e salvataggio dati", description: "Preparazione della parte tecnica per salvare informazioni, utenti, contenuti e impostazioni.", status: "todo" },
  { n: 7, title: "Test e correzioni", description: "Controllo dei passaggi deboli, errori, funzioni mancanti e miglioramenti necessari.", status: "todo" },
  { n: 8, title: "Lancio prima versione", description: "Preparazione della prima versione da mostrare, testare o presentare.", status: "todo" },
];

export function syntheticProgress() {
  const done = SYNTHETIC_STEPS.filter((s) => s.status === "done").length;
  const pct = Math.round((done / SYNTHETIC_STEPS.length) * 100);
  const next = SYNTHETIC_STEPS.find((s) => s.status !== "done");
  return { done, total: SYNTHETIC_STEPS.length, pct, next };
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="size-8 rounded-full bg-primary/15 border border-primary/40 grid place-items-center text-primary shrink-0">
        <Check className="size-4" />
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="size-8 rounded-full bg-accent/15 border border-accent/40 grid place-items-center text-accent shrink-0 glow-soft">
        <Loader2 className="size-4 animate-spin" />
      </span>
    );
  }
  return (
    <span className="size-8 rounded-full bg-secondary/60 border border-border grid place-items-center text-muted-foreground shrink-0">
      <Circle className="size-3" />
    </span>
  );
}

function StatusBadge({ status }: { status: StepStatus }) {
  const map = {
    done: { label: "Completato", cls: "bg-primary/15 text-primary border-primary/30" },
    in_progress: { label: "In corso", cls: "bg-accent/15 text-accent border-accent/30" },
    todo: { label: "Da fare", cls: "bg-secondary text-muted-foreground border-border" },
  } as const;
  const v = map[status];
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${v.cls}`}>
      {v.label}
    </span>
  );
}

export function SyntheticRoadmap({ projectId }: { projectId: string }) {
  const { done, total, pct } = syntheticProgress();
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <p className="text-sm text-muted-foreground italic">
        Non parti da zero: il progetto è già stato impostato. Ora il Team AI ti aiuta ad avanzare uno step alla volta.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-display font-semibold">Roadmap del progetto</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Il tuo Team AI ha già organizzato il percorso. Ora puoi avanzare punto per punto nella costruzione della tua app.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Avanzamento progetto</div>
          <div className="text-3xl font-display font-semibold gradient-text">{pct}%</div>
          <div className="text-xs text-muted-foreground">{done}/{total} step</div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full gradient-bg transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-6 space-y-3">
        {SYNTHETIC_STEPS.map((s) => (
          <li
            key={s.n}
            className={`flex items-start gap-3 rounded-xl p-4 border ${
              s.status === "in_progress"
                ? "border-accent/40 bg-accent/5"
                : "border-border/60 bg-background/40"
            }`}
          >
            <StatusIcon status={s.status} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">Step {s.n}</span>
                <h3 className="font-display font-semibold">{s.title}</h3>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button variant="hero" size="lg" asChild>
          <Link to="/project-manager" search={{ projectId } as never}>
            <MessageSquare className="size-4" /> Parla con il Project Manager <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-6 rounded-xl p-5 border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <h3 className="font-display font-semibold">Non sai da dove partire?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Chiedi al tuo Project Manager AI qual è il prossimo passo. Lui coordina gli agenti e ti indica cosa fare adesso.
        </p>
        <Button variant="glass" className="mt-3" asChild>
          <Link to="/project-manager" search={{ projectId } as never}>
            <MessageSquare className="size-4" /> Chiedi al Project Manager
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function SyntheticRoadmapCompact({ projectId }: { projectId: string }) {
  const { pct, done, total, next } = syntheticProgress();
  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground uppercase tracking-wider">Prossimo step</span>
        <span className="text-muted-foreground">{pct}% · {done}/{total}</span>
      </div>
      <p className="text-sm font-medium mt-1 line-clamp-1">{next?.title ?? "Tutti gli step completati"}</p>
      <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
        <div className="h-full gradient-bg" style={{ width: `${pct}%` }} />
      </div>
      <Link
        to="/projects/$id"
        params={{ id: projectId }}
        hash="roadmap"
        className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
      >
        Apri roadmap <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, Loader2, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

export type GenState = "idle" | "running" | "done" | "error";

export const GEN_PHASES = [
  { title: "Analisi dell'idea", desc: "Stiamo capendo cosa vuoi creare e qual è l'obiettivo del progetto.", live: "Sto analizzando la tua idea…" },
  { title: "Creazione scheda progetto", desc: "Prepariamo il riepilogo operativo della tua app.", live: "Sto preparando la scheda progetto…" },
  { title: "Selezione agenti AI", desc: "Costruiamo il team più adatto alla tua idea.", live: "Sto creando il tuo Team AI…" },
  { title: "Preparazione prompt operativi", desc: "Generiamo le istruzioni da usare per costruire il progetto.", live: "Sto generando i prompt operativi…" },
  { title: "Roadmap di costruzione", desc: "Organizziamo i passaggi da seguire per arrivare alla prima versione.", live: "Sto costruendo la roadmap…" },
  { title: "Progetto pronto", desc: "Il tuo progetto è stato creato. Puoi iniziare a lavorarci.", live: "Quasi fatto…" },
] as const;

export function GenerationProgressDialog({
  open,
  state,
  phase,
  errorMessage,
  onRetry,
  onClose,
  onGoToProject,
}: {
  open: boolean;
  state: GenState;
  phase: number; // 0..GEN_PHASES.length-1, index currently in progress (or last completed when done)
  errorMessage?: string;
  onRetry: () => void;
  onClose: () => void;
  onGoToProject: () => void;
}) {
  const total = GEN_PHASES.length;
  const done = state === "done";
  const progressValue = done
    ? 100
    : Math.round((Math.min(phase, total - 1) / total) * 100);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) return;
        // Block closing while generation is running
        if (state === "running") return;
        onClose();
      }}
    >
      <DialogContent
        className="max-w-lg border-primary/40 bg-background/95 backdrop-blur-md shadow-[0_0_60px_-15px_hsl(var(--primary)/0.6)]"
        onInteractOutside={(e) => {
          if (state === "running") e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (state === "running") e.preventDefault();
        }}
        showCloseButton={state !== "running"}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            {state === "error" ? (
              <>
                <AlertTriangle className="size-5 text-destructive" />
                Qualcosa non ha funzionato
              </>
            ) : done ? (
              <>
                <Sparkles className="size-5 text-primary" />
                Progetto creato
              </>
            ) : (
              <>
                <Loader2 className="size-5 text-primary animate-spin" />
                Sto creando il tuo progetto
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {state === "error"
              ? "Non siamo riusciti a completare la generazione. Puoi riprovare senza perdere i dati inseriti."
              : done
              ? "La tua scheda progetto, il team AI, i prompt e la roadmap sono pronti."
              : "Il tuo Team AI sta analizzando l'idea e preparando scheda progetto, agenti, prompt e roadmap."}
          </DialogDescription>
        </DialogHeader>

        {state !== "error" && (
          <>
            <div className="space-y-1">
              <Progress value={progressValue} className="h-2" />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground text-right">
                {progressValue}%
              </div>
            </div>

            <ol className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {GEN_PHASES.map((p, i) => {
                const status: "done" | "doing" | "todo" = done || i < phase ? "done" : i === phase ? "doing" : "todo";
                return (
                  <li key={p.title} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0">
                      {status === "done" ? (
                        <span className="size-6 grid place-items-center rounded-full bg-primary/20 border border-primary/50">
                          <Check className="size-3.5 text-primary" />
                        </span>
                      ) : status === "doing" ? (
                        <span className="size-6 grid place-items-center rounded-full bg-primary/15 border border-primary/40">
                          <Loader2 className="size-3.5 text-primary animate-spin" />
                        </span>
                      ) : (
                        <span className="size-6 rounded-full border border-border block" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          status === "todo" ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {status === "doing" ? p.live : p.title}
                      </div>
                      <div className="text-xs text-muted-foreground leading-snug">{p.desc}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {state === "error" && errorMessage && (
          <p className="text-sm text-destructive/90 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {state === "error" && (
            <>
              <Button variant="hero" size="lg" className="flex-1" onClick={onRetry}>
                Riprova
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
                Torna al modulo
              </Button>
            </>
          )}
          {done && (
            <Button variant="hero" size="lg" className="w-full" onClick={onGoToProject}>
              Vai al progetto <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
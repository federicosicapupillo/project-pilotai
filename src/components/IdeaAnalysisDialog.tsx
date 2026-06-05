import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ToolIcon";
import { ReusableToolkitBox, getReuseBadge } from "@/components/ReusableToolkitBox";
import {
  ArrowRight, Sparkles, Clock, Activity, Layers, Users, AlertCircle,
  Lightbulb, Wrench, Bot, ListChecks, Monitor, Plug, Wand2,
  TrendingUp, Euro, X, Loader2,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { useActivateTeam } from "@/hooks/use-activate-team";
import {
  classify,
  type Estimate, type IdeaParams,
} from "@/lib/idea-estimate";
import { generateIdeaSummary } from "@/lib/idea-summary.functions";
import {
  hashIdea,
  classifyIdeaTier,
  tierPotential,
  tierCost,
  tierHours,
  tierDifficultyLabel,
  tierDifficultyReason,
  loadCachedSummary,
  saveCachedSummary,
  type IdeaTier,
  tierSavings,
  TEAM_AI_LAUNCH_PRICE_EUR,
} from "@/lib/idea-deterministic";

export function IdeaAnalysisDialog({
  open,
  onOpenChange,
  params,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  params: IdeaParams | null;
}) {
  const navigate = useNavigate();
  const generate = useServerFn(generateIdeaSummary);
  const { activate, isAuthed } = useActivateTeam();
  const [confirmClose, setConfirmClose] = useState(false);

  const result = useMemo<Estimate | null>(() => {
    if (!params || params.idea.trim().length < 8) return null;
    return classify(params.idea, params.target, params.revenue, params.price);
  }, [params]);

  const ideaHash = useMemo(
    () => (params ? hashIdea(params.idea) : ""),
    [params],
  );
  const tier: IdeaTier = useMemo(
    () => (params ? classifyIdeaTier(params.idea, params.target) : "semplice"),
    [params],
  );

  type SummaryType = Awaited<ReturnType<typeof generateIdeaSummary>>;
  const cached = useMemo<SummaryType | null>(
    () => (ideaHash ? loadCachedSummary<SummaryType>(ideaHash) : null),
    [ideaHash],
  );

  const { data: summary, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["idea-summary", ideaHash],
    enabled: !!params && !!result && open && !!ideaHash,
    queryFn: async () => {
      if (!params || !result) throw new Error("missing");
      const res = await generate({
        data: {
          idea: params.idea,
          target: params.target,
          projectType: result.projectType,
        },
      });
      saveCachedSummary(ideaHash, res);
      return res;
    },
    initialData: cached ?? undefined,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  const stablePotential = useMemo(() => tierPotential(tier), [tier]);
  const stableCost = useMemo(() => tierCost(tier), [tier]);
  const stableSavings = useMemo(() => tierSavings(tier), [tier]);
  const stableHours = useMemo(() => tierHours(tier), [tier]);
  const stableDifficulty = useMemo(() => tierDifficultyLabel(tier), [tier]);
  const stableDifficultyReason = useMemo(() => tierDifficultyReason(tier), [tier]);

  const ready = !!summary && !isLoading;

  const handleRequestClose = (next: boolean) => {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (!ready) {
      setConfirmClose(true);
      return;
    }
    onOpenChange(false);
  };

  const goToRoadmap = () => {
    void trackEvent("idea_dialog_cta_attiva_team");
    void activate("idea_analysis_dialog");
  };

  const generateProjectFromIdea = () => {
    if (!params) return;
    void trackEvent("idea_dialog_cta_genera_progetto");
    if (typeof window !== "undefined") {
      try {
        const title = (summary?.title ?? params.idea).slice(0, 80);
        localStorage.setItem("draft_idea_title", title);
        localStorage.setItem("draft_idea_description", summary?.short_description ?? params.idea);
        if (summary?.target) localStorage.setItem("draft_idea_target", summary.target);
        if (summary?.problem) localStorage.setItem("draft_idea_problem", summary.problem);
        if (summary?.solution) localStorage.setItem("draft_idea_solution", summary.solution);
        if (summary?.project_type) localStorage.setItem("draft_idea_product_type", summary.project_type);
      } catch { /* noop */ }
    }
    onOpenChange(false);
    navigate({ to: "/new-project" });
  };

  if (!params || !result) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleRequestClose}>
        <DialogContent
          className="max-w-3xl w-[calc(100vw-1rem)] sm:w-full p-0 border border-primary/40 bg-background/95 backdrop-blur-xl overflow-hidden max-h-[92vh] flex flex-col [&>button.absolute]:hidden"
          style={{
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--primary) 35%, transparent), 0 30px 80px -20px color-mix(in oklab, var(--primary) 45%, transparent)",
          }}
          onEscapeKeyDown={(e) => {
            if (!ready) {
              e.preventDefault();
              setConfirmClose(true);
            }
          }}
          onPointerDownOutside={(e) => {
            if (!ready) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (!ready) e.preventDefault();
          }}
        >
          {/* Header */}
          <div
            className="relative px-5 sm:px-7 pt-5 pb-4 border-b border-border/50"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--primary) 12%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
            }}
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full glass-card text-[11px]">
              <Sparkles className="size-3 text-primary" /> Analisi generata dal tuo agente AI
            </div>
            <DialogTitle className="font-display font-semibold text-2xl sm:text-3xl mt-3 leading-tight">
              Ecco l'analisi della tua <span className="gradient-text">idea</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Il tuo agente AI sta trasformando la tua idea in un primo piano operativo.
            </DialogDescription>

            <button
              type="button"
              onClick={() => handleRequestClose(false)}
              aria-label="Chiudi"
              className="absolute top-3 right-3 size-8 grid place-items-center rounded-full bg-background/70 hover:bg-background border border-border/70 text-foreground/80 hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 space-y-4">
            {isLoading && <LoadingState />}

            {isError && !isLoading && (
              <div className="glass-card rounded-2xl p-6 border border-rose-500/30 text-center">
                <AlertCircle className="size-6 text-rose-400 mx-auto" />
                <p className="mt-3 text-sm">
                  Non siamo riusciti a generare l'analisi. Riprova tra qualche secondo.
                </p>
                <Button variant="glass" className="mt-4" onClick={() => refetch()} disabled={isFetching}>
                  Riprova
                </Button>
              </div>
            )}

            {ready && summary && (
              <div className="space-y-4">
                <Section icon={Lightbulb} title="Idea analizzata">
                  <div className="font-display font-semibold text-lg sm:text-xl leading-snug">
                    {summary.title}
                  </div>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                    {summary.short_description}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full bg-background/40 border border-border/60">
                    <Layers className="size-3 text-primary" /> Tipo progetto:{" "}
                    <strong className="text-foreground">{summary.project_type}</strong>
                  </div>
                </Section>

                <div className="grid md:grid-cols-3 gap-3">
                  <ImpactStat
                    icon={TrendingUp}
                    label="Quanto potrebbe fruttare"
                    value={stablePotential.amount}
                    description="Se trasformata in una prima versione funzionante e proposta al pubblico giusto, questa app potrebbe generare entrate ricorrenti."
                    microcopy="Stima indicativa, non garantita, basata su una prima ipotesi di mercato."
                    tone="potential"
                  />
                  <ImpactStat
                    icon={Euro}
                    label="Quanto avresti potuto spendere"
                    value={stableCost.amount}
                    description="Per far progettare e sviluppare questa prima versione da freelance, agenzia o sviluppatori esterni, il costo avrebbe potuto arrivare a questa cifra."
                    tone="cost"
                  />
                  <ImpactStat
                    icon={Sparkles}
                    label="Risparmio stimato con il Team AI"
                    value={stableSavings.amount}
                    description={`Con IdeaPilot AI non parti da preventivi costosi: inizi subito con una guida operativa, agenti specializzati, roadmap e prompt pronti da usare. Calcolo: ${stableCost.amount.replace("Fino a ", "")} − ${TEAM_AI_LAUNCH_PRICE_EUR}€ prezzo lancio.`}
                    tone="savings"
                    highlight
                  />
                </div>

                <div
                  className="rounded-2xl border border-primary/40 px-4 sm:px-5 py-4 text-sm leading-relaxed text-foreground/90"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
                  }}
                >
                  Prima di spendere migliaia di euro per sviluppare tutto da zero, puoi
                  validare e costruire la prima versione guidata con il tuo Team AI.
                  Questa non è solo una stima: è il confronto tra lasciare l'idea ferma
                  e iniziare oggi a trasformarla in un progetto reale.
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Section icon={Users} title="Target">
                    <p className="text-sm text-foreground/90 leading-relaxed">{summary.target}</p>
                  </Section>
                  <Section icon={AlertCircle} title="Problema risolto">
                    <p className="text-sm text-foreground/90 leading-relaxed">{summary.problem}</p>
                  </Section>
                </div>

                <Section icon={Sparkles} title="Soluzione proposta">
                  <p className="text-sm text-foreground/90 leading-relaxed">{summary.solution}</p>
                </Section>

                <Section icon={ListChecks} title="Prima versione consigliata">
                  <p className="text-sm text-foreground/90 leading-relaxed">{summary.first_version}</p>
                </Section>

                <Section icon={Wand2} title="Funzioni principali">
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {summary.essential_features.map((f, i) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm rounded-lg bg-background/40 border border-border/60 px-3 py-2"
                      >
                        <span className="inline-flex shrink-0 items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section icon={Monitor} title="Schermate consigliate">
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {summary.screens.map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 text-sm rounded-lg bg-background/40 border border-border/60 px-3 py-2"
                      >
                        <Monitor className="size-3.5 mt-1 shrink-0 text-primary" /> {s}
                      </li>
                    ))}
                  </ul>
                </Section>

                {summary.integrations && summary.integrations.length > 0 && (
                  <Section icon={Plug} title="Integrazioni richieste">
                    <div className="flex flex-wrap gap-2">
                      {summary.integrations.map((i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full bg-background/40 border border-border/60"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <Section icon={Clock} title="Ore stimate">
                    <div className="font-display font-semibold text-xl gradient-text">
                      {stableHours}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Per la prima versione funzionante.
                    </p>
                  </Section>
                  <Section icon={Activity} title="Livello complessità">
                    <DifficultyBadge level={stableDifficulty} />
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      {stableDifficultyReason}
                    </p>
                  </Section>
                </div>

                <Section icon={Wrench} title="Strumenti consigliati">
                  <div className="flex flex-wrap gap-2">
                    {result.tools.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/40 border border-border/60 text-xs"
                      >
                        <ToolIcon name={t} size={14} />
                        <span>{t}</span>
                        <span className="text-[9px] uppercase tracking-wider text-primary/90 border border-primary/30 bg-primary/10 rounded-full px-1.5 py-0.5">
                          {getReuseBadge(t)}
                        </span>
                      </span>
                    ))}
                  </div>
                </Section>

                <Section icon={Bot} title="Consiglio operativo">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    Parti dalla prima versione funzionante: lascia che il tuo Team AI prepari struttura,
                    funzioni, schermate e prompt. Valida l'idea con i primi utenti prima di investire in
                    funzioni avanzate o sviluppo esterno.
                  </p>
                </Section>

                <ReusableToolkitBox showExample />
              </div>
            )}
          </div>

          {/* Footer / CTA */}
          {ready && (
            <div
              className="border-t border-border/50 px-5 sm:px-7 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
              }}
            >
              <div className="text-xs text-muted-foreground sm:max-w-xs">
                {isAuthed
                  ? "Sei già registrato: trasforma subito questa analisi in un nuovo progetto."
                  : "Attiva il tuo Team AI per costruire la prima versione guidata."}
              </div>
              {isAuthed ? (
                <div className="flex flex-col items-end gap-1">
                  <Button variant="hero" size="lg" onClick={generateProjectFromIdea}>
                    Genera questo progetto <ArrowRight className="size-4" />
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    Trasforma questa analisi in un progetto operativo nella tua dashboard.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <Button variant="hero" size="lg" onClick={goToRoadmap}>
                    Attiva il Team AI a 29€ <ArrowRight className="size-4" />
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    Prezzo lancio una tantum. Nessun abbonamento automatico.
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chiudere l'analisi?</AlertDialogTitle>
            <AlertDialogDescription>
              L'analisi è ancora in corso. Se chiudi ora potresti dover rilanciare il calcolo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmClose(false);
                onOpenChange(false);
              }}
            >
              Chiudi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-6 border border-border/60 text-center">
        <div className="inline-flex items-center gap-2 text-primary">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm font-medium">Il tuo agente AI sta analizzando l'idea…</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Stiamo trasformando la tua idea in target, problema, soluzione, funzioni e schermate.
        </p>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass-card rounded-2xl p-5 border border-border/60 animate-pulse">
          <div className="h-3 w-32 rounded bg-muted/40" />
          <div className="mt-3 h-4 w-3/4 rounded bg-muted/30" />
          <div className="mt-2 h-4 w-2/3 rounded bg-muted/20" />
        </div>
      ))}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl p-4 sm:p-5 border border-border/60">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
        <Icon className="size-3.5 text-primary" /> {title}
      </div>
      {children}
    </section>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div
      className="relative rounded-2xl p-4 sm:p-5 overflow-hidden border border-primary/40"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 12%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
      }}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        <Icon className="size-3.5 text-primary" /> {label}
      </div>
      <div className="font-display font-semibold text-2xl sm:text-3xl gradient-text leading-tight">
        {value}
      </div>
    </div>
  );
}

function ImpactStat({
  icon: Icon,
  label,
  value,
  description,
  microcopy,
  tone,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
  microcopy?: string;
  tone: "potential" | "cost" | "savings";
  highlight?: boolean;
}) {
  const accent =
    tone === "savings"
      ? "var(--primary)"
      : tone === "potential"
        ? "var(--accent)"
        : "var(--muted-foreground)";
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden border flex flex-col gap-3"
      style={{
        borderColor: `color-mix(in oklab, ${accent} ${highlight ? 70 : 45}%, transparent)`,
        background: highlight
          ? "linear-gradient(140deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 12%, transparent))"
          : "linear-gradient(140deg, color-mix(in oklab, var(--primary) 8%, transparent), color-mix(in oklab, var(--accent) 5%, transparent))",
        boxShadow: highlight
          ? "0 0 0 1px color-mix(in oklab, var(--primary) 55%, transparent), 0 18px 50px -20px color-mix(in oklab, var(--primary) 65%, transparent)"
          : "0 10px 30px -20px color-mix(in oklab, var(--primary) 35%, transparent)",
      }}
    >
      <div
        className="inline-flex items-center gap-2 size-9 rounded-xl justify-center"
        style={{
          background: `color-mix(in oklab, ${accent} 18%, transparent)`,
          border: `1px solid color-mix(in oklab, ${accent} 45%, transparent)`,
        }}
      >
        <Icon className="size-4 text-primary" />
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display font-bold text-3xl sm:text-[2rem] leading-[1.05] gradient-text">
        {value}
      </div>
      <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
        {description}
      </p>
      {microcopy && (
        <p className="text-[10px] text-muted-foreground/80 mt-auto pt-1 border-t border-border/40">
          {microcopy}
        </p>
      )}
    </div>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const color =
    level === "Facile"
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : level === "Medio"
        ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
        : "border-amber-500/40 bg-amber-500/15 text-amber-300";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${color}`}
    >
      <Activity className="size-3.5" /> {level}
    </span>
  );
}
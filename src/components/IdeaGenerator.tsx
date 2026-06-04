import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ToolIcon";
import { generateAppIdeas, type GeneratedIdea } from "@/lib/idea-generator.functions";
import { trackEvent } from "@/lib/tracking";
import {
  Wand2, Lightbulb, Loader2, ArrowRight, Users, AlertTriangle,
  Target, Coins, Repeat, TrendingUp, Wrench, Bot, Layers, Wallet, MinusCircle, CheckCircle2, XCircle, Info, Euro, Scale, Tag, Calculator,
} from "lucide-react";

type Step = "idle" | "loading" | "results";

export type IdeaGeneratorProps = {
  /** Called when user clicks "Sviluppa questa idea" — receives a description
   * suitable to drop into the idea textarea of the estimator. */
  onSelect: (description: string) => void;
  triggerLabel?: string;
  variant?: "card" | "inline";
  /** Values already chosen in the estimator. Required to generate ideas. */
  presetBudget?: string;
  presetTarget?: string;
  presetRevenue?: string;
  presetPrice?: string;
};

export function IdeaGenerator({
  onSelect,
  triggerLabel = "Genera un'idea per me",
  variant = "card",
  presetBudget,
  presetTarget,
  presetRevenue,
  presetPrice,
}: IdeaGeneratorProps) {
  const [step, setStep] = useState<Step>("idle");
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const generate = useServerFn(generateAppIdeas);

  const onSubmit = async () => {
    setStep("loading");
    setError(null);
    const payload = {
      budget: presetBudget ?? "",
      target: presetTarget ?? "",
      revenueModel: presetRevenue ?? "",
      price: presetPrice ?? "",
      sector: "",
      appType: "",
      complexity: "",
      goal: "",
      interests: "",
    };
    void trackEvent("idea_generator_submitted", payload);
    try {
      const r = await generate({ data: payload });
      setIdeas(r.ideas);
      setStep("results");
    } catch (e) {
      console.error(e);
      setError("Impossibile generare le idee in questo momento. Riprova tra poco.");
      setStep("idle");
    }
  };

  const handleSelect = (idea: GeneratedIdea) => {
    const description = buildDescription(idea);
    void trackEvent("idea_generator_selected", { name: idea.name });
    onSelect(description);
  };

  const handleTriggerClick = () => {
    setTriggerError(null);
    if (!presetBudget) {
      setTriggerError("Seleziona prima un budget operativo per generare idee realistiche.");
      return;
    }
    void onSubmit();
  };

  const trigger = (
    <Button variant="hero" size="lg" onClick={handleTriggerClick} disabled={step === "loading"}>
      {step === "loading"
        ? <><Loader2 className="size-4 animate-spin" /> Generazione…</>
        : <><Wallet className="size-4" /> {step === "results" ? "Rigenera idee" : triggerLabel}</>}
    </Button>
  );

  return (
    <>
      {variant === "card" ? (
        <div className="rounded-xl border border-border/60 bg-background/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft shrink-0">
            <Lightbulb className="size-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="font-display font-semibold">Non hai ancora un'idea?</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Useremo il budget, il target, il modello di ricavo e il prezzo che hai selezionato qui sopra per generare 3 idee coerenti.
            </p>
            {triggerError && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" /> {triggerError}
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" /> {error}
              </p>
            )}
          </div>
          {trigger}
        </div>
      ) : trigger}

      {step === "loading" && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-background/30 py-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="mt-4 font-display font-semibold">Sto generando 3 idee personalizzate…</p>
          <p className="text-xs text-muted-foreground mt-1">Pochi secondi.</p>
        </div>
      )}

      {step === "results" && ideas.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">Idee personalizzate per te</div>
              <p className="text-xs text-muted-foreground mt-0.5">Scegli quella che ti convince di più: precompileremo l'analisi completa.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onSubmit} disabled={step !== "results"}>
              <Wand2 className="size-4" /> Rigenera
            </Button>
          </div>
          <div className="grid gap-3">
            {ideas.map((idea, i) => (
              <IdeaCard key={i} idea={idea} onSelect={() => handleSelect(idea)} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Le stime economiche sono indicative e non rappresentano una promessa di guadagno. Il risultato reale dipende da mercato, prezzo, qualità dell'offerta, traffico, esecuzione e capacità di vendita.
          </p>
        </div>
      )}
    </>
  );
}

function buildDescription(idea: GeneratedIdea): string {
  return [
    `${idea.name}: ${idea.description}`,
    `Target: ${idea.target}.`,
    `Problema: ${idea.problem}.`,
    `Prima versione funzionante: ${idea.mvp}.`,
    idea.essential_features?.length
      ? `Funzioni essenziali: ${idea.essential_features.join(", ")}.`
      : "",
  ].filter(Boolean).join(" ");
}

function IdeaCard({ idea, onSelect }: { idea: GeneratedIdea; onSelect: () => void }) {
  return (
    <div
      className="rounded-2xl p-5 border border-primary/30 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent), color-mix(in oklab, var(--accent) 14%, transparent))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">Idea</div>
          <h3 className="font-display font-semibold text-xl mt-0.5">{idea.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <BudgetBadge fit={idea.budget_fit} />
          <span className="text-[10px] px-2 py-1 rounded-full border border-border/60 bg-background/40 whitespace-nowrap">
            {idea.difficulty}
          </span>
        </div>
      </div>
      <p className="text-sm text-foreground/90 mt-2">{idea.description}</p>

      <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs">
        <InfoLine icon={Users} label="Target" value={idea.target} />
        <InfoLine icon={AlertTriangle} label="Problema" value={idea.problem} />
        <InfoLine icon={Layers} label="Prima versione" value={idea.mvp} />
        <InfoLine icon={Target} label="Perché interessante" value={idea.why_interesting} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        <Stat icon={Wand2} label="Ore" value={idea.hours_estimate} />
        <Stat icon={Coins} label="Costo iniziale" value={idea.initial_cost} />
        <Stat icon={Repeat} label="Mensili" value={idea.monthly_cost} />
        <Stat icon={TrendingUp} label="Potenziale" value={idea.potential} />
      </div>

      {idea.budget_note && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-2 text-xs flex gap-2">
          <Info className="size-3.5 text-primary mt-0.5 shrink-0" />
          <span><strong className="text-primary">Budget:</strong> <span className="text-foreground/90">{idea.budget_note}</span></span>
        </div>
      )}

      {idea.do_not_build_yet?.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] mb-1.5">
            <MinusCircle className="size-3 text-primary" /> Cosa NON costruire subito
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idea.do_not_build_yet.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded-full bg-background/40 border border-dashed border-border/60 text-foreground/70">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] mb-1">
          <Target className="size-3 text-primary" /> Modello ricavo
        </div>
        <p className="text-foreground/90">{idea.revenue_model}</p>
      </div>

      <EarningsSection idea={idea} />

      {idea.tools?.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] mb-1.5">
            <Wrench className="size-3 text-primary" /> Strumenti
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idea.tools.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/40 border border-border/60 text-xs">
                <ToolIcon name={t} size={14} /> {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {idea.agents?.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] mb-1.5">
            <Bot className="size-3 text-primary" /> Agenti AI
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idea.agents.map((a) => (
              <span key={a} className="text-xs px-2 py-1 rounded-full bg-background/40 border border-border/60">{a}</span>
            ))}
          </div>
        </div>
      )}

      {idea.main_risk && (
        <div className="mt-3 rounded-lg border border-border/50 bg-background/30 p-2.5 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Da validare prima di costruire
          </div>
          <p className="text-foreground/80 leading-relaxed">{idea.main_risk}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="hero" size="lg" onClick={onSelect}>
          Sviluppa questa idea <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border/60 p-2">
      <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">
        <Icon className="size-3 text-primary" /> {label}
      </div>
      <div className="text-foreground/90">{value}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border/60 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3 text-primary" /> {label}
      </div>
      <div className="text-xs font-medium mt-0.5">{value}</div>
    </div>
  );
}

function BudgetBadge({ fit }: { fit: string }) {
  const f = (fit || "").toLowerCase();
  let icon = <CheckCircle2 className="size-3" />;
  let cls = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  let label = fit || "Compatibilità budget";
  if (f.includes("limite")) {
    icon = <AlertTriangle className="size-3" />;
    cls = "border-amber-500/40 bg-amber-500/15 text-amber-300";
  } else if (f.includes("fuori")) {
    icon = <XCircle className="size-3" />;
    cls = "border-rose-500/40 bg-rose-500/15 text-rose-300";
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${cls} whitespace-nowrap`}>
      {icon} {label}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const l = (level || "").toLowerCase();
  let cls = "border-amber-500/40 bg-amber-500/15 text-amber-300";
  if (l.includes("bass")) cls = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  else if (l.includes("alt")) cls = "border-rose-500/40 bg-rose-500/15 text-rose-300";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${cls} whitespace-nowrap`}>
      <Scale className="size-3" /> Rischio commerciale: {level || "Medio"}
    </span>
  );
}

function EarningsSection({ idea }: { idea: GeneratedIdea }) {
  const revenue = parseRange(idea.earning_range);
  const costs = parseRange(idea.monthly_cost);
  const isSavings = /risparm/i.test(idea.earning_range);
  const net = revenue && costs && !isSavings
    ? {
        low: Math.max(0, revenue.low - costs.high),
        high: Math.max(0, revenue.high - costs.low),
      }
    : null;
  const fmtRange = (r: { low: number; high: number }) => `${r.low.toLocaleString("it-IT")}€ – ${r.high.toLocaleString("it-IT")}€/mese`;
  return (
    <div
      className="mt-4 rounded-xl border border-primary/40 p-4"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary font-semibold">
              <Euro className="size-3" /> {isSavings ? "Risparmio mensile indicativo" : "Potenziale profitto netto indicativo"}
            </div>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary">
              Stima indicativa
            </span>
          </div>
          <div className="font-display font-semibold text-2xl mt-1 gradient-text">
            {net ? fmtRange(net) : idea.earning_range}
          </div>
          {net && (
            <p className="text-[10px] text-muted-foreground mt-1 max-w-md">
              Stima calcolata sottraendo i costi mensili stimati dai ricavi potenziali. Non rappresenta una promessa di guadagno.
            </p>
          )}
        </div>
        <RiskBadge level={idea.commercial_risk} />
      </div>

      {net && (
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <div className="rounded-lg border border-border/60 bg-background/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ricavi potenziali</div>
            <div className="text-sm font-medium text-foreground/90 mt-0.5">{idea.earning_range}</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/40 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Costi mensili stimati</div>
            <div className="text-sm font-medium text-foreground/90 mt-0.5">{idea.monthly_cost}</div>
          </div>
        </div>
      )}

      {idea.suggested_price && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/40 border border-border/60">
            <Tag className="size-3 text-primary" /> Prezzo consigliato: <strong className="text-foreground">{idea.suggested_price}</strong>
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-2 mt-3">
        <ScenarioBox label="Prudente" value={idea.scenario_prudent} tone="muted" />
        <ScenarioBox label="Realistico" value={idea.scenario_realistic} tone="primary" />
        <ScenarioBox label="Alto (se validato)" value={idea.scenario_high} tone="muted" />
      </div>

      {idea.break_even && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-background/40 p-2.5 text-xs flex gap-2">
          <Calculator className="size-3.5 text-primary mt-0.5 shrink-0" />
          <span><strong className="text-primary">Punto di pareggio:</strong> <span className="text-foreground/90">{idea.break_even}</span></span>
        </div>
      )}

      {idea.earning_explanation && (
        <p className="text-xs text-foreground/80 mt-2">{idea.earning_explanation}</p>
      )}

      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        Il profitto netto è una stima indicativa. Il risultato reale dipende da mercato, prezzo, traffico, capacità di vendita, qualità dell'offerta, costi degli strumenti e continuità nell'esecuzione.
      </p>
    </div>
  );
}

/** Parse strings like "300€ – 1.000€/mese" or "50€-250€/mese" into { low, high }. */
function parseRange(s: string): { low: number; high: number } | null {
  if (!s) return null;
  const nums = Array.from(s.matchAll(/(\d[\d.\s]*)\s*€/g)).map((m) =>
    parseInt(m[1].replace(/[.\s]/g, ""), 10),
  ).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return null;
  if (nums.length === 1) return { low: nums[0], high: nums[0] };
  return { low: Math.min(nums[0], nums[1]), high: Math.max(nums[0], nums[1]) };
}

function ScenarioBox({ label, value, tone }: { label: string; value: string; tone: "muted" | "primary" }) {
  return (
    <div className={`rounded-lg p-2 border ${tone === "primary" ? "border-primary/40 bg-primary/10" : "border-border/60 bg-background/40"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-medium text-foreground/90 mt-0.5">{value}</div>
    </div>
  );
}
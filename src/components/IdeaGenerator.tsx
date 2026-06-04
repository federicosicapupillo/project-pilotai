import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ToolIcon } from "@/components/ToolIcon";
import { generateAppIdeas, type GeneratedIdea } from "@/lib/idea-generator.functions";
import { trackEvent } from "@/lib/tracking";
import {
  Sparkles, Wand2, Lightbulb, Loader2, ArrowRight, Users, AlertTriangle,
  Target, Coins, Repeat, TrendingUp, Wrench, Bot, Layers,
} from "lucide-react";

type Step = "form" | "loading" | "results";

const SECTORS = [
  "Ristorazione", "Immobiliare", "Fitness / Benessere", "Turismo",
  "Formazione", "Eventi", "Vendite / CRM", "Creator / Content",
  "Servizi locali", "Aziende / B2B", "Non lo so",
];
const APP_TYPES = [
  "App per guadagnare online", "Strumento per aziende", "Gestionale interno",
  "Marketplace", "CRM / Dashboard", "App per semplificare un lavoro",
  "App per vendere un servizio", "Non lo so",
];
const COMPLEXITIES = ["Molto semplice", "Media", "Ambiziosa", "Non lo so"];
const GOALS = [
  "Guadagnare vendendo l'app",
  "Risparmiare tempo in un lavoro",
  "Creare un prodotto da lanciare",
  "Aiutare clienti o aziende",
  "Imparare a costruire app con AI",
];

export type IdeaGeneratorProps = {
  /** Called when user clicks "Sviluppa questa idea" — receives a description
   * suitable to drop into the idea textarea of the estimator. */
  onSelect: (description: string) => void;
  triggerLabel?: string;
  variant?: "card" | "inline";
};

export function IdeaGenerator({ onSelect, triggerLabel = "Genera un'idea per me", variant = "card" }: IdeaGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [sector, setSector] = useState("");
  const [appType, setAppType] = useState("");
  const [complexity, setComplexity] = useState("");
  const [goal, setGoal] = useState("");
  const [interests, setInterests] = useState("");
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const generate = useServerFn(generateAppIdeas);

  const reset = () => {
    setStep("form");
    setIdeas([]);
    setError(null);
  };

  const onSubmit = async () => {
    setStep("loading");
    setError(null);
    void trackEvent("idea_generator_submitted", { sector, appType, complexity, goal });
    try {
      const r = await generate({ data: { sector, appType, complexity, goal, interests } });
      setIdeas(r.ideas);
      setStep("results");
    } catch (e) {
      console.error(e);
      setError("Impossibile generare le idee in questo momento. Riprova tra poco.");
      setStep("form");
    }
  };

  const handleSelect = (idea: GeneratedIdea) => {
    const description = buildDescription(idea);
    void trackEvent("idea_generator_selected", { name: idea.name });
    onSelect(description);
    setOpen(false);
    setTimeout(reset, 300);
  };

  const trigger = (
    <Button variant="glass" size="lg" onClick={() => setOpen(true)}>
      <Sparkles className="size-4" /> {triggerLabel}
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
              Rispondi a poche domande e genera idee di app personalizzate, costruibili con agenti AI e strumenti no-code.
            </p>
          </div>
          {trigger}
        </div>
      ) : trigger}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTimeout(reset, 300); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {step === "results" ? "Idee personalizzate per te" : "Genera un'idea di app"}
            </DialogTitle>
            <DialogDescription>
              {step === "results"
                ? "Scegli quella che ti convince di più. Calcoleremo ore, costi e potenziale."
                : "Rispondi a poche domande: useremo l'AI per proporti idee realistiche e costruibili."}
            </DialogDescription>
          </DialogHeader>

          {step === "form" && (
            <div className="space-y-4 mt-2">
              <FormField label="In quale settore ti interessa creare qualcosa?">
                <ChipGroup options={SECTORS} value={sector} onChange={setSector} />
              </FormField>
              <FormField label="Che tipo di app vorresti creare?">
                <ChipGroup options={APP_TYPES} value={appType} onChange={setAppType} />
              </FormField>
              <FormField label="Quanto vuoi che sia semplice da costruire?">
                <ChipGroup options={COMPLEXITIES} value={complexity} onChange={setComplexity} />
              </FormField>
              <FormField label="Qual è il tuo obiettivo principale?">
                <ChipGroup options={GOALS} value={goal} onChange={setGoal} />
              </FormField>
              <FormField label="Hai competenze o interessi particolari? (facoltativo)">
                <Input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Esempio: ristorazione, immobili, eventi, marketing, viaggi, formazione…"
                  maxLength={400}
                />
              </FormField>

              {error && (
                <div className="text-xs text-destructive flex items-center gap-2">
                  <AlertTriangle className="size-4" /> {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
                <Button variant="hero" onClick={onSubmit}>
                  <Wand2 className="size-4" /> Genera 3 idee
                </Button>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="size-10 text-primary animate-spin" />
              <p className="mt-4 font-display font-semibold">Sto generando 3 idee personalizzate…</p>
              <p className="text-xs text-muted-foreground mt-1">Pochi secondi.</p>
            </div>
          )}

          {step === "results" && (
            <div className="space-y-4 mt-2">
              <div className="grid gap-3">
                {ideas.map((idea, i) => (
                  <IdeaCard key={i} idea={idea} onSelect={() => handleSelect(idea)} />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Stime indicative. Non sono promesse di guadagno: il risultato reale dipende da mercato, prezzo, esecuzione e capacità di vendita.
              </p>
              <div className="flex justify-between gap-2">
                <Button variant="glass" onClick={reset}>← Cambia risposte</Button>
                <Button variant="ghost" onClick={onSubmit}>
                  <Wand2 className="size-4" /> Rigenera idee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(active ? "" : o)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border/60 bg-background/40 text-foreground/80 hover:border-primary/40"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
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
        <span className="text-[10px] px-2 py-1 rounded-full border border-border/60 bg-background/40 whitespace-nowrap">
          {idea.difficulty}
        </span>
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

      <div className="mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] mb-1">
          <Target className="size-3 text-primary" /> Modello ricavo
        </div>
        <p className="text-foreground/90">{idea.revenue_model}</p>
      </div>

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

      <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs flex gap-2">
        <AlertTriangle className="size-3.5 text-amber-400 mt-0.5 shrink-0" />
        <span><strong className="text-amber-300">Rischio:</strong> <span className="text-foreground/90">{idea.main_risk}</span></span>
      </div>

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
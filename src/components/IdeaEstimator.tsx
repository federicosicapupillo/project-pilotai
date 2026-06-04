import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToolIcon } from "@/components/ToolIcon";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import {
  Sparkles, ArrowRight, Wand2, Gauge, Clock, Activity, Layers, Wallet,
  TrendingUp, Calculator, Wrench, AlertCircle, Repeat, Target, Info,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";

type Difficulty = "Semplice" | "Media" | "Avanzata" | "Complessa";
type RevenueModel =
  | "Non lo so ancora"
  | "Abbonamento"
  | "Vendita una tantum"
  | "Commissione"
  | "Lead generation"
  | "Servizio premium"
  | "Uso interno per risparmiare tempo"
  | "Licenza B2B"
  | "Altro";
type PriceBand =
  | "Non lo so"
  | "9€–29€"
  | "49€–97€"
  | "197€–497€"
  | "500€+"
  | "Abbonamento mensile";

type Estimate = {
  hoursLow: number;
  hoursHigh: number;
  difficulty: Difficulty;
  projectType: string;
  costAiLow: number;
  costAiHigh: number;
  costAgencyLow: number;
  costAgencyHigh: number;
  monthlyLow: number;
  monthlyHigh: number;
  tools: string[];
  monthlyCategories: string[];
  potentialLow: number;
  potentialHigh: number;
  potentialLabel: "Basso" | "Medio" | "Alto";
  revenueIdeas: string[];
  signals: { ai: boolean; payments: boolean; chat: boolean; notifications: boolean; media: boolean; marketplace: boolean };
};

const STORAGE_KEY = "draft_idea_description";
const REDIRECT_KEY = "post_auth_redirect";

const COMPLEXITY_KEYWORDS = [
  "marketplace", "pagament", "stripe", "chat", "notific", "twilio", "login",
  "ruoli", "ruolo utent", "database", "dashboard", "ai", "intelligenza",
  "mappa", "geolocal", "calendar", "prenotaz", "recension", "abbonament",
  "area riservata", "upload", "automaz", "api", "multiutente", "admin",
];

function classify(
  idea: string,
  target: string,
  revenue: RevenueModel,
  price: PriceBand,
): Estimate {
  const t = (idea + " " + target).toLowerCase();
  const has = (...kws: string[]) => kws.some((k) => t.includes(k));

  let projectType = "Web app";
  if (has("landing", "lancio", "waitlist", "pre-order")) projectType = "Landing page";
  else if (has("crm", "clienti", "lead", "pipeline")) projectType = "CRM";
  else if (has("gestionale", "magazzino", "fatture")) projectType = "Gestionale";
  else if (has("dashboard", "analytics", "kpi", "metric")) projectType = "Dashboard";
  else if (has("marketplace", "venditori", "annunci")) projectType = "Marketplace";
  else if (has("ai", "intelligenza", "gpt", "agente", "chatbot")) projectType = "App con AI";
  else if (has("interna", "team", "azienda")) projectType = "App interna";

  const signals = {
    ai: has("ai", "intelligenza", "gpt", "agente", "chatbot", "automaz"),
    payments: has("pagament", "stripe", "abbonament", "subscription", "vendi", "checkout"),
    chat: has("chat", "messaggi", "realtime"),
    notifications: has("notific", "twilio", "sms", "whatsapp", "email transactional"),
    media: has("video", "audio", "voce", "immagin", "midjourney", "elevenlabs", "canva"),
    marketplace: has("marketplace", "venditori"),
  };
  const heavyCount = COMPLEXITY_KEYWORDS.filter((k) => t.includes(k)).length;
  const length = t.trim().length;

  let difficulty: Difficulty = "Media";
  if (heavyCount >= 5 || length > 900) difficulty = "Complessa";
  else if (heavyCount >= 3 || length > 500) difficulty = "Avanzata";
  else if (heavyCount === 0 && length < 120) difficulty = "Semplice";

  // Hours & cost ranges by project type (base AI/no-code)
  type Range = [number, number];
  const profile: Record<string, { hours: Range; costAi: Range; monthly: Range }> = {
    "Landing page":   { hours: [6, 14],   costAi: [0, 150],     monthly: [10, 50] },
    "Web app":        { hours: [20, 36],  costAi: [150, 500],   monthly: [30, 150] },
    "CRM":            { hours: [24, 40],  costAi: [200, 800],   monthly: [50, 250] },
    "Dashboard":      { hours: [28, 48],  costAi: [250, 1000],  monthly: [50, 300] },
    "Gestionale":     { hours: [30, 50],  costAi: [250, 1000],  monthly: [50, 300] },
    "Marketplace":    { hours: [45, 90],  costAi: [500, 2000],  monthly: [100, 500] },
    "App interna":    { hours: [18, 32],  costAi: [150, 600],   monthly: [30, 150] },
    "App con AI":     { hours: [30, 55],  costAi: [400, 1500],  monthly: [100, 400] },
  };
  const base = profile[projectType] ?? profile["Web app"];

  const mult =
    difficulty === "Complessa" ? 1.7 :
    difficulty === "Avanzata"  ? 1.35 :
    difficulty === "Semplice"  ? 0.7 : 1;

  const hoursLow  = Math.max(4, Math.round((base.hours[0] * mult) / 2) * 2);
  const hoursHigh = Math.max(hoursLow + 4, Math.round((base.hours[1] * mult) / 2) * 2);

  let costAiLow  = Math.round(base.costAi[0] * mult);
  let costAiHigh = Math.round(base.costAi[1] * mult);
  let monthlyLow  = base.monthly[0];
  let monthlyHigh = base.monthly[1];

  // Bump for signals
  if (signals.payments) { monthlyLow += 20; monthlyHigh += 80; }
  if (signals.notifications) { monthlyLow += 15; monthlyHigh += 100; }
  if (signals.ai) { monthlyLow += 20; monthlyHigh += 150; costAiHigh += 200; }
  if (signals.chat) { monthlyHigh += 80; }
  if (signals.media) { monthlyHigh += 120; }

  // Agency multiplier (traditional dev): ~8x to 15x AI/no-code
  const costAgencyLow  = Math.max(1500, costAiLow * 8);
  const costAgencyHigh = Math.max(5000, costAiHigh * 15);

  // Tools
  const tools = new Set<string>(["ChatGPT", "Lovable", "Perplexity"]);
  if (projectType !== "Landing page") tools.add("Supabase");
  if (difficulty === "Avanzata" || difficulty === "Complessa") tools.add("Antigravity");
  tools.add("GitHub");
  if (signals.payments) tools.add("Stripe");
  if (signals.notifications) tools.add("Twilio");
  if (signals.media) { tools.add("Canva"); tools.add("ElevenLabs"); tools.add("Runway"); }

  const monthlyCategories = [
    "Piattaforma AI/no-code",
    projectType !== "Landing page" ? "Database/backend" : null,
    "Dominio",
    "Email / notifiche",
    signals.ai ? "API AI" : null,
    signals.payments ? "Pagamenti online" : null,
    signals.notifications ? "SMS / WhatsApp" : null,
    signals.media ? "Strumenti media" : null,
    "Traffico / promozione",
  ].filter(Boolean) as string[];

  // Potential revenue (very rough indicative range)
  let potentialLow = 200;
  let potentialHigh = 1500;
  if (projectType === "Marketplace") { potentialLow = 500; potentialHigh = 8000; }
  else if (projectType === "CRM" || projectType === "App con AI" || projectType === "Gestionale") { potentialLow = 500; potentialHigh = 5000; }
  else if (projectType === "Dashboard" || projectType === "Web app") { potentialLow = 300; potentialHigh = 3000; }
  else if (projectType === "Landing page") { potentialLow = 100; potentialHigh = 1000; }
  if (revenue === "Abbonamento" || price === "Abbonamento mensile") potentialHigh = Math.round(potentialHigh * 1.4);
  if (revenue === "Licenza B2B" || price === "500€+") { potentialLow = Math.round(potentialLow * 1.5); potentialHigh = Math.round(potentialHigh * 1.6); }
  if (revenue === "Uso interno per risparmiare tempo") { potentialLow = 0; potentialHigh = Math.max(500, potentialHigh / 3); }

  const potentialLabel: "Basso" | "Medio" | "Alto" =
    potentialHigh >= 4000 ? "Alto" : potentialHigh >= 1500 ? "Medio" : "Basso";

  // Revenue model hypotheses
  const revenueIdeas: string[] = [];
  if (revenue !== "Non lo so ancora" && revenue !== "Altro") revenueIdeas.push(revenue);
  if (projectType === "Marketplace") revenueIdeas.push("Commissione su transazioni");
  if (projectType === "CRM" || projectType === "Gestionale" || projectType === "Dashboard") {
    revenueIdeas.push("Abbonamento mensile");
    revenueIdeas.push("Licenza B2B");
  }
  if (projectType === "Landing page") revenueIdeas.push("Lead generation");
  if (projectType === "App con AI") { revenueIdeas.push("Abbonamento mensile"); revenueIdeas.push("Servizio premium"); }
  if (projectType === "App interna") revenueIdeas.push("Uso interno per risparmiare tempo");
  if (revenueIdeas.length === 0) revenueIdeas.push("Abbonamento mensile", "Vendita una tantum");

  return {
    hoursLow, hoursHigh, difficulty, projectType,
    costAiLow, costAiHigh, costAgencyLow, costAgencyHigh,
    monthlyLow, monthlyHigh,
    tools: Array.from(tools),
    monthlyCategories,
    potentialLow, potentialHigh, potentialLabel,
    revenueIdeas: Array.from(new Set(revenueIdeas)).slice(0, 3),
    signals,
  };
}

const fmt = (n: number) => n.toLocaleString("it-IT") + "€";

export type IdeaEstimatorProps = { embed?: boolean };

export function IdeaEstimator({ embed = false }: IdeaEstimatorProps) {
  const [idea, setIdea] = useState("");
  const [target, setTarget] = useState("");
  const [revenue, setRevenue] = useState<RevenueModel>("Non lo so ancora");
  const [price, setPrice] = useState<PriceBand>("Non lo so");
  const [result, setResult] = useState<Estimate | null>(null);
  const navigate = useNavigate();

  const onCalc = () => {
    if (idea.trim().length < 8) return;
    const r = classify(idea, target, revenue, price);
    setResult(r);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, idea.trim());
    }
    void trackEvent("idea_estimate_calculated", {
      hoursLow: r.hoursLow, hoursHigh: r.hoursHigh,
      difficulty: r.difficulty, projectType: r.projectType,
      costAiLow: r.costAiLow, costAiHigh: r.costAiHigh,
      monthlyLow: r.monthlyLow, monthlyHigh: r.monthlyHigh,
      potentialLabel: r.potentialLabel,
    });
  };

  const handleGeneratedIdea = (description: string) => {
    setIdea(description);
    const r = classify(description, target, revenue, price);
    setResult(r);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, description.trim());
    }
    void trackEvent("idea_estimate_from_generator", {
      difficulty: r.difficulty, projectType: r.projectType,
    });
    setTimeout(() => {
      if (typeof document !== "undefined") {
        document.getElementById("estimator-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const goToRoadmap = () => {
    if (typeof window !== "undefined" && idea.trim()) {
      localStorage.setItem(STORAGE_KEY, idea.trim());
      localStorage.setItem(REDIRECT_KEY, "/new-project");
      localStorage.setItem("pending_plan", "roadmap");
    }
    void trackEvent("cta_roadmap_29");
    navigate({ to: "/prezzi" });
  };

  const card = (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-primary/20 glow-soft">
      {!embed && (
        <>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Gauge className="size-3.5 text-primary" /> Calcolatore intelligente
          </div>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl mt-2">
            Scrivi la tua idea.{" "}
            <span className="gradient-text">Stima ore, costi e potenziale economico.</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            La nostra AI ti aiuta a stimare ore, difficoltà, costi, strumenti necessari e possibile modello di ricavo per creare la prima versione funzionante.
          </p>
        </>
      )}

      <div className={embed ? "space-y-3" : "mt-5 space-y-3"}>
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Raccontami la tua idea…"
          rows={5}
          maxLength={2000}
          className="text-base"
        />

        {/* Domande facoltative */}
        <details className="rounded-lg border border-border/60 bg-background/30">
          <summary className="cursor-pointer text-xs px-3 py-2 text-muted-foreground hover:text-foreground">
            Aggiungi dettagli facoltativi per una stima più precisa
          </summary>
          <div className="grid sm:grid-cols-3 gap-3 p-3 pt-1">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">A chi vuoi venderla?</label>
              <Input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Es: ristoratori, agenti immobiliari, freelance…"
                className="mt-1"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Come pensi di guadagnarci?</label>
              <select
                value={revenue}
                onChange={(e) => setRevenue(e.target.value as RevenueModel)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {["Non lo so ancora", "Abbonamento", "Vendita una tantum", "Commissione", "Lead generation", "Servizio premium", "Uso interno per risparmiare tempo", "Licenza B2B", "Altro"].map((o) => (
                  <option key={o} value={o} className="bg-background">{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Quanto vorresti far pagare?</label>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value as PriceBand)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {["Non lo so", "9€–29€", "49€–97€", "197€–497€", "500€+", "Abbonamento mensile"].map((o) => (
                  <option key={o} value={o} className="bg-background">{o}</option>
                ))}
              </select>
            </div>
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="hero" size="lg" onClick={onCalc} disabled={idea.trim().length < 8}>
            <Wand2 className="size-4" /> Calcola ore, costi e potenziale
          </Button>
          <p className="text-xs text-muted-foreground">
            Stima orientativa basata sulla tua descrizione. Non è una promessa: serve a capire l'ordine di grandezza.
          </p>
        </div>

        {/* Non hai ancora un'idea? */}
        <IdeaGenerator onSelect={handleGeneratedIdea} />
      </div>

      {result && <ResultCard result={result} onRoadmap={goToRoadmap} />}
    </div>
  );

  if (embed) return card;

  return (
    <section className="relative">
      <div className="max-w-3xl mx-auto px-6 -mt-10 pb-10">{card}</div>
    </section>
  );
}

function ResultCard({ result, onRoadmap }: { result: Estimate; onRoadmap: () => void }) {
  const breakEvenPrices = [29, 97, 297];
  const baseCost = Math.round((result.costAiLow + result.costAiHigh) / 2);

  return (
    <div
      id="estimator-result"
      className="mt-6 rounded-2xl p-5 sm:p-6 border border-primary/30 relative overflow-hidden space-y-5"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
      }}
    >
      {/* Top metrics */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Metric icon={Clock} label="Prima versione stimata" value={`${result.hoursLow}–${result.hoursHigh} ore`} accent />
        <Metric icon={Activity} label="Difficoltà" value={result.difficulty} />
        <Metric icon={Layers} label="Tipo progetto" value={result.projectType} />
      </div>

      {/* Difficulty bar */}
      <DifficultyBar level={result.difficulty} />

      {/* Costi iniziali */}
      <Block icon={Wallet} title="Costo stimato per creare la prima versione">
        <div className="grid sm:grid-cols-2 gap-3">
          <CostBox
            label="Con metodo AI/no-code"
            value={`${fmt(result.costAiLow)} – ${fmt(result.costAiHigh)}`}
            highlight
          />
          <CostBox
            label="Con sviluppo tradizionale"
            value={`${fmt(result.costAgencyLow)} – ${fmt(result.costAgencyHigh)}`}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Il metodo AI/no-code può ridurre molto il costo iniziale, ma non elimina test, strategia, strumenti e manutenzione.
        </p>
      </Block>

      {/* Costi mensili */}
      <Block icon={Repeat} title="Costi mensili possibili">
        <div className="text-lg font-display font-semibold gradient-text">
          {fmt(result.monthlyLow)} – {fmt(result.monthlyHigh)}/mese
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {result.monthlyCategories.map((c) => (
            <span key={c} className="text-xs px-2 py-1 rounded-full bg-background/40 border border-border/60">
              {c}
            </span>
          ))}
        </div>
      </Block>

      {/* Tool consigliati */}
      <Block icon={Wrench} title="Strumenti consigliati">
        <div className="flex flex-wrap gap-2">
          {result.tools.map((t) => (
            <span key={t} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/60 text-sm">
              <ToolIcon name={t} size={16} /> {t}
            </span>
          ))}
        </div>
      </Block>

      {/* Potenziale economico */}
      <Block icon={TrendingUp} title="Potenziale economico indicativo">
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="text-lg font-display font-semibold gradient-text">
            {fmt(result.potentialLow)} – {fmt(result.potentialHigh)}/mese
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${
            result.potentialLabel === "Alto" ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" :
            result.potentialLabel === "Medio" ? "border-primary/40 text-primary bg-primary/10" :
            "border-border/60 text-muted-foreground bg-background/40"
          }`}>
            Potenziale {result.potentialLabel.toLowerCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Dipende da target, prezzo, traffico, qualità dell'offerta e capacità di vendita.
        </p>
      </Block>

      {/* Modello di ricavo */}
      <Block icon={Target} title="Modello di ricavo consigliato">
        <ul className="space-y-1 text-sm">
          {result.revenueIdeas.map((r) => (
            <li key={r} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" /> {r}
            </li>
          ))}
        </ul>
      </Block>

      {/* Punto di pareggio */}
      <Block icon={Calculator} title="Quante vendite servono per rientrare?">
        <p className="text-xs text-muted-foreground mb-2">
          Costo iniziale di riferimento: <strong className="text-foreground">{fmt(baseCost)}</strong>
        </p>
        <div className="grid sm:grid-cols-3 gap-2">
          {breakEvenPrices.map((p) => {
            const n = Math.max(1, Math.ceil(baseCost / p));
            return (
              <div key={p} className="rounded-xl bg-background/40 border border-border/60 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Prezzo {p}€</div>
                <div className="font-display font-semibold text-base mt-1">
                  ~{n} vendite
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Formula: costo iniziale stimato / prezzo ipotizzato = vendite per break-even.
        </p>
      </Block>

      {/* Avviso realistico */}
      <div className="flex items-start gap-2 rounded-xl bg-background/40 border border-border/60 p-3">
        <AlertCircle className="size-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Questa non è una promessa di guadagno. È una stima indicativa basata sulle informazioni inserite, sul tipo di progetto, sui costi ipotizzati, sul target e sul possibile modello di ricavo. Il risultato reale dipende da mercato, prezzo, traffico, qualità dell'offerta, esecuzione e capacità di vendita.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <Link to="/method">
          <Button variant="glass" size="lg">Voglio prima vedere il metodo</Button>
        </Link>
        <Button variant="hero" size="lg" onClick={onRoadmap}>
          Crea la roadmap completa a 29€ <ArrowRight className="size-4" />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-start gap-1">
        <Info className="size-3 mt-0.5 shrink-0" />
        La roadmap completa ti mostra step, agenti, strumenti, prompt e avanzamento percentuale per costruire la prima versione funzionante della tua app.
      </p>
    </div>
  );
}

function Metric({
  icon: Icon, label, value, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-background/40 border border-border/60 p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3 text-primary" /> {label}
      </div>
      <div className={`mt-1 font-display font-semibold text-lg ${accent ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}

function Block({
  icon: Icon, title, children,
}: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-background/30 border border-border/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
        <Icon className="size-3.5 text-primary" /> {title}
      </div>
      {children}
    </div>
  );
}

function CostBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? "border-primary/40 bg-primary/10" : "border-border/60 bg-background/40"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-base ${highlight ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}

function DifficultyBar({ level }: { level: Difficulty }) {
  const levels: Difficulty[] = ["Semplice", "Media", "Avanzata", "Complessa"];
  const idx = levels.indexOf(level);
  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {levels.map((l, i) => (
          <span key={l} className={i === idx ? "text-primary font-semibold" : ""}>{l}</span>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
        <div
          className="h-full rounded-full gradient-bg transition-all"
          style={{ width: `${((idx + 1) / levels.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
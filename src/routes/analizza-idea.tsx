import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolIcon } from "@/components/ToolIcon";
import {
  Sparkles, ArrowRight, Layers, Database, ShieldCheck, Hammer, Bug, Wand2, Gauge,
  Bot, Compass, ClipboardList, Wrench, AlertCircle,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/analizza-idea")({
  head: () => ({
    meta: [
      { title: "Analizza la tua idea gratis — Da Idea ad App" },
      { name: "description", content: "Scrivi la tua idea e scopri in quante ore puoi creare la prima versione funzionante della tua app." },
      { property: "og:title", content: "Analizza la tua idea gratis" },
      { property: "og:description", content: "Stima ore, difficoltà, tipo progetto, agenti e tool consigliati per la tua idea." },
    ],
  }),
  component: AnalizzaIdeaPage,
});

type Difficulty = "Semplice" | "Media" | "Avanzata" | "Complessa";
type Estimate = {
  hoursLow: number;
  hoursHigh: number;
  difficulty: Difficulty;
  projectType: string;
  tools: string[];
  hasAI: boolean;
  hasDB: boolean;
};

const STORAGE_KEY = "draft_idea_description";

function classify(idea: string): Estimate {
  const t = idea.toLowerCase();
  const has = (...kws: string[]) => kws.some((k) => t.includes(k));

  let projectType = "Web app";
  if (has("crm", "clienti", "lead", "pipeline", "follow-up")) projectType = "CRM";
  else if (has("marketplace", "venditori", "annunci", "compra")) projectType = "Marketplace";
  else if (has("landing", "lancio", "pre-order", "waitlist")) projectType = "Landing page";
  else if (has("gestionale", "magazzino", "ordini", "fatture")) projectType = "Gestionale";
  else if (has("dashboard", "metrich", "analytics", "kpi")) projectType = "Dashboard";
  else if (has("interna", "team interno", "azienda interna")) projectType = "App interna";
  else if (has("ai", "intelligenza", "gpt", "agente")) projectType = "App con AI";

  const heavySignals = [
    "pagament", "stripe", "abbonament", "subscription",
    "realtime", "chat", "video", "ai", "intelligenza",
    "marketplace", "ruoli", "admin", "permess",
    "mappa", "geolocal", "notifiche push",
  ].filter((k) => t.includes(k)).length;
  const length = t.trim().length;

  let difficulty: Difficulty = "Media";
  if (heavySignals >= 3 || length > 800) difficulty = "Complessa";
  else if (heavySignals === 2 || length > 500) difficulty = "Avanzata";
  else if (heavySignals === 0 && length < 120) difficulty = "Semplice";

  const baseByType: Record<string, [number, number]> = {
    "Landing page": [6, 14],
    "Web app": [20, 36],
    "CRM": [24, 40],
    "Dashboard": [28, 48],
    "Gestionale": [30, 50],
    "Marketplace": [40, 70],
    "App interna": [18, 32],
    "App con AI": [30, 55],
  };
  const [bl, bh] = baseByType[projectType] ?? [20, 36];
  const mult =
    difficulty === "Complessa" ? 1.7 :
    difficulty === "Avanzata" ? 1.35 :
    difficulty === "Semplice" ? 0.7 : 1;
  const hoursLow = Math.max(4, Math.round((bl * mult) / 2) * 2);
  const hoursHigh = Math.max(hoursLow + 4, Math.round((bh * mult) / 2) * 2);

  const hasDB = !has("landing", "solo pagina");
  const hasAI = has("ai", "intelligenza", "gpt", "agente", "chatbot");
  const isAdvanced = difficulty === "Avanzata" || difficulty === "Complessa";

  const tools = ["ChatGPT", "Lovable", "Perplexity"];
  if (hasDB) tools.push("Supabase");
  if (isAdvanced) tools.push("Antigravity");

  return { hoursLow, hoursHigh, difficulty, projectType, tools, hasAI, hasDB };
}

const STEPS = [
  { icon: Sparkles, text: "definizione della prima versione funzionante" },
  { icon: Layers, text: "schermate principali" },
  { icon: Database, text: "database" },
  { icon: ShieldCheck, text: "login utenti" },
  { icon: Hammer, text: "costruzione con Lovable" },
  { icon: Bug, text: "test e correzioni" },
];

const AGENTS = [
  { name: "Agente Stratega", icon: Compass, desc: "Inquadra l'idea e definisce le priorità." },
  { name: "Agente Product Manager", icon: ClipboardList, desc: "Trasforma l'idea in funzioni concrete." },
  { name: "Specialista Prima Versione", icon: Bot, desc: "Decide cosa includere nel primo rilascio." },
  { name: "Agente Prompt Engineer", icon: Wand2, desc: "Prepara i prompt operativi pronti all'uso." },
];

function AnalizzaIdeaPage() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<Estimate | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onCalc = () => {
    if (idea.trim().length < 8) return;
    const r = classify(idea);
    setResult(r);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, idea.trim());
    void trackEvent("idea_estimate_calculated", {
      page: "analizza-idea",
      hoursLow: r.hoursLow,
      hoursHigh: r.hoursHigh,
      difficulty: r.difficulty,
      projectType: r.projectType,
    });
  };

  const goToRoadmap = () => {
    if (typeof window !== "undefined" && idea.trim()) {
      localStorage.setItem(STORAGE_KEY, idea.trim());
      localStorage.setItem("pending_plan", "roadmap");
      localStorage.setItem("post_auth_redirect", "/new-project");
    }
    void trackEvent("cta_roadmap_29", { from: "analizza-idea" });
    if (user) navigate({ to: "/new-project" });
    else navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 w-full">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Gauge className="size-3 text-primary" /> Analisi gratuita
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-4">
            Hai un'idea per un'<span className="gradient-text">app</span>?
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Scrivila qui sotto e scopri in quante ore puoi creare la prima versione funzionante.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-primary/20 glow-soft mt-10">
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Esempio: voglio creare un'app per aiutare ristoratori a trovare personale extra per weekend e turni serali…"
            rows={6}
            maxLength={2000}
            className="text-base"
          />
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button
              variant="hero"
              size="lg"
              onClick={onCalc}
              disabled={idea.trim().length < 8}
            >
              <Wand2 className="size-4" /> Calcola le ore
            </Button>
            <p className="text-xs text-muted-foreground">
              Analizzi la tua idea gratis e scopri da dove partire.
            </p>
          </div>
        </div>

        {result && (
          <div
            className="mt-8 rounded-2xl p-6 sm:p-8 border border-primary/30 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
            }}
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <Metric label="Prima versione stimata" value={`${result.hoursLow}–${result.hoursHigh} ore operative`} accent />
              <Metric label="Difficoltà" value={result.difficulty} />
              <Metric label="Tipo progetto" value={result.projectType} />
            </div>

            <Section title="Cosa servirà per costruirla">
              <ol className="grid sm:grid-cols-2 gap-2">
                {STEPS.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="size-6 rounded-full bg-primary/15 text-primary text-xs grid place-items-center font-display font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex items-center gap-2">
                      <s.icon className="size-3.5 text-primary/80" />
                      {s.text}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Agenti consigliati">
              <div className="grid sm:grid-cols-2 gap-3">
                {AGENTS.map((a) => (
                  <div key={a.name} className="flex items-start gap-3 rounded-xl bg-background/40 border border-border/60 p-3">
                    <span className="size-8 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
                      <a.icon className="size-4" />
                    </span>
                    <div>
                      <div className="font-medium text-sm">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Tool consigliati">
              <div className="flex flex-wrap gap-2">
                {result.tools.map((t) => (
                  <span key={t} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/60 text-sm">
                    <ToolIcon name={t} size={16} />
                    {t}
                  </span>
                ))}
              </div>
            </Section>

            <div className="mt-6 flex items-start gap-2 rounded-xl bg-background/40 border border-border/60 p-4">
              <AlertCircle className="size-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Questa è una stima iniziale per creare una prima versione funzionante. Il tempo reale può cambiare in base a complessità, integrazioni, modifiche richieste e livello di dettaglio.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link to="/academy">
                <Button variant="glass" size="lg">Voglio prima vedere il metodo</Button>
              </Link>
              <Button variant="hero" size="lg" onClick={goToRoadmap}>
                Crea la roadmap completa a 29€ <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {!result && (
          <div className="mt-10 grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
            <Hint icon={Wrench} title="Stima realistica" text="Ore operative per la prima versione funzionante." />
            <Hint icon={Bot} title="Agenti AI" text="Ti diciamo quali agenti useremo per costruirla." />
            <Hint icon={Layers} title="Tool consigliati" text="Lovable, Supabase, ChatGPT e altri se servono." />
          </div>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-background/40 border border-border/60 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-lg ${accent ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

function Hint({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <Icon className="size-4 text-primary mb-2" />
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="text-xs">{text}</div>
    </div>
  );
}
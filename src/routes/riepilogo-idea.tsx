import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ToolIcon";
import { ReusableToolkitBox, getReuseBadge } from "@/components/ReusableToolkitBox";
import {
  ArrowRight, Sparkles, Clock, Activity, Layers, Users, AlertCircle,
  Lightbulb, Target, Wrench, Bot, TrendingUp, Wallet, ListChecks, XCircle, Info, Loader2,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import {
  classify, getBudget, fmt, loadIdeaParams,
  type Estimate, type IdeaParams,
} from "@/lib/idea-estimate";
import { generateProjectContent, type GeneratedProjectContent } from "@/lib/ai-generation.functions";

export const Route = createFileRoute("/riepilogo-idea")({
  head: () => ({
    meta: [
      { title: "Riepilogo della tua idea — analisi gratuita" },
      { name: "description", content: "Ecco una prima analisi gratuita della tua idea: ore, difficoltà, costi, strumenti e potenziale economico indicativo." },
    ],
  }),
  component: RiepilogoIdeaPage,
});

function RiepilogoIdeaPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<IdeaParams | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setParams(loadIdeaParams());
    setHydrated(true);
  }, []);

  const result = useMemo<Estimate | null>(() => {
    if (!params || !params.idea || params.idea.trim().length < 8) return null;
    return classify(params.idea, params.target, params.revenue, params.price);
  }, [params]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-6 py-16 w-full" />
      </div>
    );
  }

  if (!params || !result) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="max-w-2xl mx-auto px-6 py-20 w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Analisi gratuita
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold mt-4">
            Prima scrivi o scegli un'<span className="gradient-text">idea</span> da analizzare.
          </h1>
          <p className="text-muted-foreground mt-3">
            Per generare il riepilogo gratuito serve una descrizione della tua idea o una delle idee suggerite.
          </p>
          <div className="mt-8">
            <Button variant="hero" size="lg" onClick={() => navigate({ to: "/analizza-idea" })}>
              Analizza la tua idea gratis <ArrowRight className="size-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return <RiepilogoContent params={params} result={result} />;
}

function RiepilogoContent({ params, result }: { params: IdeaParams; result: Estimate }) {
  const navigate = useNavigate();
  const inserted = getBudget(params.budget);
  const budgetLabel =
    inserted && params.budget !== "Non lo so ancora" && inserted.max > 0
      ? `${inserted.display}`
      : "Budget non indicato";

  // Budget consigliato per partire (range più solido)
  const recLow = Math.max(result.costRecLow, 500);
  const recHigh = Math.max(result.costRecHigh, recLow + 500);

  // Profit netto indicativo (realistic vs costi mensili stack essenziale)
  const revLow = result.scenarios.prudent.revenue;
  const revHigh = result.scenarios.realistic.revenue;
  const profitLow = Math.max(0, revLow - result.monthlyFullHigh);
  const profitHigh = Math.max(profitLow + 100, revHigh - result.monthlyEssLow);

  // Idea title (prima frase / 60 char)
  const title = useMemo(() => {
    const t = params.idea.split(/[.\n!?]/)[0]?.trim() || params.idea.trim();
    return t.length > 80 ? t.slice(0, 77) + "…" : t;
  }, [params.idea]);

  // Sezioni dinamiche basate sui signals
  const firstVersion = buildFirstVersion(result);
  const notNow = buildNotNow(result);
  const agents = ["Agente Stratega", "Agente Product Manager", "Specialista Prima Versione", "Agente Prompt Engineer", "Agente Tester"];

  const goToRoadmap = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_plan", "roadmap");
      localStorage.setItem("post_auth_redirect", "/new-project");
    }
    void trackEvent("riepilogo_cta_roadmap_29");
    navigate({ to: "/prezzi" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Analisi gratuita
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold mt-4 leading-[1.1]">
            Riepilogo della tua <span className="gradient-text">idea</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Ecco una prima analisi gratuita della tua idea. Per trasformarla in un piano completo puoi creare la roadmap passo passo.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {/* 1 — Idea analizzata */}
          <Section icon={Lightbulb} title="Idea analizzata">
            <div className="font-display font-semibold text-lg sm:text-xl">{title}</div>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{params.idea}</p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-background/40 border border-border/60">
              <Layers className="size-3 text-primary" /> Tipo progetto: <strong className="text-foreground">{result.projectType}</strong>
            </div>
          </Section>

          {/* 2 — Target */}
          <Section icon={Users} title="Target">
            <p className="text-sm text-foreground/90">
              {params.target && params.target !== "Non lo so ancora"
                ? `Target principale: ${params.target}.`
                : "Target da definire. Indicare un pubblico chiaro aiuta a costruire la prima versione più focalizzata."}
            </p>
          </Section>

          {/* 3 — Problema risolto */}
          <Section icon={AlertCircle} title="Problema risolto">
            <p className="text-sm text-foreground/90">
              {guessProblem(params.idea, result)}
            </p>
          </Section>

          {/* 4 — Soluzione proposta */}
          <Section icon={Sparkles} title="Soluzione proposta">
            <p className="text-sm text-foreground/90">
              {guessSolution(params.idea, result)}
            </p>
          </Section>

          {/* 5 — Prima versione funzionante + 6 — funzioni essenziali */}
          <Section icon={ListChecks} title="Prima versione funzionante">
            <p className="text-sm text-foreground/90">
              La prima versione funzionante può includere le funzioni essenziali per validare l'idea, senza appesantire il progetto.
            </p>
            <ul className="mt-3 grid sm:grid-cols-2 gap-2">
              {firstVersion.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm rounded-lg bg-background/40 border border-border/60 px-3 py-2">
                  <span className="size-1.5 mt-2 rounded-full bg-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </Section>

          {/* 7 — Cosa non costruire subito */}
          <Section icon={XCircle} title="Cosa non costruire subito">
            <ul className="grid sm:grid-cols-2 gap-2">
              {notNow.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <XCircle className="size-3.5 mt-1 shrink-0 opacity-70" /> {f}
                </li>
              ))}
            </ul>
          </Section>

          {/* 8 + 9 — Stima ore + difficoltà */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Section icon={Clock} title="Stima ore">
              <div className="font-display font-semibold text-2xl gradient-text">
                {result.hoursLow}–{result.hoursHigh} ore
              </div>
              <p className="text-xs text-muted-foreground mt-1">Stima indicativa della prima versione funzionante.</p>
            </Section>
            <Section icon={Activity} title="Difficoltà">
              <DifficultyBadge level={result.difficulty} />
              <p className="text-xs text-muted-foreground mt-2">
                Difficoltà stimata in base al numero di funzioni, ruoli utente e integrazioni richieste.
              </p>
            </Section>
          </div>

          {/* 10 + 11 — Budget */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Section icon={Wallet} title="Budget inserito">
              <div className="font-display font-semibold text-xl">{budgetLabel}</div>
            </Section>
            <Section icon={Wallet} title="Budget consigliato per partire">
              <div className="font-display font-semibold text-xl gradient-text">
                {fmt(recLow)} – {fmt(recHigh)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Il budget consigliato serve per costruire una prima versione più solida, con meno compromessi.
              </p>
            </Section>
          </div>

          {/* 12 — Potenziale economico indicativo */}
          <Section icon={TrendingUp} title="Potenziale economico indicativo">
            <div className="grid sm:grid-cols-3 gap-3">
              <MiniBox label="Ricavi potenziali" value={`${fmt(revLow)} – ${fmt(revHigh)}/mese`} />
              <MiniBox label="Costi mensili stimati" value={`${fmt(result.monthlyEssLow)} – ${fmt(result.monthlyFullHigh)}/mese`} />
              <MiniBox label="Guadagno netto indicativo" value={`${fmt(profitLow)} – ${fmt(profitHigh)}/mese`} highlight />
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
              <Info className="size-3" /> Stima indicativa
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Questa non è una promessa di guadagno. È una stima indicativa basata sui dati inseriti.
            </p>
          </Section>

          {/* 13 — Modello di ricavo consigliato */}
          <Section icon={Target} title="Modello di ricavo consigliato">
            <div className="flex flex-wrap gap-2">
              {result.revenueIdeas.map((r) => (
                <span key={r} className="text-sm px-3 py-1.5 rounded-full bg-background/40 border border-border/60">{r}</span>
              ))}
            </div>
          </Section>

          {/* 14 — Strumenti consigliati */}
          <Section icon={Wrench} title="Strumenti consigliati">
            <div className="flex flex-wrap gap-2">
              {result.tools.map((t) => (
                <span key={t} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/60 text-sm">
                  <ToolIcon name={t} size={16} />
                  <span>{t}</span>
                  <span className="text-[10px] uppercase tracking-wider text-primary/90 border border-primary/30 bg-primary/10 rounded-full px-1.5 py-0.5">
                    {getReuseBadge(t)}
                  </span>
                </span>
              ))}
            </div>
          </Section>

          {/* 15 — Agenti consigliati */}
          <Section icon={Bot} title="Agenti consigliati">
            <div className="flex flex-wrap gap-2">
              {agents.map((a) => (
                <span key={a} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/60 text-sm">
                  <Bot className="size-3.5 text-primary" /> {a}
                </span>
              ))}
            </div>
          </Section>

          {/* Cassetta degli attrezzi riusabile */}
          <ReusableToolkitBox showExample />

          {/* 16 — Prossimo passo */}
          <div
            className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-primary/30"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
            }}
          >
            <div className="absolute -top-20 -right-16 size-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" aria-hidden />
            <h2 className="font-display font-semibold text-2xl sm:text-3xl">
              Vuoi trasformare questa idea in un piano completo?
            </h2>
            <p className="text-sm sm:text-base text-foreground/85 mt-3 max-w-2xl">
              La roadmap completa ti mostra tutti gli step per costruire la prima versione funzionante: cosa fare, in che ordine, quali agenti usare, quali strumenti aprire, quali prompt copiare e a che percentuale sei arrivato.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="xl" onClick={goToRoadmap}>
                Crea la roadmap completa a 29€ <ArrowRight className="size-4" />
              </Button>
              <Link to="/method">
                <Button variant="glass" size="xl">Voglio prima vedere il metodo</Button>
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 px-2">
            <Info className="size-3 mt-0.5 shrink-0" />
            Le stime sono indicative e servono a capire l'ordine di grandezza del progetto. I risultati reali dipendono da mercato, prezzo, offerta, traffico, capacità di vendita, qualità del prodotto ed esecuzione.
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6 border border-border/60">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
        <Icon className="size-3.5 text-primary" /> {title}
      </div>
      {children}
    </section>
  );
}

function MiniBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? "border-primary/40 bg-primary/10" : "border-border/60 bg-background/40"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-base ${highlight ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}

function DifficultyBadge({ level }: { level: Estimate["difficulty"] }) {
  const color =
    level === "Semplice"  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" :
    level === "Media"     ? "border-sky-500/40 bg-sky-500/15 text-sky-300" :
    level === "Avanzata"  ? "border-amber-500/40 bg-amber-500/15 text-amber-300" :
                            "border-rose-500/40 bg-rose-500/15 text-rose-300";
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${color}`}>
      <Activity className="size-3.5" /> {level}
    </span>
  );
}

function buildFirstVersion(r: Estimate): string[] {
  const base = [
    "Registrazione e login utente",
    "Schermata principale chiara",
    "Flusso principale dell'idea",
    "Salvataggio dei dati essenziali",
    "Dashboard base per gestire le informazioni",
  ];
  if (r.projectType === "Landing page") {
    return [
      "Landing page con messaggio chiaro",
      "Form di raccolta contatti / waitlist",
      "Sezione benefici e prove sociali",
      "Email automatica di conferma",
    ];
  }
  if (r.projectType === "Marketplace") {
    return [
      "Registrazione utente e venditore",
      "Pubblicazione annuncio / offerta",
      "Ricerca e dettaglio annuncio",
      "Contatto / candidatura tra le parti",
      "Dashboard gestione richieste",
    ];
  }
  if (r.projectType === "CRM" || r.projectType === "Gestionale" || r.projectType === "Dashboard") {
    return [
      "Login e ruoli utente base",
      "Inserimento e gestione record principali",
      "Vista lista con filtri essenziali",
      "Dettaglio e modifica record",
      "Dashboard sintetica con i numeri chiave",
    ];
  }
  if (r.projectType === "App con AI") {
    return [
      "Onboarding e login utente",
      "Input principale per l'AI",
      "Generazione risultato con l'AI",
      "Cronologia delle generazioni",
      "Area account e limiti d'uso",
    ];
  }
  return base;
}

function buildNotNow(r: Estimate): string[] {
  const base = [
    "App mobile nativa",
    "Chat avanzata in tempo reale",
    "Pagamenti complessi e fatturazione automatica",
    "Automazioni troppo spinte",
    "Funzioni di amministrazione avanzate",
  ];
  if (r.projectType === "Marketplace") base.push("Sistema di recensioni complesso");
  if (r.projectType === "App con AI") base.push("Fine-tuning di modelli personalizzati");
  return base.slice(0, 5);
}

function guessProblem(idea: string, r: Estimate): string {
  const lower = idea.toLowerCase();
  if (lower.includes("trovare")) return "Le persone fanno fatica a trovare velocemente ciò di cui hanno bisogno, e perdono tempo o opportunità.";
  if (r.projectType === "Marketplace") return "Domanda e offerta non si incontrano facilmente: serve un canale dedicato per metterle in contatto.";
  if (r.projectType === "CRM" || r.projectType === "Gestionale") return "La gestione delle informazioni è dispersa tra fogli, email e strumenti diversi, con il rischio di perdere dati o tempo.";
  if (r.projectType === "Dashboard") return "I dati esistono ma non sono leggibili in un colpo d'occhio per prendere decisioni rapide.";
  if (r.projectType === "Landing page") return "C'è un'idea da validare ma manca un punto di contatto chiaro per raccogliere interesse e contatti.";
  if (r.projectType === "App con AI") return "Un'attività manuale richiede troppo tempo o competenze che si possono accelerare con l'AI.";
  return "C'è un'attività ripetitiva o poco chiara che potrebbe diventare molto più semplice con uno strumento dedicato.";
}

function guessSolution(_idea: string, r: Estimate): string {
  if (r.projectType === "Marketplace") return "Una piattaforma che mette in contatto domanda e offerta in modo semplice e affidabile, con dashboard dedicate alle due parti.";
  if (r.projectType === "CRM" || r.projectType === "Gestionale") return "Uno strumento centralizzato per inserire, organizzare e ritrovare le informazioni principali del business.";
  if (r.projectType === "Dashboard") return "Una dashboard chiara che raccoglie i dati principali e mostra i numeri chiave per decidere meglio e prima.";
  if (r.projectType === "Landing page") return "Una landing page focalizzata che racconta il valore dell'idea e raccoglie i contatti delle persone interessate.";
  if (r.projectType === "App con AI") return "Un'app che usa l'AI per automatizzare i passaggi più lunghi, lasciando alla persona solo le decisioni davvero importanti.";
  return "Un'app semplice e diretta che porta a termine il flusso principale, senza distrazioni e senza funzioni inutili.";
}

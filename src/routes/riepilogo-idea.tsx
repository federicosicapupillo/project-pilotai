import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ToolIcon";
import { ReusableToolkitBox, getReuseBadge } from "@/components/ReusableToolkitBox";
import {
  ArrowRight, Sparkles, Clock, Activity, Layers, Users, AlertCircle,
  Lightbulb, Wrench, Bot, ListChecks, Info, Loader2,
  Monitor, Plug, Wand2, TrendingUp, Euro,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { useActivateTeam } from "@/hooks/use-activate-team";
import {
  classify, loadIdeaParams,
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
} from "@/lib/idea-deterministic";

export const Route = createFileRoute("/riepilogo-idea")({
  head: () => ({
    meta: [
      { title: "Ecco l'analisi della tua idea" },
      { name: "description", content: "Il tuo agente AI ha trasformato la tua idea in un primo piano operativo: target, problema, soluzione, funzioni, schermate, complessità e tempi." },
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
        <main className="max-w-4xl mx-auto px-6 py-16 w-full" />
      </div>
    );
  }

  if (!params || !result) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="max-w-2xl mx-auto px-6 py-20 w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Analisi gratuita
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold mt-4">
            Non abbiamo ancora un'<span className="gradient-text">idea</span> da analizzare.
          </h1>
          <p className="text-muted-foreground mt-3">
            Torna alla home e scrivi la tua idea: il tuo agente AI la trasformerà in un primo piano operativo.
          </p>
          <div className="mt-8">
            <Button variant="hero" size="lg" onClick={() => navigate({ to: "/analizza-idea" })}>
              Scrivi la mia idea <ArrowRight className="size-4" />
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
  const generate = useServerFn(generateIdeaSummary);

  // Deterministic per-idea key + tier (stable across refresh / re-submit of same idea).
  const ideaHash = useMemo(() => hashIdea(params.idea), [params.idea]);
  const tier: IdeaTier = useMemo(
    () => classifyIdeaTier(params.idea, params.target),
    [params.idea, params.target],
  );

  // Cached summary for repeat visits (no AI re-call).
  type SummaryType = Awaited<ReturnType<typeof generateIdeaSummary>>;
  const cached = useMemo<SummaryType | null>(
    () => loadCachedSummary<SummaryType>(ideaHash),
    [ideaHash],
  );

  const { data: summary, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["idea-summary", ideaHash],
    queryFn: async () => {
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

  // Deterministic, idea-stable values (override any AI variance).
  const stablePotential = useMemo(() => tierPotential(tier), [tier]);
  const stableCost = useMemo(() => tierCost(tier), [tier]);
  const stableHours = useMemo(() => tierHours(tier), [tier]);
  const stableDifficulty = useMemo(() => tierDifficultyLabel(tier), [tier]);
  const stableDifficultyReason = useMemo(() => tierDifficultyReason(tier), [tier]);

  const { activate } = useActivateTeam();
  const goToRoadmap = () => {
    void trackEvent("riepilogo_cta_attiva_agente_29");
    void activate("riepilogo_idea");
  };

  const { isAuthed } = useActivateTeam();
  const generateProjectFromIdea = () => {
    void trackEvent("riepilogo_cta_genera_progetto_loggato");
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
    navigate({ to: "/new-project" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {/* HERO */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Analisi generata dal tuo agente AI
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold mt-4 leading-[1.1]">
            Ecco l'analisi della tua <span className="gradient-text">idea</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-base sm:text-lg">
            Il tuo agente AI ha trasformato la tua idea in un primo piano operativo per capire cosa creare, da dove partire e quanto tempo può servire.
          </p>
        </div>

        {/* LOADING */}
        {isLoading && <LoadingState />}

        {/* ERROR */}
        {isError && !isLoading && (
          <div className="mt-10 glass-card rounded-2xl p-6 border border-rose-500/30 text-center">
            <AlertCircle className="size-6 text-rose-400 mx-auto" />
            <p className="mt-3 text-sm">
              Non siamo riusciti a generare l'analisi della tua idea. Riprova tra qualche secondo.
            </p>
            <Button variant="glass" className="mt-4" onClick={() => refetch()} disabled={isFetching}>
              Riprova
            </Button>
          </div>
        )}

        {/* CONTENT */}
        {summary && !isLoading && (
          <div className="mt-10 space-y-5">
            {/* 1 — Idea analizzata */}
            <Section icon={Lightbulb} title="Idea analizzata">
              <div className="font-display font-semibold text-xl sm:text-2xl leading-snug">
                {summary.title}
              </div>
              <p className="text-sm sm:text-base text-foreground/80 mt-3 leading-relaxed">
                {summary.short_description}
              </p>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Idea originale: "{params.idea}"
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-background/40 border border-border/60">
                <Layers className="size-3 text-primary" /> Tipo progetto:{" "}
                <strong className="text-foreground">{summary.project_type}</strong>
              </div>
            </Section>

            {/* 2 — Valore stimato della tua idea */}
            <ValueEstimateSection
              potentialAmount={stablePotential.amount}
              costAmount={stableCost.amount}
              onActivate={goToRoadmap}
              isAuthed={isAuthed}
              onGenerateProject={generateProjectFromIdea}
            />

            {/* 2 — Target */}
            <Section icon={Users} title="Target">
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{summary.target}</p>
            </Section>

            {/* 3 — Problema */}
            <Section icon={AlertCircle} title="Problema risolto">
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{summary.problem}</p>
            </Section>

            {/* 4 — Soluzione */}
            <Section icon={Sparkles} title="Soluzione proposta">
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{summary.solution}</p>
            </Section>

            {/* 5 — Prima versione */}
            <Section icon={ListChecks} title="Prima versione consigliata">
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{summary.first_version}</p>
              <p className="text-[11px] text-muted-foreground mt-3 italic">
                Stiamo parlando della <strong>prima versione funzionante</strong>, non dell'app completa.
              </p>
            </Section>

            {/* 6 — Funzioni essenziali */}
            <Section icon={Wand2} title="Funzioni essenziali">
              <ul className="grid sm:grid-cols-2 gap-2">
                {summary.essential_features.map((f, i) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm rounded-lg bg-background/40 border border-border/60 px-3 py-2.5"
                  >
                    <span className="inline-flex shrink-0 items-center justify-center size-5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* 7 — Schermate */}
            <Section icon={Monitor} title="Schermate da creare">
              <ul className="grid sm:grid-cols-2 gap-2">
                {summary.screens.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-sm rounded-lg bg-background/40 border border-border/60 px-3 py-2.5"
                  >
                    <Monitor className="size-3.5 mt-1 shrink-0 text-primary" /> {s}
                  </li>
                ))}
              </ul>
            </Section>

            {/* 8 — Integrazioni (se presenti) */}
            {summary.integrations && summary.integrations.length > 0 && (
              <Section icon={Plug} title="Integrazioni richieste">
                <div className="flex flex-wrap gap-2">
                  {summary.integrations.map((i) => (
                    <span
                      key={i}
                      className="text-sm px-3 py-1.5 rounded-full bg-background/40 border border-border/60"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* 9 + 10 — Difficoltà + Tempo */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Section icon={Activity} title="Complessità progetto">
                <DifficultyBadge level={stableDifficulty} />
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {stableDifficultyReason}
                </p>
              </Section>
              <Section icon={Clock} title="Tempo stimato">
                <div className="font-display font-semibold text-2xl gradient-text">
                  {stableHours}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tempo indicativo per la <strong>prima versione funzionante</strong>, non per l'app completa.
                </p>
              </Section>
            </div>

            {/* 11 — Cosa farà il tuo agente AI */}
            <Section icon={Bot} title="Cosa farà il tuo agente AI">
              <p className="text-sm text-foreground/90 leading-relaxed">
                Il tuo agente AI personale ti accompagna passo dopo passo per trasformare questa analisi
                in un'app reale:
              </p>
              <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                {[
                  "Chiarisce e mette a fuoco l'idea",
                  "Elimina le funzioni inutili",
                  "Costruisce la roadmap operativa",
                  "Scrive i prompt da copiare",
                  "Disegna le schermate da creare",
                  "Migliora il progetto passo dopo passo",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-2 text-sm rounded-lg bg-background/40 border border-border/60 px-3 py-2.5"
                  >
                    <Bot className="size-3.5 mt-1 shrink-0 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Strumenti consigliati (dall'estimate locale) */}
            <Section icon={Wrench} title="Strumenti consigliati">
              <div className="flex flex-wrap gap-2">
                {result.tools.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/60 text-sm"
                  >
                    <ToolIcon name={t} size={16} />
                    <span>{t}</span>
                    <span className="text-[10px] uppercase tracking-wider text-primary/90 border border-primary/30 bg-primary/10 rounded-full px-1.5 py-0.5">
                      {getReuseBadge(t)}
                    </span>
                  </span>
                ))}
              </div>
            </Section>

            {/* Cassetta degli attrezzi riusabile */}
            <ReusableToolkitBox showExample />

            {/* 12 — CTA finale */}
            <div
              className="relative rounded-2xl p-6 sm:p-10 overflow-hidden border border-primary/30"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
              }}
            >
              <div
                className="absolute -top-20 -right-16 size-56 rounded-full bg-primary/20 blur-3xl pointer-events-none"
                aria-hidden
              />
              <h2 className="font-display font-semibold text-2xl sm:text-3xl">
                Vuoi vedere chi lavorerà sulla tua idea?
              </h2>
              <p className="text-sm sm:text-base text-foreground/85 mt-3 max-w-2xl">
                Abbiamo preparato il Team AI che può aiutarti a trasformare questa idea in una prima app: ogni agente ha un ruolo preciso e lavora insieme agli altri.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => {
                    void trackEvent("riepilogo_cta_vai_a_agents");
                    void navigate({ to: "/agents" });
                  }}
                >
                  <Users className="size-4" />
                  Scopri il Team AI che lavorerà sulla tua idea
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-foreground/70 mt-4">Prima conosci la squadra. Poi decidi se attivarla.</p>
            </div>

            <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 px-2">
              <Info className="size-3 mt-0.5 shrink-0" />
              Le stime sono indicative e servono a capire l'ordine di grandezza del progetto. I risultati
              reali dipendono da mercato, prezzo, offerta, traffico, capacità di vendita, qualità del
              prodotto ed esecuzione.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-10 space-y-5">
      <div className="glass-card rounded-2xl p-8 border border-border/60 text-center">
        <div className="inline-flex items-center gap-2 text-primary">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm font-medium">Il tuo agente AI sta analizzando l'idea…</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Stiamo trasformando la tua idea in target, problema, soluzione, funzioni e schermate.
        </p>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="glass-card rounded-2xl p-6 border border-border/60 animate-pulse">
          <div className="h-3 w-32 rounded bg-muted/40" />
          <div className="mt-4 h-4 w-3/4 rounded bg-muted/30" />
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
    <section className="glass-card rounded-2xl p-5 sm:p-7 border border-border/60">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-4">
        <Icon className="size-3.5 text-primary" /> {title}
      </div>
      {children}
    </section>
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
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${color}`}
    >
      <Activity className="size-3.5" /> {level}
    </span>
  );
}

function estimateExternalCost(idea: string, projectType: string, difficulty: string): {
  amount: string;
  tier: "semplice" | "media" | "avanzata" | "marketplace";
} {
  const t = `${idea} ${projectType}`.toLowerCase();
  const marketplaceKw = [
    "marketplace", "piattaforma", "annunci", "annuncio", "candidatur",
    "due tipologie", "due tipi di utent", "venditori e compratori",
    "host e ospiti", "professionist", "freelance", "recensioni",
    "chat tra utent", "admin", "matching",
  ];
  const advancedKw = [
    "pagament", "stripe", "abbonament", "notifich", "whatsapp",
    "telegram", "calendario", "prenotazion", "api ester",
    "ruoli utent", "ai integrat", "intelligenza artificiale",
    "automazion", "openai", "machine learning",
  ];
  if (marketplaceKw.some((k) => t.includes(k))) {
    return { amount: "Fino a 30.000€", tier: "marketplace" };
  }
  if (advancedKw.some((k) => t.includes(k))) {
    return { amount: "Fino a 15.000€", tier: "avanzata" };
  }
  if (difficulty === "Facile") return { amount: "Fino a 3.000€", tier: "semplice" };
  if (difficulty === "Medio") return { amount: "Fino a 8.000€", tier: "media" };
  return { amount: "Fino a 15.000€", tier: "avanzata" };
}

function estimatePotentialRevenue(idea: string, target: string, projectType: string): {
  amount: string;
  tier: "utility" | "professionisti" | "b2b" | "marketplace";
} {
  const t = `${idea} ${target} ${projectType}`.toLowerCase();
  const marketplaceKw = [
    "marketplace", "piattaforma", "annunci", "candidatur",
    "venditori e compratori", "host e ospiti", "due tipologie",
    "due tipi di utent", "chat tra utent", "recensioni", "admin", "matching",
  ];
  const b2bKw = [
    "gestional", "automazion", "b2b", "azienda", "aziende",
    "crm", "erp", "team", "dipendent", "dashboard", "saas",
  ];
  const proKw = [
    "professionist", "freelance", "consulent", "studio",
    "piccola attivit", "piccole attivit", "negozio", "ristorante",
    "palestra", "coach", "agente immobiliare",
  ];
  if (marketplaceKw.some((k) => t.includes(k))) {
    return { amount: "Fino a 10.000€/mese", tier: "marketplace" };
  }
  if (b2bKw.some((k) => t.includes(k))) {
    return { amount: "Fino a 8.000€/mese", tier: "b2b" };
  }
  if (proKw.some((k) => t.includes(k))) {
    return { amount: "Fino a 3.000€/mese", tier: "professionisti" };
  }
  return { amount: "Fino a 1.000€/mese", tier: "utility" };
}

function ValueEstimateSection({
  potentialAmount,
  costAmount,
  onActivate,
}: {
  potentialAmount: string;
  costAmount: string;
  onActivate: () => void;
}) {
  const potential = { amount: potentialAmount };
  const cost = { amount: costAmount };

  return (
    <section className="space-y-5">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Euro className="size-3.5 text-primary" /> Valore stimato della tua idea
        </div>
        <h2 className="font-display font-semibold text-2xl sm:text-3xl mt-2">
          Quanto può <span className="gradient-text">valere</span> e quanto sarebbe <span className="gradient-text">costata</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Il tuo agente AI ha stimato il possibile potenziale economico dell'idea e il costo che avresti potuto sostenere per farla realizzare da zero.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* CARD 1 — Potenziale massimo */}
        <div
          className="relative rounded-2xl p-6 sm:p-7 overflow-hidden border border-primary/40"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--primary) 25%, transparent), 0 10px 40px -10px color-mix(in oklab, var(--primary) 35%, transparent)",
          }}
        >
          <div className="absolute -top-16 -right-12 size-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" aria-hidden />
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
            <TrendingUp className="size-3.5 text-primary" /> Potenziale massimo stimato
          </div>
          <div className="font-display font-semibold text-3xl sm:text-4xl gradient-text leading-tight">
            {potential.amount}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Stima indicativa basata su una prima versione funzionante, target corretto e primi clienti paganti.
          </p>
        </div>

        {/* CARD 2 — Costo senza AccentiAI */}
        <div
          className="relative rounded-2xl p-6 sm:p-7 overflow-hidden border border-primary/50"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 10%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--primary) 30%, transparent), 0 10px 40px -10px color-mix(in oklab, var(--primary) 40%, transparent)",
          }}
        >
          <div className="absolute -top-16 -left-12 size-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" aria-hidden />
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
            <Euro className="size-3.5 text-primary" /> Costo stimato senza AccentiAI
          </div>
          <div className="font-display font-semibold text-3xl sm:text-4xl gradient-text leading-tight">
            {cost.amount}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-primary/90 mt-2">Solo realizzazione</div>
          <p className="text-xs text-muted-foreground mt-3">
            Stima indicativa del costo che avresti potuto sostenere per far creare questa prima versione da freelance, agenzia o sviluppatore esterno.
          </p>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-primary/50"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, transparent), color-mix(in oklab, var(--accent) 16%, transparent))",
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--primary) 35%, transparent), 0 20px 60px -20px color-mix(in oklab, var(--primary) 50%, transparent)",
        }}
      >
        <div className="absolute -top-20 -right-16 size-56 rounded-full bg-primary/25 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute -bottom-20 -left-16 size-56 rounded-full bg-accent/20 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/40 border border-primary/40 text-[11px] uppercase tracking-wider text-primary/90 mb-4">
            <Euro className="size-3" /> Confronto reale
          </div>

          <h3 className="font-display font-semibold text-2xl sm:text-3xl leading-tight">
            Far realizzare questa app da professionisti ti sarebbe potuto costare fino a{" "}
            <span className="gradient-text">{cost.amount}</span>.
          </h3>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Oggi, con <span className="gradient-text font-semibold">29€</span>, puoi attivare il tuo{" "}
            <span className="text-foreground font-semibold">Team AI</span> e iniziare a trasformare la tua idea nella{" "}
            <span className="text-foreground font-semibold">prima versione della tua app</span>.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4 bg-background/40 border border-border/60">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Solo realizzazione da professionisti</div>
              <div className="font-display font-semibold text-2xl mt-1 text-muted-foreground line-through decoration-primary/50">
                Fino a {cost.amount}
              </div>
            </div>
            <div className="rounded-xl p-4 bg-background/40 border border-primary/50">
              <div className="text-[11px] uppercase tracking-wider text-primary/90">Parti da 29€ con il Team AI</div>
              <div className="font-display font-semibold text-2xl gradient-text mt-1">29€ una tantum</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <Button variant="hero" size="lg" onClick={onActivate}>
              Attiva il mio Team AI - 29€ <ArrowRight className="size-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Accesso immediato. Non ottieni l'app completa finita: attivi il tuo Team AI per partire dall'idea e costruire la prima versione.
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4 italic">
            Stime indicative. Non includono marketing, server, manutenzione o evoluzioni future.
          </p>
        </div>
      </div>
    </section>
  );
}

function CostWithoutAccentiAI({
  idea,
  projectType,
  difficulty,
  onActivate,
}: {
  idea: string;
  projectType: string;
  difficulty: string;
  onActivate: () => void;
}) {
  const { amount, tier } = estimateExternalCost(idea, projectType, difficulty);
  const tierLabel =
    tier === "semplice"
      ? "App semplice"
      : tier === "media"
        ? "App media"
        : tier === "avanzata"
          ? "App avanzata"
          : "Marketplace / piattaforma complessa";

  return (
    <section
      className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-primary/50"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 10%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
        boxShadow:
          "0 0 0 1px color-mix(in oklab, var(--primary) 30%, transparent), 0 10px 40px -10px color-mix(in oklab, var(--primary) 40%, transparent)",
      }}
    >
      <div
        className="absolute -top-16 -left-12 size-40 rounded-full bg-primary/20 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
        <Euro className="size-3.5 text-primary" /> Costo stimato senza AccentiAI
      </div>

      <div className="font-display font-semibold text-4xl sm:text-5xl gradient-text leading-tight">
        {amount}
      </div>
      <p className="text-xs text-muted-foreground mt-3 max-w-xl">
        Stima indicativa per creare una prima versione tramite freelance, agenzia o sviluppatore esterno.
        Riferimento: <strong className="text-foreground/80">{tierLabel}</strong>.
      </p>

      {/* Confronto */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Senza AccentiAI</div>
          <div className="font-display font-semibold text-2xl mt-1">{amount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Analisi, progettazione, sviluppo e test esterni.
          </div>
        </div>
        <div className="rounded-xl border border-primary/50 ring-1 ring-primary/20 p-4 bg-background/40">
          <div className="text-[10px] uppercase tracking-wider text-primary">Con AccentiAI</div>
          <div className="font-display font-semibold text-2xl mt-1 gradient-text">Da 29€</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Tu porti l'idea. Il team AI prepara struttura, funzioni, schermate, prompt e passaggi operativi.
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 italic">
        Il valore può variare in base a funzioni, integrazioni e complessità. AccentiAI non sostituisce
        completamente uno sviluppatore: ti permette di partire, chiarire l'idea e costruire una prima
        versione riducendo drasticamente i costi iniziali.
      </p>

      <div className="mt-6 rounded-xl border border-primary/40 p-4 sm:p-5 bg-background/30">
        <p className="font-display font-semibold text-base sm:text-lg">
          Prima di pagare uno sviluppatore, fai lavorare il tuo <span className="gradient-text">Team AI</span> sulla tua idea.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Riduci il costo di partenza e valida la tua idea prima di investire nello sviluppo completo.
        </p>
        <div className="mt-4">
          <Button variant="hero" size="lg" onClick={onActivate}>
            Attiva il mio Team AI - 29€ <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

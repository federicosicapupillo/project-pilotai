import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ToolIcon";
import { ReusableToolkitBox, getReuseBadge } from "@/components/ReusableToolkitBox";
import {
  ArrowRight, Sparkles, Clock, Activity, Layers, Users, AlertCircle,
  Lightbulb, Wrench, Bot, ListChecks, Info, Loader2,
  Monitor, Plug, Wand2, TrendingUp,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import {
  classify, loadIdeaParams,
  type Estimate, type IdeaParams,
} from "@/lib/idea-estimate";
import { generateIdeaSummary } from "@/lib/idea-summary.functions";

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

  const { data: summary, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["idea-summary", params.idea, params.target, result.projectType],
    queryFn: () =>
      generate({
        data: {
          idea: params.idea,
          target: params.target,
          projectType: result.projectType,
        },
      }),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const goToRoadmap = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("post_auth_redirect", "/checkout-agente");
    }
    void trackEvent("riepilogo_cta_attiva_agente_29");
    navigate({ to: "/checkout-agente" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
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
                <DifficultyBadge level={summary.difficulty} />
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {summary.difficulty_reason}
                </p>
              </Section>
              <Section icon={Clock} title="Tempo stimato">
                <div className="font-display font-semibold text-2xl gradient-text">
                  {summary.estimated_hours}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tempo indicativo per la <strong>prima versione funzionante</strong>, non per l'app completa.
                </p>
              </Section>
            </div>

            {/* Potenziale massimo stimato */}
            {summary.max_revenue && (
              <section
                className="relative rounded-2xl p-6 sm:p-8 overflow-hidden border border-primary/40"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
                  boxShadow:
                    "0 0 0 1px color-mix(in oklab, var(--primary) 25%, transparent), 0 10px 40px -10px color-mix(in oklab, var(--primary) 35%, transparent)",
                }}
              >
                <div
                  className="absolute -top-16 -right-12 size-40 rounded-full bg-primary/20 blur-3xl pointer-events-none"
                  aria-hidden
                />
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  <TrendingUp className="size-3.5 text-primary" /> Potenziale massimo stimato
                </div>
                <div className="font-display font-semibold text-3xl sm:text-4xl gradient-text leading-tight">
                  {summary.max_revenue}
                </div>
                <p className="text-xs text-muted-foreground mt-3 max-w-xl">
                  Stima indicativa basata su una prima versione funzionante, target corretto e primi clienti paganti.
                </p>
              </section>
            )}

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
                Vuoi iniziare a costruire questa app?
              </h2>
              <p className="text-sm sm:text-base text-foreground/85 mt-3 max-w-2xl">
                Attiva il tuo agente AI personale e trasforma questa analisi nel primo piano operativo per creare la tua prima app.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button variant="hero" size="xl" onClick={goToRoadmap}>
                  Attiva il mio agente AI - 29€ <ArrowRight className="size-4" />
                </Button>
                <Link to="/method">
                  <Button variant="glass" size="xl">
                    Voglio prima vedere il metodo
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-foreground/70 mt-4">Pagamento sicuro. Accesso immediato dopo l'acquisto.</p>
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

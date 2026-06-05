import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAgentAccess } from "@/lib/payments.functions";
import { loadIdeaParams } from "@/lib/idea-estimate";
import { trackEvent } from "@/lib/tracking";

export const Route = createFileRoute("/prezzi")({
  head: () => ({
    meta: [
      { title: "Prezzi — Attiva il tuo agente AI personale" },
      { name: "description", content: "Attiva il tuo agente AI personale a 29€ e trasforma la tua idea nella prima versione funzionante della tua app." },
      { property: "og:title", content: "Prezzi — Attiva il tuo agente AI personale" },
      { property: "og:description", content: "29€ per attivare il tuo agente AI personale: analisi dell'idea, piano operativo, prompt pronti e percorso guidato." },
    ],
  }),
  component: PrezziPage,
});

const TEAM: { role: string; line: string }[] = [
  { role: "Stratega AI", line: "Analizza la tua idea e ne chiarisce il potenziale" },
  { role: "Project manager AI", line: "Costruisce il tuo piano operativo personalizzato" },
  { role: "Stimatore AI", line: "Sai subito in quante ore creare la prima versione" },
  { role: "Architetto AI", line: "Ti aiuta a scegliere solo le funzioni che servono davvero" },
  { role: "Designer AI", line: "Hai già le schermate giuste da costruire" },
  { role: "Copy / Prompt AI", line: "Ricevi prompt operativi già pronti da usare" },
  { role: "Agente AI personale", line: "Attivi il tuo agente AI dedicato al tuo progetto" },
  { role: "Academy operativa", line: "Segui un percorso pratico, senza video inutili" },
  { role: "Coach di costruzione", line: "La squadra ti accompagna step by step" },
  { role: "Tracker di avanzamento", line: "Controlli il tuo avanzamento in ogni fase" },
];

const NOT_FOR: string[] = [
  "Non promettiamo un'app completa in poche ore",
  "Non serve saper programmare",
  "Non devi partire da un progetto perfetto",
  "L'obiettivo è creare una prima versione semplice, chiara e funzionante",
];

const ALONE: string[] = [
  "Non sai da dove partire",
  "Rischi di creare troppe funzioni",
  "Perdi tempo tra tool e prompt",
  "Non hai una roadmap chiara",
];

const WITH_AGENT: string[] = [
  "Parti da un'analisi chiara",
  "Costruisci solo ciò che serve",
  "Hai prompt e step guidati",
  "Segui un percorso ordinato",
];

function PrezziPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAccess = useServerFn(getAgentAccess);
  const { data: access } = useQuery({
    queryKey: ["agent-access"],
    queryFn: () => fetchAccess(),
    enabled: !!user,
    staleTime: 15_000,
  });
  const hasAccess = !!access?.hasAccess;

  const handleActivate = async () => {
    await trackEvent("pricing_activate_click", { price: "29" });
    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("post_auth_redirect", "/prezzi");
      }
      navigate({ to: "/auth" });
      return;
    }
    const saved = loadIdeaParams();
    if (saved && saved.idea.trim().length >= 8) {
      navigate({ to: "/riepilogo-idea" });
    } else {
      navigate({ to: "/analizza-idea" });
    }
  };

  const goToAgent = () => navigate({ to: "/agente-ai" });

  const PrimaryCta = () =>
    hasAccess ? (
      <Button variant="hero" size="lg" className="w-full" onClick={goToAgent}>
        Vai al mio agente AI <ArrowRight className="size-4" />
      </Button>
    ) : (
      <Button variant="hero" size="lg" className="w-full" onClick={handleActivate}>
        <Lock className="size-4" /> Attiva agente AI - 29€
      </Button>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-6xl mx-auto px-6 py-16 w-full">
        {/* HERO */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Piano di accesso
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-4">
            Attiva il tuo <span className="gradient-text">agente AI personale</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Parti dalla tua idea e fatti guidare passo dopo passo nella creazione della prima versione della tua app.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-3 max-w-2xl mx-auto">
            Niente video lunghi. Niente teoria inutile. Il tuo agente AI ti aiuta a capire cosa creare, in che ordine farlo e quali prompt usare.
          </p>
        </section>

        {/* PRICE CARD */}
        <section className="mt-12 flex justify-center">
          <div className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-xl relative border-primary/60 glow-soft ring-1 ring-primary/30">
            {hasAccess && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold gradient-bg text-primary-foreground glow-soft inline-flex items-center gap-1.5">
                <Check className="size-3" /> Agente AI attivo
              </div>
            )}
            <h2 className="font-display font-semibold text-2xl text-center">Agente AI personale</h2>
            <div className="mt-4 flex items-baseline justify-center gap-2">
              <div className="font-display font-semibold text-6xl gradient-text">29€</div>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-1">Accesso iniziale</div>
            <p className="text-center text-muted-foreground mt-4 max-w-md mx-auto">
              Il primo passo per trasformare la tua idea in una prima app funzionante con il supporto di un agente AI operativo.
            </p>

            <div className="mt-7">
              <PrimaryCta />
              <p className="text-xs text-muted-foreground text-center mt-3 inline-flex items-center justify-center gap-1.5 w-full">
                <ShieldCheck className="size-3.5" /> Pagamento sicuro. Accesso immediato dopo l'acquisto.
              </p>
            </div>
          </div>
        </section>

        {/* SQUADRA AI */}
        <section className="mt-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
              <Sparkles className="size-3 text-primary" /> La tua squadra operativa
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold mt-4">
              Con l'accesso attivi la tua <span className="gradient-text">squadra operativa AI</span>
            </h2>
            <p className="text-muted-foreground mt-4">
              Non stai acquistando solo un accesso. Stai attivando il tuo team di agenti AI, configurati per aiutarti a trasformare la tua idea in una prima app, anche se parti da zero.
            </p>
            <p className="text-sm gradient-text font-medium mt-3">
              I tuoi agenti AI sono pronti a partire
            </p>
          </div>

          <ul className="mt-10 grid sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {TEAM.map((t) => (
              <li
                key={t.role}
                className="glass-card rounded-xl px-4 py-4 flex items-start gap-3 text-sm border border-border/60 hover:border-primary/40 transition-colors"
              >
                <div className="size-8 rounded-lg gradient-bg grid place-items-center shrink-0 glow-soft">
                  <Check className="size-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t.role}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{t.line}</div>
                </div>
              </li>
            ))}
          </ul>

          {/* BLOCCO EMOTIVO */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-primary/40 ring-1 ring-primary/20 glow-soft text-center">
              <h3 className="font-display font-semibold text-xl sm:text-2xl">
                Tu porti l'idea. Il <span className="gradient-text">team AI</span> ti aiuta a costruirla.
              </h3>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Non serve essere sviluppatore, designer o esperto di automazioni. Con l'accesso attivi una squadra operativa di agenti AI già pronti a lavorare sulla tua idea, aiutarti a prendere decisioni e accompagnarti nella creazione della prima versione della tua app.
              </p>
            </div>
          </div>

          {/* CTA INTERMEDIA */}
          <div className="mt-8 max-w-xl mx-auto text-center">
            <h3 className="font-display font-semibold text-xl">
              La tua squadra AI è pronta. Vuoi attivarla?
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              Parti dalla tua idea e metti al lavoro il team che ti aiuterà a trasformarla nella prima versione della tua app.
            </p>
            <div className="mt-5">
              {hasAccess ? (
                <Button variant="hero" size="lg" className="w-full" onClick={goToAgent}>
                  Vai al mio team AI <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button variant="hero" size="lg" className="w-full" onClick={handleActivate}>
                  <Lock className="size-4" /> Attiva il mio team AI - 29€
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-3 inline-flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Accesso immediato dopo il pagamento.
              </p>
            </div>
          </div>
        </section>

        {/* COSA DEVI SAPERE */}
        <section className="mt-20 max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/60">
            <h2 className="text-xl sm:text-2xl font-display font-semibold">
              Cosa devi sapere prima di iniziare
            </h2>
            <p className="text-muted-foreground mt-3">
              Non stai acquistando un'app completa già pronta. Stai attivando un agente AI e un metodo operativo che ti aiutano a costruire la prima versione della tua app partendo dalla tua idea.
            </p>
            <p className="text-muted-foreground mt-3">
              L'obiettivo non è lasciarti da solo davanti a un corso. L'obiettivo è darti il team giusto per partire in modo semplice, guidato e concreto.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {NOT_FOR.map((f) => (
                <li key={f} className="flex items-start gap-2 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PERCHE 29 */}
        <section className="mt-20 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold">
            Perché partire da <span className="gradient-text">29€</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            Il prezzo è pensato per farti iniziare senza grandi investimenti. Prima capisci se la tua idea ha senso, poi costruisci la prima versione con l'aiuto dell'agente AI.
          </p>
        </section>

        {/* CONFRONTO */}
        <section className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-center">
            Da solo o con il tuo <span className="gradient-text">agente AI</span>?
          </h2>
          <div className="grid md:grid-cols-2 gap-5 mt-8 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-6 border border-border/60">
              <h3 className="font-display font-semibold text-lg text-muted-foreground">Da solo</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {ALONE.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 mt-2 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-6 border-primary/60 ring-1 ring-primary/30 glow-soft">
              <h3 className="font-display font-semibold text-lg gradient-text">Con agente AI</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {WITH_AGENT.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="mt-20">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto border-primary/40 ring-1 ring-primary/20">
            <h2 className="text-2xl sm:text-3xl font-display font-semibold">
              Vuoi iniziare a costruire la tua app?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Attiva il tuo agente AI personale e trasforma la tua idea in un primo piano operativo.
            </p>
            <div className="mt-6 max-w-sm mx-auto">
              <PrimaryCta />
              <p className="text-xs text-muted-foreground mt-3">
                {hasAccess ? "Il tuo agente AI è già attivo." : "Accesso immediato dopo il pagamento."}
              </p>
            </div>
            <div className="text-center mt-6">
              <Link to="/method" className="text-sm text-primary hover:underline">
                Prima voglio vedere il metodo →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

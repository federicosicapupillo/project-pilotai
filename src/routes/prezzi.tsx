import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Check, ArrowRight, Sparkles, Lock, ShieldCheck,
  Compass, ClipboardList, LayoutGrid, GitBranch, Wand2,
  Hammer, ShieldAlert, Rocket, LineChart, GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { useActivateTeam } from "@/hooks/use-activate-team";

export const Route = createFileRoute("/prezzi")({
  head: () => ({
    meta: [
      { title: "Prezzi — Attiva il tuo Team AI operativo" },
      { name: "description", content: "Pacchetto Team AI Operativo a 29€. Tu dai le direttive, gli agenti AI preparano struttura, schermate, funzioni e prompt per la prima versione della tua app." },
      { property: "og:title", content: "Prezzi — Attiva il tuo Team AI operativo" },
      { property: "og:description", content: "29€ per attivare il pacchetto Team AI: 8 agenti, percorso personale e metodo operativo guidato al lavoro sulla tua idea." },
    ],
  }),
  component: PrezziPage,
});

const TEAM: { role: string; line: string; Icon: LucideIcon }[] = [
  { role: "Stratega AI", line: "Analizza la tua idea e decide da dove conviene partire.", Icon: Compass },
  { role: "Product Agent", line: "Trasforma la tua idea in un piano operativo chiaro.", Icon: ClipboardList },
  { role: "UX Agent", line: "Ti prepara le schermate principali della tua app.", Icon: LayoutGrid },
  { role: "Logic Agent", line: "Organizza funzioni, flussi e passaggi fondamentali.", Icon: GitBranch },
  { role: "Prompt Agent", line: "Crea istruzioni pronte da usare per costruire meglio e più velocemente.", Icon: Wand2 },
  { role: "Build Agent", line: "Ti aiuta a generare le prime parti operative del progetto.", Icon: Hammer },
  { role: "Test Agent", line: "Controlla errori, punti deboli e passaggi da migliorare.", Icon: ShieldAlert },
  { role: "Launch Agent", line: "Ti aiuta a preparare la tua app per presentarla, venderla o lanciarla.", Icon: Rocket },
  { role: "Percorso personale", line: "Tieni sotto controllo l'avanzamento del tuo progetto.", Icon: LineChart },
  { role: "Metodo operativo", line: "Prompt, roadmap e istruzioni operative guidate dal Team AI.", Icon: GraduationCap },
];

const NOT_FOR: string[] = [
  "Non serve saper programmare",
  "Non serve conoscere tutti gli strumenti",
  "Non devi partire da un progetto perfetto",
  "Tu dai le direttive",
  "Il team AI organizza e prepara il lavoro",
  "Tu controlli, approvi e fai avanzare il progetto",
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
  "Hai prompt e step già pronti",
  "Tu controlli e approvi, loro lavorano",
];

function PrezziPage() {
  const navigate = useNavigate();
  const { activate, hasAccess } = useActivateTeam();
  const handleActivate = () => void activate("prezzi");

  const goToDashboard = () => navigate({ to: "/dashboard" });

  const PrimaryCta = ({ label = "Attiva il mio Team AI - 29€" }: { label?: string }) =>
    hasAccess ? (
      <Button variant="hero" size="lg" className="w-full" onClick={goToDashboard}>
        Vai alla dashboard <ArrowRight className="size-4" />
      </Button>
    ) : (
      <Button variant="hero" size="lg" className="w-full" onClick={handleActivate}>
        <Lock className="size-4" /> {label}
      </Button>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-6xl mx-auto px-6 py-16 w-full">
        {/* HERO */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Pacchetto Team AI Operativo
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-4">
            Attiva il tuo <span className="gradient-text">Team AI operativo</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
            Tu porti l'idea. Il tuo team di agenti AI la organizza, la struttura e prepara il lavoro per trasformarla nella prima versione della tua app.
          </p>
          <p className="text-base sm:text-lg gradient-text font-semibold mt-6 max-w-2xl mx-auto">
            Attivi una squadra AI pronta a lavorare sul tuo progetto.
          </p>
        </section>

        {/* PACCHETTO TEAM AI — card principale */}
        <section className="mt-14 flex justify-center">
          <div className="relative w-full max-w-3xl">
            {/* glow alone */}
            <div aria-hidden className="absolute -inset-px rounded-[2rem] gradient-bg opacity-30 blur-2xl" />
            <div className="relative glass-card rounded-[2rem] p-8 sm:p-12 border-primary/70 ring-2 ring-primary/40 glow-soft">
              {hasAccess && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold gradient-bg text-primary-foreground glow-soft inline-flex items-center gap-1.5">
                  <Check className="size-3" /> Team AI attivo
                </div>
              )}

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gradient-bg text-primary-foreground text-[11px] font-semibold uppercase tracking-wider glow-soft">
                  <Sparkles className="size-3" /> Pacchetto operativo
                </div>
                <h2 className="font-display font-semibold text-3xl sm:text-4xl mt-4">
                  Pacchetto <span className="gradient-text">Team AI Operativo</span>
                </h2>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                  Attiva la squadra di agenti AI che lavora sulla tua idea e ti aiuta a trasformarla nella prima versione della tua app.
                </p>

                <div className="mt-6 flex items-baseline justify-center gap-2">
                  <div className="font-display font-semibold text-7xl gradient-text leading-none">29€</div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Accesso iniziale · Pagamento sicuro · Attivazione immediata
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-7 max-w-2xl mx-auto text-center">
                Non devi sapere programmare, progettare schermate o capire tutti gli strumenti. Tu racconti cosa vuoi creare e dai le direttive. Il tuo team AI organizza il progetto, definisce le funzioni e lavorerà per te per la creazione della tua app.
              </p>

              {/* AGENT GRID */}
              <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                {TEAM.map(({ role, line, Icon }) => (
                  <li
                    key={role}
                    className="glass-card rounded-xl px-4 py-4 flex items-start gap-3 text-sm border border-border/60 hover:border-primary/50 transition-colors"
                  >
                    <div className="size-9 rounded-lg gradient-bg grid place-items-center shrink-0 glow-soft">
                      <Icon className="size-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{role}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{line}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* FRASE FORTE */}
              <div className="mt-8 rounded-2xl border border-primary/40 ring-1 ring-primary/20 p-5 text-center">
                <p className="font-display font-semibold text-lg sm:text-xl">
                  Non parti da zero. <span className="gradient-text">Parti con una squadra.</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tu dai l'idea. Il team AI prepara il lavoro.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-7 max-w-sm mx-auto">
                <PrimaryCta />
                <p className="text-xs text-muted-foreground text-center mt-3 inline-flex items-center justify-center gap-1.5 w-full">
                  <ShieldCheck className="size-3.5" /> Pagamento sicuro · Accesso immediato al tuo Team AI
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COSA SIGNIFICA DAVVERO */}
        <section className="mt-20 max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border-primary/40 ring-1 ring-primary/20 text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-semibold">
              Un sistema operativo pronto a <span className="gradient-text">lavorare sulla tua idea</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Stai attivando un sistema operativo di agenti AI che prende la tua idea e la trasforma in un progetto concreto. <span className="text-foreground font-medium">Pronto a partire?</span>
            </p>
          </div>
        </section>

        {/* CONFRONTO */}
        <section className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-center">
            Da solo o con il tuo <span className="gradient-text">team AI</span>?
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
              <h3 className="font-display font-semibold text-lg gradient-text">Con il team AI</h3>
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
              Il tuo <span className="gradient-text">Team AI</span> è pronto. Vuoi attivarlo?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Porta la tua idea. Dai le direttive. Lascia che gli agenti AI inizino a trasformarla in una prima app.
            </p>
            <div className="mt-6 max-w-sm mx-auto">
              <PrimaryCta />
              <p className="text-xs text-muted-foreground mt-3">
                {hasAccess ? "Il tuo Team AI è già attivo." : "Accesso immediato dopo il pagamento."}
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

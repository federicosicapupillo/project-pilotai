import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Lightbulb, Search, LayoutDashboard, MessageSquareCode,
  Code2, Database, ShieldCheck, Rocket,
} from "lucide-react";

export const Route = createFileRoute("/method")({
  head: () => ({
    meta: [
      { title: "Il metodo IDEA → AGENTI → APP" },
      { name: "description", content: "8 step per trasformare un'idea grezza in un progetto digitale costruibile." },
    ],
  }),
  component: MethodPage,
});

const STEPS = [
  { icon: Lightbulb, title: "Idea", desc: "Parti da una frase chiara: cosa vuoi creare, per chi e perché ha senso adesso. Niente PowerPoint, solo onestà." },
  { icon: Search, title: "Diagnosi", desc: "Verifica il problema reale, il target e quanto è urgente. Se non c'è dolore, non c'è prodotto." },
  { icon: LayoutDashboard, title: "Architettura", desc: "Definisci schermate, funzioni essenziali della prima versione dell'app e dati da salvare. Tutto il resto va nella lista 'non ora'." },
  { icon: MessageSquareCode, title: "Prompt", desc: "Trasforma la strategia in prompt operativi: uno per chiarire, uno per costruire, uno per correggere." },
  { icon: Code2, title: "Costruzione", desc: "Usa Lovable e gli strumenti no-code per creare la prima versione funzionante della tua app." },
  { icon: Database, title: "Database", desc: "Collega dati, utenti, login e informazioni essenziali con una struttura semplice e controllabile." },
  { icon: ShieldCheck, title: "Test", desc: "Controlla flussi, bug, errori e punti deboli prima di pensare al lancio." },
  { icon: Rocket, title: "Lancio", desc: "Prepara demo, presentazione, roadmap successiva e prime azioni per validare il progetto." },
];

function MethodPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 hero-bg opacity-80 pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 -right-40 size-[500px] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs uppercase tracking-[0.18em] text-primary font-semibold">
            <span className="size-1.5 rounded-full bg-primary glow-soft" /> Il metodo
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.02]">
            IDEA <ArrowGradient /> AGENTI <ArrowGradient /> APP
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Otto step concreti per passare da una frase su un foglio a una prima app testabile.
            Tu sei il regista: gli agenti AI sono la squadra.
          </p>

          {/* Steps */}
          <ol className="mt-14 space-y-4 relative">
            {/* Vertical luminous line */}
            <div
              className="hidden sm:block absolute left-[42px] top-4 bottom-4 w-px"
              style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.4), transparent)" }}
              aria-hidden
            />
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="group relative glass-card rounded-2xl p-5 sm:p-6 flex items-start gap-4 sm:gap-6 border border-border/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.45)]"
              >
                {/* Number */}
                <div className="relative shrink-0">
                  <div className="size-16 sm:size-20 rounded-xl gradient-bg grid place-items-center glow-soft font-display font-bold text-2xl sm:text-3xl text-primary-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                {/* Icon */}
                <div className="hidden sm:grid shrink-0 size-16 rounded-xl bg-secondary/60 border border-border/50 place-items-center group-hover:border-primary/40 transition-colors">
                  <s.icon className="size-7 text-primary" />
                </div>
                {/* Text */}
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <s.icon className="size-4 text-primary sm:hidden" />
                    <h2 className="font-display font-semibold text-xl sm:text-2xl">{s.title}</h2>
                  </div>
                  <p className="text-muted-foreground mt-2 leading-relaxed text-[15px]">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <div className="mt-16 glass-card rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 hero-bg opacity-60 pointer-events-none" />
            <div className="relative">
              <h3 className="font-display font-semibold text-2xl sm:text-3xl">
                Pronto a guidare la tua <span className="gradient-text">squadra di agenti AI?</span>
              </h3>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Non devi saper programmare. Devi solo imparare a guidare. Crea il tuo primo progetto in meno di 5 minuti.
              </p>
              <Link to="/dashboard" className="inline-block mt-6">
                <Button variant="hero" size="xl">Inizia a creare la tua app <ArrowRight className="size-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ArrowGradient() {
  return (
    <span
      className="inline-block align-middle mx-2 sm:mx-3"
      style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.6))" }}
      aria-hidden
    >
      <span className="gradient-text">→</span>
    </span>
  );
}
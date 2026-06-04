import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Costi e piani — Da Idea ad App" },
      { name: "description", content: "Scopri i piani per trasformare la tua idea in una prima versione dell'app con agenti AI, prompt operativi e roadmap personalizzata." },
      { property: "og:title", content: "Costi e piani — Da Idea ad App" },
      { property: "og:description", content: "Piani semplici per partire dalla tua idea fino alla prima app funzionante." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Start",
    price: "Gratis",
    desc: "Per esplorare il metodo e creare la tua prima scheda progetto.",
    features: [
      "1 progetto attivo",
      "Scheda progetto guidata",
      "Stima ore della prima versione",
      "Accesso base agli agenti AI",
    ],
    cta: "Inizia gratis",
    variant: "glass" as const,
  },
  {
    name: "Builder",
    price: "€29 / mese",
    desc: "Per chi vuole costruire davvero la prima versione della propria app.",
    features: [
      "Progetti illimitati",
      "Roadmap operativa personalizzata",
      "Tutti i 7 agenti AI con prompt pronti",
      "Libreria prompt completa",
      "Supporto via email",
    ],
    cta: "Inizia il tuo progetto",
    variant: "hero" as const,
    highlight: true,
  },
  {
    name: "Pro",
    price: "€79 / mese",
    desc: "Per founder e team che vogliono accelerare con sessioni dedicate.",
    features: [
      "Tutto del piano Builder",
      "Sessioni 1:1 mensili",
      "Revisione roadmap personalizzata",
      "Priorità supporto",
    ],
    cta: "Scegli Pro",
    variant: "glass" as const,
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-wider text-primary font-semibold text-center">Costi e piani</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-2 text-center">
          Scegli come trasformare la tua <span className="gradient-text">idea in app</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-center">
          Piani semplici e trasparenti. Tu resti il regista, gli agenti AI ti aiutano passo passo.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`glass-card rounded-2xl p-6 flex flex-col ${p.highlight ? "border-primary/40 glow-soft" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display font-semibold text-xl">{p.name}</h3>
                {p.highlight && (
                  <span className="text-[10px] uppercase tracking-wider text-primary">Consigliato</span>
                )}
              </div>
              <div className="mt-3 font-display font-semibold text-2xl gradient-text">{p.price}</div>
              <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="mt-6">
                <Button variant={p.variant} size="lg" className="w-full">
                  {p.cta} <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Puoi disdire in qualsiasi momento. Nessun costo nascosto.
        </p>
      </main>
    </div>
  );
}

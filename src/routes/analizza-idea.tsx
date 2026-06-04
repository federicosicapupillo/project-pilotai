import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { IdeaEstimator } from "@/components/IdeaEstimator";
import { Gauge, Wrench, Bot, Layers } from "lucide-react";

export const Route = createFileRoute("/analizza-idea")({
  head: () => ({
    meta: [
      { title: "Analizza la tua idea gratis — ore, costi, potenziale" },
      { name: "description", content: "Scrivi la tua idea e scopri ore, difficoltà, costi iniziali e mensili, strumenti consigliati, potenziale economico e punto di pareggio." },
      { property: "og:title", content: "Analizza la tua idea gratis" },
      { property: "og:description", content: "Stima ore, difficoltà, costi, strumenti e potenziale economico per la tua idea." },
    ],
  }),
  component: AnalizzaIdeaPage,
});
function AnalizzaIdeaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 w-full">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Gauge className="size-3 text-primary" /> Analisi gratuita
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-4 leading-[1.1]">
            Hai un'idea per un'<span className="gradient-text">app</span>?<br />
            Scopri ore, costi e potenziale economico.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Scrivi la tua idea. La nostra AI ti aiuta a stimare ore, difficoltà, costi, strumenti necessari e possibile modello di ricavo per creare la prima versione funzionante.
          </p>
        </div>

        <div className="mt-10">
          <IdeaEstimator embed />
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
          <Hint icon={Wrench} title="Stima realistica" text="Ore, costi iniziali e mensili per la prima versione funzionante." />
          <Hint icon={Bot} title="Potenziale economico" text="Indicazione di ricavi possibili e punto di pareggio." />
          <Hint icon={Layers} title="Tool consigliati" text="Lovable, Supabase, ChatGPT, Stripe e altri se servono." />
        </div>
      </main>
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
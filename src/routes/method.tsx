import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { METHOD_STEPS } from "@/lib/project-templates";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/method")({
  head: () => ({
    meta: [
      { title: "Il metodo IDEA → AGENTI → APP" },
      { name: "description", content: "8 step per trasformare un'idea grezza in un progetto digitale costruibile." },
    ],
  }),
  component: MethodPage,
});

function MethodPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-sm uppercase tracking-wider text-primary font-semibold">Il metodo</p>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-3">
          IDEA <span className="gradient-text">→</span> AGENTI <span className="gradient-text">→</span> APP
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
          Otto step concreti per passare da una frase su un foglio a una prima app testabile. Tu sei il
          regista: gli agenti AI sono la squadra.
        </p>

        <ol className="mt-12 space-y-4">
          {METHOD_STEPS.map((s, i) => (
            <li key={s.key} className="glass-card rounded-xl p-6 flex gap-5">
              <div className="size-12 rounded-lg gradient-bg grid place-items-center glow-soft shrink-0 font-display font-semibold text-primary-foreground">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h2 className="font-display font-semibold text-xl">{s.title}</h2>
                <p className="text-muted-foreground mt-1">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 glass-card rounded-2xl p-8 text-center">
          <h3 className="font-display font-semibold text-2xl">Pronto a partire?</h3>
          <p className="text-muted-foreground mt-2">Crea il tuo primo progetto in meno di 5 minuti.</p>
          <Link to="/auth" className="inline-block mt-5">
            <Button variant="hero" size="lg">Inizia ora <ArrowRight className="size-4" /></Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
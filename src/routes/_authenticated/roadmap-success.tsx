import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

export const Route = createFileRoute("/_authenticated/roadmap-success")({
  component: RoadmapSuccessPage,
});

function RoadmapSuccessPage() {
  const navigate = useNavigate();

  const onUpsell = async () => {
    await trackEvent("upsell_team_ai_click", { from: "roadmap-success" });
    if (typeof window !== "undefined") localStorage.setItem("pending_plan", "team_ai");
    navigate({ to: "/prezzi" });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-50 pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Roadmap pronta
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-display font-semibold">
            La tua roadmap è pronta. Vuoi essere <span className="gradient-text">guidato passo passo</span>?
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Ora sai cosa costruire. Con il Team AI attivo ti accompagniamo step dopo step,
            agente dopo agente, fino alla prima versione funzionante della tua app.
          </p>

          <div className="mt-8 glass-card rounded-2xl p-6 text-left max-w-xl mx-auto border border-accent/40">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-xl">Team AI Completo</h3>
              <div className="font-display font-semibold text-2xl gradient-text">29€</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "8 agenti AI dedicati alla tua idea",
                "Prompt operativi pronti all'uso",
                "Roadmap di costruzione passo passo",
                "Strumenti sbloccabili e Workbook completo",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="size-4 text-primary mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="hero" size="xl" onClick={onUpsell}>
              Attiva il mio Team AI <ArrowRight className="size-4" />
            </Button>
            <Link to="/dashboard">
              <Button variant="glass" size="xl">Continua solo con la Roadmap</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
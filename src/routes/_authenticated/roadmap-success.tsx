import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";

export const Route = createFileRoute("/_authenticated/roadmap-success")({
  component: RoadmapSuccessPage,
});

function RoadmapSuccessPage() {
  const navigate = useNavigate();

  const onUpsell = async () => {
    await trackEvent("upsell_academy_click", { from: "roadmap-success" });
    if (typeof window !== "undefined") localStorage.setItem("pending_plan", "academy");
    toast.message("Pagamento in configurazione", {
      description: "Il checkout dell'Academy sarà attivato a breve. Ti avviseremo via email.",
    });
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
            Ora sai cosa costruire. Con l'Academy completa ti accompagniamo lezione dopo lezione,
            agente dopo agente, fino alla prima versione funzionante della tua app.
          </p>

          <div className="mt-8 glass-card rounded-2xl p-6 text-left max-w-xl mx-auto border border-accent/40">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-xl">Academy Completa</h3>
              <div className="font-display font-semibold text-2xl gradient-text">97€</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "12 moduli Academy, 60 lezioni operative",
                "Libreria agenti AI e strumenti no-code",
                "Prompt avanzati copiabili ed esercizi pratici",
                "Workbook completo e checklist di avanzamento",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="size-4 text-primary mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="hero" size="xl" onClick={onUpsell}>
              Sblocca l'Academy completa <ArrowRight className="size-4" />
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
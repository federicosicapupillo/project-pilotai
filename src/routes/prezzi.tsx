import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/prezzi")({
  head: () => ({
    meta: [
      { title: "Prezzi — Da Idea ad App" },
      { name: "description", content: "Scegli il percorso giusto: analizza la tua idea gratis, sblocca la roadmap completa a 29€ o accedi all'Academy completa." },
      { property: "og:title", content: "Prezzi — Da Idea ad App" },
      { property: "og:description", content: "Dal piano gratis al supporto operativo: scegli come trasformare la tua idea in app." },
    ],
  }),
  component: PrezziPage,
});

type Plan = {
  id: "free" | "roadmap" | "academy" | "support";
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  desc: string;
  features: string[];
  excludes?: string[];
  cta: string;
  highlight?: boolean;
  mostChosen?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Start Gratis",
    price: "Gratis",
    desc: "Per scoprire il metodo e capire quanto può essere realizzabile la tua idea.",
    features: [
      "1 idea analizzata",
      "Stima ore della prima versione funzionante",
      "Prima scheda progetto guidata",
      "Accesso base agli agenti AI",
      "Anteprima della roadmap",
    ],
    excludes: [
      "roadmap completa passo passo",
      "percorso Academy completo",
      "tutte le lezioni operative",
      "supporto sugli strumenti AI/no-code",
      "costruzione guidata completa dell'app",
    ],
    cta: "Analizza la tua idea gratis",
  },
  {
    id: "roadmap",
    name: "Roadmap Completa",
    price: "29€",
    oldPrice: "49€",
    badge: "Offerta lancio",
    desc: "Per chi vuole trasformare l'idea in un piano operativo concreto.",
    features: [
      "Analisi completa dell'idea",
      "Stima ore dettagliata",
      "Roadmap personalizzata della prima versione funzionante",
      "Percentuale di avanzamento dell'app",
      "Agenti AI consigliati",
      "Strumenti consigliati",
      "Prompt iniziali pronti da copiare",
      "Workbook progetto base",
      "Prossima azione consigliata",
    ],
    cta: "Crea la roadmap completa",
    highlight: true,
  },
  {
    id: "academy",
    name: "Academy Completa",
    price: "97€",
    oldPrice: "197€",
    badge: "Più scelto",
    desc: "Per chi vuole essere guidato passo passo dalla propria idea alla prima versione funzionante dell'app.",
    features: [
      "Tutto del piano Roadmap Completa",
      "Accesso ai 12 moduli Academy",
      "60 lezioni operative",
      "Libreria agenti AI",
      "Libreria strumenti AI/no-code",
      "Prompt avanzati copiabili",
      "Esercizi pratici e checklist",
      "Avanzamento Academy e workbook completo",
      "Guida su Lovable, Supabase, Antigravity, GitHub, ChatGPT, Perplexity, Claude, Obsidian",
    ],
    cta: "Accedi all'Academy",
    mostChosen: true,
  },
  {
    id: "support",
    name: "Academy + Supporto",
    price: "297€",
    oldPrice: "497€",
    badge: "Percorso guidato",
    desc: "Per chi vuole costruire il progetto con più sicurezza e ricevere supporto operativo.",
    features: [
      "Tutto del piano Academy Completa",
      "Revisione della roadmap",
      "Controllo della prima versione del progetto",
      "Supporto sui prompt principali",
      "Indicazioni su Lovable e strumenti collegati",
      "Priorità sugli step da completare",
      "Suggerimenti per migliorare app, grafica e presentazione",
    ],
    cta: "Voglio essere seguito",
  },
];

function PrezziPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const onSelect = async (plan: Plan) => {
    await trackEvent(`pricing_click_${plan.id}`, { price: plan.price });

    if (plan.id === "free") {
      if (user) navigate({ to: "/new-project" });
      else {
        if (typeof window !== "undefined") localStorage.setItem("post_auth_redirect", "/new-project");
        navigate({ to: "/auth" });
      }
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("pending_plan", plan.id);
      if (!user) localStorage.setItem("post_auth_redirect", "/prezzi");
    }

    if (!user) {
      toast.info("Accedi per continuare con il tuo piano.");
      navigate({ to: "/auth" });
      return;
    }

    toast.message("Pagamento in configurazione", {
      description:
        "Stiamo per attivare i checkout sicuri. Lascia la tua email: ti avvisiamo appena il piano è acquistabile.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> Scegli il tuo percorso
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-4">
            Trasforma la tua <span className="gradient-text">idea</span> nella prima versione funzionante
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Tu resti il regista. Gli agenti AI ti aiutano passo passo. Scegli quanto vuoi essere accompagnato.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`glass-card rounded-2xl p-6 flex flex-col relative ${
                p.highlight ? "border-primary/60 glow-soft ring-1 ring-primary/30" : ""
              } ${p.mostChosen ? "border-accent/50" : ""}`}
            >
              {p.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                    p.highlight
                      ? "gradient-bg text-primary-foreground glow-soft"
                      : "bg-secondary text-foreground border border-border/60"
                  }`}
                >
                  {p.badge}
                </div>
              )}
              <h3 className="font-display font-semibold text-xl mt-2">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="font-display font-semibold text-3xl gradient-text">{p.price}</div>
                {p.oldPrice && (
                  <div className="text-sm text-muted-foreground line-through">{p.oldPrice}</div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2 min-h-[48px]">{p.desc}</p>

              <ul className="mt-5 space-y-2 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              {p.excludes && (
                <div className="mt-5 pt-4 border-t border-border/40">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Non include
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {p.excludes.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <X className="size-3.5 mt-0.5 shrink-0 opacity-70" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant={p.highlight || p.mostChosen ? "hero" : "glass"}
                size="lg"
                className="w-full mt-6"
                onClick={() => onSelect(p)}
              >
                {p.cta} <ArrowRight className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-10 max-w-2xl mx-auto">
          I pagamenti saranno gestiti tramite checkout sicuro. Nessun costo nascosto, puoi disdire in qualsiasi momento.
          Per ora l'acquisto è in configurazione: lascia la tua email registrandoti e ti avviseremo appena è attivo.
        </p>

        <div className="text-center mt-6">
          <Link to="/method" className="text-sm text-primary hover:underline">
            Prima voglio vedere il metodo →
          </Link>
        </div>
      </main>
    </div>
  );
}
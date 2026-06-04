import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeAgentCheckout } from "@/components/StripeEmbeddedCheckout";
import { loadIdeaParams } from "@/lib/idea-estimate";
import { ArrowLeft, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/checkout-agente")({
  head: () => ({ meta: [{ title: "Attiva il tuo agente AI" }] }),
  component: CheckoutAgentePage,
});

function CheckoutAgentePage() {
  const [idea, setIdea] = useState<string>("");
  const [returnUrl, setReturnUrl] = useState<string>("");

  useEffect(() => {
    const params = loadIdeaParams();
    setIdea(params?.idea ?? "");
    setReturnUrl(`${window.location.origin}/pagamento-successo?session_id={CHECKOUT_SESSION_ID}`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <PaymentTestModeBanner />
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <Link
          to="/riepilogo-idea"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Torna al riepilogo
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* Order summary */}
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-display font-semibold leading-tight">
                Attiva il tuo <span className="gradient-text">agente AI</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Accesso immediato all'agente AI che trasforma la tua idea nella prima versione della tua app.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border/60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">Agente AI personale</div>
                  <div className="text-xs text-muted-foreground mt-1">Accesso una tantum</div>
                </div>
                <div className="text-2xl font-display font-semibold">29€</div>
              </div>
              <hr className="my-4 border-border/60" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Totale</span>
                <span className="font-display font-semibold text-lg">29€</span>
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Zap className="size-4 text-primary mt-0.5 shrink-0" />
                Roadmap operativa personalizzata sulla tua idea
              </li>
              <li className="flex items-start gap-2">
                <Zap className="size-4 text-primary mt-0.5 shrink-0" />
                Prompt pronti da copiare per ogni step
              </li>
              <li className="flex items-start gap-2">
                <Zap className="size-4 text-primary mt-0.5 shrink-0" />
                Guida passo-passo alla prima versione funzionante
              </li>
            </ul>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5 mt-0.5 text-primary shrink-0" />
              Pagamento sicuro gestito da Stripe. Non salviamo i dati della tua carta.
            </div>

            <Link to="/pagamento-annullato">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Annulla pagamento
              </Button>
            </Link>
          </div>

          {/* Embedded checkout */}
          <div>
            {returnUrl ? (
              <StripeAgentCheckout idea={idea} returnUrl={returnUrl} />
            ) : (
              <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted-foreground">
                Caricamento pagamento…
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
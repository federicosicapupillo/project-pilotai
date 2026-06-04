import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pagamento-successo")({
  head: () => ({ meta: [{ title: "Pagamento completato" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="max-w-2xl mx-auto px-6 py-20 w-full text-center">
        <div
          className="mx-auto inline-flex items-center justify-center size-16 rounded-full border border-primary/40 mb-6"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 25%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
          }}
        >
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-tight">
          Pagamento <span className="gradient-text">completato</span>
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg">
          Il tuo agente AI è stato attivato. Ora puoi iniziare a trasformare la tua idea nella
          prima versione della tua app.
        </p>
        <div className="mt-8">
          <Link to="/agente-ai">
            <Button variant="hero" size="xl">
              Inizia con il mio agente AI <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Riceverai a breve la ricevuta via email.
        </p>
      </main>
    </div>
  );
}
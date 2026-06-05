import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pagamento-annullato")({
  head: () => ({ meta: [{ title: "Pagamento non completato" }] }),
  component: CancelPage,
});

function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-2xl mx-auto px-6 py-20 w-full text-center">
        <div className="mx-auto inline-flex items-center justify-center size-16 rounded-full border border-border/60 bg-background/40 mb-6">
          <XCircle className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          Pagamento non completato
        </h1>
        <p className="text-muted-foreground mt-4 text-base">
          Nessun importo è stato addebitato. Puoi tornare al riepilogo della tua idea e riprovare quando vuoi.
        </p>
        <div className="mt-8">
          <Link to="/riepilogo-idea">
            <Button variant="hero" size="lg">
              <ArrowLeft className="size-4" /> Torna al riepilogo
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
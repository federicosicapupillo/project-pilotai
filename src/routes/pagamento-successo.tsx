import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/pagamento-successo")({
  head: () => ({ meta: [{ title: "Pagamento completato" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    projectId: typeof search.projectId === "string" ? search.projectId : undefined,
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refresh the Team AI access cache so the navbar/dashboard flip immediately
    queryClient.invalidateQueries({ queryKey: ["agent-access"] });
    // Clean up the pending project pointer — the project is now linked server-side
    try { localStorage.removeItem("pending_project_id"); } catch { /* noop */ }
    const t = setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 1500);
    return () => clearTimeout(t);
  }, [navigate, queryClient]);

  return (
    <div className="min-h-screen flex flex-col">
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
          Stiamo attivando il tuo Team AI e ti riportiamo al tuo progetto…
        </p>
        <div className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" /> Reindirizzamento alla dashboard…
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Riceverai a breve la ricevuta via email.
        </p>
      </main>
    </div>
  );
}

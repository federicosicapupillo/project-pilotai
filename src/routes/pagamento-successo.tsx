import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, MessageSquare, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAgentAccess, verifyCheckoutSession } from "@/lib/payments.functions";

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
  const fetchAccess = useServerFn(getAgentAccess);
  const verifySession = useServerFn(verifyCheckoutSession);
  const { session_id: sessionId } = Route.useSearch();
  const [elapsed, setElapsed] = useState(0);

  const isProd = typeof window !== "undefined" && !/(^|\.)lovable\.app$/.test(window.location.hostname)
    ? true
    : typeof window !== "undefined" && window.location.hostname.startsWith("project-pilotai");

  const { data: verify, isLoading: verifyLoading } = useQuery({
    queryKey: ["verify-session", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      try { return await verifySession({ data: { sessionId: sessionId as string } }); }
      catch (e) { return { ok: false as const, error: e instanceof Error ? e.message : "Errore verifica" }; }
    },
    staleTime: 60_000,
    retry: 1,
  });

  const stripeConfirmed = verify?.ok && verify.payment_status === "paid";
  // In produzione, una sessione di test (livemode=false) NON è un pagamento reale.
  const livemodeMismatch =
    verify?.ok && isProd && verify.livemode === false;
  const stripeRejected =
    !!sessionId && verify && (
      (verify.ok && verify.payment_status !== "paid") ||
      (!verify.ok) ||
      livemodeMismatch
    );

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ["agent-access"],
    queryFn: async () => {
      try { return await fetchAccess(); }
      catch { return { hasAccess: false, status: null, idea: null, paidAt: null, projectId: null }; }
    },
    enabled: !sessionId || !!stripeConfirmed,
    refetchInterval: (q) => (q.state.data?.hasAccess ? false : 2000),
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const hasAccess = !!data?.hasAccess && !stripeRejected;
  const timedOut = elapsed >= 15 && !hasAccess;

  useEffect(() => {
    try { localStorage.removeItem("pending_project_id"); } catch { /* noop */ }
    queryClient.invalidateQueries({ queryKey: ["agent-access"] });
  }, [queryClient]);

  useEffect(() => {
    if (hasAccess) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [hasAccess]);

  useEffect(() => {
    if (!hasAccess) return;
    const t = setTimeout(() => navigate({ to: "/project-manager", replace: true }), 1800);
    return () => clearTimeout(t);
  }, [hasAccess, navigate]);

  const handleRecheck = () => {
    queryClient.invalidateQueries({ queryKey: ["agent-access"] });
    void refetch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-2xl mx-auto px-6 py-20 w-full text-center">
        {stripeRejected ? (
          <>
            <div
              className="mx-auto inline-flex items-center justify-center size-16 rounded-full border border-destructive/40 mb-6 bg-destructive/10"
            >
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-tight">
              Pagamento <span className="text-destructive">non confermato</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg">
              Pagamento non confermato da Stripe. Riprova o contatta supporto.
            </p>
            {verify?.ok && (
              <p className="text-xs text-muted-foreground mt-3">
                Stato Stripe: {verify.payment_status ?? "n/d"}{livemodeMismatch ? " · sessione test in produzione" : ""}
              </p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/checkout-agente">
                <Button variant="hero" size="lg">Riprova pagamento</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="glass" size="lg">Vai alla Dashboard</Button>
              </Link>
            </div>
          </>
        ) : (
        <>
        <div
          className="mx-auto inline-flex items-center justify-center size-16 rounded-full border border-primary/40 mb-6"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 25%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
          }}
        >
          {hasAccess ? (
            <CheckCircle2 className="size-8 text-primary" />
          ) : timedOut ? (
            <AlertCircle className="size-8 text-primary" />
          ) : (
            <Loader2 className="size-8 text-primary animate-spin" />
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold leading-tight">
          {hasAccess ? (
            <>Il tuo <span className="gradient-text">Team AI è attivo</span></>
          ) : (
            <>Pagamento <span className="gradient-text">completato</span></>
          )}
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg">
          {hasAccess
            ? "Tutto pronto. Ti portiamo dal tuo Project Manager…"
            : verifyLoading
              ? "Verifichiamo il pagamento con Stripe…"
              : timedOut
              ? "Il pagamento risulta completato, ma l'attivazione sta richiedendo qualche secondo. Puoi controllare di nuovo o tornare alla dashboard."
              : "Pagamento ricevuto. Stiamo attivando il tuo Team AI…"}
        </p>

        {hasAccess ? (
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/project-manager">
              <Button variant="hero" size="lg">
                <MessageSquare className="size-4" /> Vai al Project Manager <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="glass" size="lg">Vai alla Dashboard</Button>
            </Link>
          </div>
        ) : timedOut ? (
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" onClick={handleRecheck} disabled={isRefetching}>
              <RefreshCw className={"size-4 " + (isRefetching ? "animate-spin" : "")} /> Controlla di nuovo
            </Button>
            <Link to="/dashboard">
              <Button variant="glass" size="lg">Vai alla Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" /> Attivazione in corso… ({elapsed}s)
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Riceverai a breve la ricevuta via email.
        </p>
        </>
        )}
      </main>
    </div>
  );
}

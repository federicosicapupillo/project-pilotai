import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Lock, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getAgentAccess } from "@/lib/payments.functions";
import { useActivateTeam } from "@/hooks/use-activate-team";

export function useAcademyAccess() {
  const { user, loading } = useAuth();
  const fetchAccess = useServerFn(getAgentAccess);
  const { data, isLoading } = useQuery({
    queryKey: ["agent-access"],
    queryFn: async () => {
      try {
        return await fetchAccess();
      } catch {
        return { hasAccess: false, status: null, idea: null, paidAt: null };
      }
    },
    enabled: !!user,
    staleTime: 15_000,
    retry: false,
  });
  return {
    user,
    hasAccess: !!data?.hasAccess,
    isLoading: loading || (!!user && isLoading),
  };
}

export function AcademyLock() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activate } = useActivateTeam();
  const handleActivate = () => void activate("academy_lock");

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="size-4" /> Torna indietro
        </Button>
      </div>
      <div className="glass-card rounded-2xl p-10 text-center">
        <div className="size-14 rounded-2xl gradient-bg grid place-items-center glow-soft text-primary-foreground mx-auto mb-6">
          <Lock className="size-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          Academy bloccata
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          L'Academy si sblocca quando attivi il tuo agente AI personale. Sblocca tutti i moduli, le lezioni guidate e i prompt pronti all'uso.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="hero" size="lg" onClick={handleActivate}>
            <Sparkles className="size-4" /> Attiva il mio Team AI - 29€
          </Button>
          {!user && (
            <Link to="/auth">
              <Button variant="outline" size="lg">Accedi</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
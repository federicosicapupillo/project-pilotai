import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAgentAccess } from "@/lib/payments.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot, Lock, ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/agente-ai")({
  head: () => ({ meta: [{ title: "Il tuo agente AI personale" }] }),
  component: AgenteAIPage,
});

function AgenteAIPage() {
  const navigate = useNavigate();
  const fetchAccess = useServerFn(getAgentAccess);
  const { data, isLoading } = useQuery({
    queryKey: ["agent-access"],
    queryFn: async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session?.access_token) {
        return { hasAccess: false, status: null, idea: null, paidAt: null, projectId: null };
      }
      return fetchAccess();
    },
    staleTime: 30_000,
  });

  async function goToDashboard() {
    try {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, idea_description, title, updated_at")
        .order("updated_at", { ascending: false });
      if (projects && projects.length > 0) {
        const idea = (data?.idea ?? "").trim().toLowerCase();
        const match =
          (idea &&
            projects.find(
              (p) =>
                (p.idea_description ?? "").trim().toLowerCase() === idea ||
                (p.title ?? "").trim().toLowerCase() === idea,
            )) ||
          projects[0];
        localStorage.setItem("active_project_id", match.id);
      }
    } catch {
      // non-blocking
    }
    navigate({ to: "/dashboard" });
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <Loader2 className="size-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!data?.hasAccess) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mx-auto inline-flex items-center justify-center size-16 rounded-full border border-border/60 bg-background/40 mb-6">
          <Lock className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          Accesso non attivo
        </h1>
        <p className="text-muted-foreground mt-4">
          Per accedere al tuo agente AI personale devi prima completare l'attivazione.
        </p>
        <div className="mt-8">
          <Button variant="hero" size="lg" onClick={() => navigate({ to: "/checkout-agente" })}>
            Attiva il mio Team AI - 29€ <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
        <Bot className="size-3 text-primary" /> Agente AI attivo
      </div>
      <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-4 leading-tight">
        Benvenuto nel tuo <span className="gradient-text">agente AI</span>
      </h1>
      <p className="text-muted-foreground mt-4 text-base sm:text-lg">
        Da qui inizi a trasformare la tua idea nella prima versione della tua app. Apri la dashboard per accedere ai progetti, alla roadmap operativa e ai prompt.
      </p>

      {data.idea && (
        <div className="mt-6 glass-card rounded-2xl p-5 border border-border/60">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            La tua idea
          </div>
          <p className="text-sm text-foreground/90">{data.idea}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button variant="hero" size="xl" onClick={goToDashboard}>
          Vai alla dashboard <ArrowRight className="size-4" />
        </Button>
        <Link to="/new-project">
          <Button variant="glass" size="xl">
            Crea un nuovo progetto
          </Button>
        </Link>
      </div>
    </main>
  );
}
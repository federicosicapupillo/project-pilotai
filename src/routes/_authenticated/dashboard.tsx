import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Folder, ArrowRight, Sparkles, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Da Idea ad App" }] }),
  component: DashboardPage,
});

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: "Bozza",
    in_progress: "In corso",
    completed: "Completato",
  };
  return map[status] ?? status;
}

function DashboardPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, idea_description, status, product_type, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: recentPrompts } = useQuery({
    queryKey: ["recent-prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("id, title, category, project_id, created_at")
        .not("project_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold">La tua dashboard</h1>
          <p className="text-muted-foreground mt-2">
            I tuoi progetti, lo stato di avanzamento e gli ultimi prompt generati.
          </p>
        </div>
        <Link to="/new-project">
          <Button variant="hero" size="lg">
            <Plus className="size-4" /> Nuovo progetto
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
            I tuoi progetti
          </h2>

          {isLoading && <div className="glass-card rounded-xl p-8 text-muted-foreground">Caricamento…</div>}

          {!isLoading && projects && projects.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <div className="size-14 mx-auto rounded-full gradient-bg grid place-items-center glow-soft mb-4">
                <Sparkles className="size-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold">Inizia il tuo primo progetto</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Descrivi l'idea: ti restituiamo una scheda chiara, una squadra di agenti AI consigliati,
                prompt pronti e una roadmap operativa.
              </p>
              <Link to="/new-project" className="inline-block mt-6">
                <Button variant="hero">
                  <Plus className="size-4" /> Crea progetto
                </Button>
              </Link>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {projects?.map((p) => (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="glass-card rounded-xl p-5 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-lg bg-secondary grid place-items-center">
                    <Folder className="size-5 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                    {statusBadge(p.status)}
                  </span>
                </div>
                <h3 className="font-display font-semibold mt-4 line-clamp-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
                  {p.idea_description ?? "—"}
                </p>
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>{p.product_type ?? "Progetto"}</span>
                  <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                    Apri <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
            Ultimi prompt generati
          </h2>
          <div className="glass-card rounded-xl p-4">
            {!recentPrompts || recentPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Nessun prompt ancora. Crea un progetto per generare la prima squadra di prompt.
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {recentPrompts.map((pr) => (
                  <li key={pr.id} className="py-3 flex items-start gap-3">
                    <div className="size-8 rounded-md bg-secondary grid place-items-center shrink-0">
                      <Activity className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{pr.title}</p>
                      <p className="text-xs text-muted-foreground">{pr.category}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold">Roadmap sintetica</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ogni progetto ha una roadmap di 10 step. Apri un progetto per vedere lo stato.
            </p>
            <Link to="/method" className="inline-flex items-center gap-1 text-sm text-primary mt-3 hover:underline">
              Scopri il metodo <ArrowRight className="size-3" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
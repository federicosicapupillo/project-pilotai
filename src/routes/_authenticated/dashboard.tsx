import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Folder, ArrowRight, Sparkles, Bot, Lock, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { computeProgress, currentPhase, type RoadmapItem } from "@/lib/app-roadmap";
import { useActivateTeam } from "@/hooks/use-activate-team";
import { SyntheticRoadmapCompact } from "@/components/SyntheticRoadmap";
import { useRoadmapProgress } from "@/lib/roadmap-progress";
import { DashboardRoadmap } from "@/components/DashboardRoadmap";
import { AgentPromptsSection } from "@/components/AgentPromptsSection";
import { useActiveProject } from "@/hooks/use-active-project";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — IdeaPilot AI" }] }),
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
  const { activate, hasAccess } = useActivateTeam();
  const { activeId, setActiveId } = useActiveProject();
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, idea_description, status, product_type, updated_at")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  const { data: roadmaps } = useQuery({
    queryKey: ["projects-progress"],
    enabled: !!projects && projects.length > 0,
    queryFn: async () => {
      const ids = projects!.map((p) => p.id);
      const { data, error } = await supabase
        .from("roadmap_items")
        // Only the lightweight fields needed for ProjectCard's progress
        // computation and current-phase label. Heavy fields (prompt_text,
        // expected_output, checklist_items, description) are loaded on
        // demand from the project detail page.
        .select("project_id, status, progress_weight, order_index, phase")
        .in("project_id", ids);
      if (error) throw error;
      const byProject = new Map<string, RoadmapItem[]>();
      for (const r of (data ?? []) as unknown as (RoadmapItem & { project_id: string })[]) {
        if (!byProject.has(r.project_id)) byProject.set(r.project_id, []);
        byProject.get(r.project_id)!.push(r);
      }
      return byProject;
    },
    staleTime: 60_000,
  });

  // Active project: persisted via useActiveProject (localStorage). Falls back
  // to the most recent project (handled inside useActiveProject).
  const activeProject =
    (activeId && projects?.find((p) => p.id === activeId)) || projects?.[0] || null;
  const activeProjectId = activeProject?.id ?? null;

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

      {hasAccess ? (
        <Link
          to="/project-manager"
          search={activeProjectId ? ({ projectId: activeProjectId } as never) : (undefined as never)}
          className="block mb-10"
        >
          <div className="glass-card rounded-2xl p-6 border border-primary/40 glow-soft flex flex-col sm:flex-row sm:items-center gap-5 hover:border-primary/70 transition-all">
            <div className="size-12 rounded-full gradient-bg grid place-items-center shrink-0">
              <Bot className="size-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-lg">
                Parla con il tuo AI Project Manager
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeProject
                  ? `Stai lavorando su: ${activeProject.title}. Dagli una direttiva o fagli coordinare il Team AI.`
                  : "Dagli una direttiva, chiedigli il prossimo passo o fagli coordinare il Team AI sul tuo progetto."}
              </p>
            </div>
            <Button variant="hero" size="lg" className="shrink-0">
              Parla con il mio Project Manager <ArrowRight className="size-4" />
            </Button>
          </div>
        </Link>
      ) : (
        <div className="glass-card rounded-2xl p-6 border border-primary/40 glow-soft flex flex-col sm:flex-row sm:items-center gap-5 mb-10">
          <div className="size-12 rounded-full gradient-bg grid place-items-center shrink-0">
            <Bot className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg">
              Inizia a far costruire l'app al tuo Team AI
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Il progetto è pronto. Attiva il Team AI per sbloccare prompt, roadmap, strumenti e istruzioni operative.
            </p>
          </div>
          <Button variant="hero" size="lg" className="shrink-0" onClick={() => activate("dashboard_banner")}>
            <Lock className="size-4" /> Attiva il mio Team AI - 29€
          </Button>
        </div>
      )}

      {activeProject && (
        <div className="mb-10">
          <DashboardRoadmap
            hasAccess={hasAccess}
            projectId={activeProject.id}
            onActivate={() => activate("dashboard_roadmap_cta", activeProject.id)}
          />
        </div>
      )}

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
              <ProjectCard
                key={p.id}
                project={p}
                roadmapItems={roadmaps?.get(p.id) ?? []}
                hasAccess={hasAccess}
                isActive={p.id === activeProjectId}
                onSelect={() => setActiveId(p.id)}
                onDeleted={(deletedId) => {
                  if (activeId === deletedId) {
                    const next = (projects ?? []).find((x) => x.id !== deletedId);
                    if (next) setActiveId(next.id);
                    else if (typeof window !== "undefined")
                      localStorage.removeItem("active_project_id");
                  }
                  queryClient.invalidateQueries({ queryKey: ["projects"] });
                  queryClient.invalidateQueries({ queryKey: ["my-projects"] });
                  queryClient.invalidateQueries({ queryKey: ["pm-projects"] });
                  queryClient.invalidateQueries({ queryKey: ["projects-progress"] });
                }}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          {hasAccess ? (
            <AgentPromptsSection projectId={activeProjectId} />
          ) : (
            <div className="rounded-2xl p-6 border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 glow-soft">
              <h3 className="font-display font-semibold text-lg">
                Prompt e roadmap si sbloccano dopo l'attivazione
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Il tuo progetto è stato creato. Per vedere prompt operativi, roadmap completa, strumenti e istruzioni devi attivare il Team AI.
              </p>
              <Button
                variant="hero"
                size="lg"
                className="mt-4 w-full"
                onClick={() => activate("dashboard_side_cta")}
              >
                <Lock className="size-4" /> Attiva il mio Team AI - 29€
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Accesso immediato dopo il pagamento.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

type ProjectRow = {
  id: string;
  title: string;
  idea_description: string | null;
  status: string;
  product_type: string | null;
  updated_at: string;
};

function ProjectCard({
  project: p,
  roadmapItems,
  hasAccess,
  isActive,
  onSelect,
  onDeleted,
}: {
  project: ProjectRow;
  roadmapItems: RoadmapItem[];
  hasAccess: boolean;
  isActive: boolean;
  onSelect: () => void;
  onDeleted: (id: string) => void;
}) {
  const pr = computeProgress(roadmapItems);
  const phase = currentPhase(roadmapItems);
  const rm = useRoadmapProgress(p.id);
  const displayPct = hasAccess ? rm.pct : pr.pct;
  const displayDone = hasAccess ? rm.done : pr.completed;
  const displayTotal = hasAccess ? rm.total : pr.total;
  const displayPhase = hasAccess ? (rm.currentStep?.title ?? "Roadmap") : phase;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", p.id)
        .is("deleted_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Progetto eliminato correttamente.");
      setConfirmOpen(false);
      onDeleted(p.id);
    },
    onError: () => {
      toast.error("Non è stato possibile eliminare il progetto. Riprova tra poco.");
    },
  });
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={[
        "glass-card rounded-xl p-5 transition-all group cursor-pointer relative text-left",
        isActive
          ? "border-primary/70 shadow-[0_0_28px_-12px_oklch(0.7_0.18_280/0.7)] ring-1 ring-primary/40"
          : "hover:border-primary/50",
      ].join(" ")}
    >
      <button
        type="button"
        aria-label="Elimina progetto"
        title="Elimina progetto"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmOpen(true);
        }}
        className="absolute top-3 right-3 z-10 inline-flex items-center justify-center size-8 rounded-md border border-border/60 bg-background/60 text-muted-foreground hover:text-destructive hover:border-destructive/60 hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="size-4" />
      </button>
      <div className="flex items-start justify-between gap-2">
        <div className="size-10 rounded-lg bg-secondary grid place-items-center">
          <Folder className="size-5 text-primary" />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end pr-10">
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary font-semibold">
              <CheckCircle2 className="size-3" /> Progetto attivo
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-muted-foreground">
            {statusBadge(p.status)}
          </span>
        </div>
      </div>
      <h3 className="font-display font-semibold mt-4 line-clamp-1" title={p.title}>{shortProjectName(p.title)}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
        {p.idea_description ?? "—"}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          App {displayPct}% · {displayDone}/{displayTotal}
        </span>
        {displayPhase && <span className="text-muted-foreground">{displayPhase}</span>}
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full gradient-bg transition-all" style={{ width: `${displayPct}%` }} />
      </div>
      {hasAccess ? (
        <SyntheticRoadmapCompact projectId={p.id} />
      ) : (
        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
          Prossimo step: attiva il Team AI e fai partire il lavoro sulla tua idea.
        </p>
      )}
      <div className="flex items-center justify-between mt-3 gap-2">
        <span className="text-xs text-muted-foreground truncate">
          {p.product_type ?? "Progetto"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
          >
            <Trash2 className="size-3" /> Elimina
          </button>
          <Link
            to="/projects/$id"
            params={{ id: p.id }}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-border/70 bg-secondary/60 hover:bg-secondary text-foreground font-medium transition-colors"
          >
            Dettagli
          </Link>
          <Link
            to="/project-manager"
            search={{ projectId: p.id } as never}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/20 text-foreground font-medium transition-colors"
          >
            Continua costruzione <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={(o) => !deleteMutation.isPending && setConfirmOpen(o)}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo progetto?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione rimuoverà il progetto <span className="font-medium text-foreground">"{p.title}"</span> dalla tua dashboard insieme alla roadmap, ai prompt generati e allo storico collegato. L'operazione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Eliminazione…</>
              ) : (
                <>Sì, elimina progetto</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
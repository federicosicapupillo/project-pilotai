import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Target, Sparkles, CheckCircle2, Circle, Bot, Wrench } from "lucide-react";
import { ToolBadge } from "@/components/ToolBadge";
import { AcademyLock, useAcademyAccess } from "@/components/AcademyLock";

export const Route = createFileRoute("/_authenticated/academy/modules/$id")({
  head: () => ({ meta: [{ title: "Modulo — Academy" }] }),
  component: ModulePage,
});

function ModulePage() {
  const { id } = Route.useParams();
  const { hasAccess, isLoading: accessLoading } = useAcademyAccess();
  const { data, isLoading } = useQuery({
    queryKey: ["module", id],
    queryFn: async () => {
      const [{ data: mod, error: e1 }, { data: lessons, error: e2 }, { data: progress, error: e3 }] = await Promise.all([
        supabase.from("course_modules").select("*").eq("id", id).single(),
        supabase.from("course_lessons").select("*").eq("module_id", id).order("order_index"),
        supabase.from("user_lesson_progress").select("lesson_id, status"),
      ]);
      if (e1) throw e1; if (e2) throw e2; if (e3) throw e3;
      return { mod, lessons: lessons ?? [], progress: progress ?? [] };
    },
    enabled: hasAccess,
  });

  const completedSet = new Set((data?.progress ?? []).filter((p) => p.status === "completed").map((p) => p.lesson_id));

  if (accessLoading) return <div className="max-w-5xl mx-auto px-6 py-10 text-muted-foreground">Caricamento…</div>;
  if (!hasAccess) return <AcademyLock />;
  if (isLoading) return <div className="max-w-5xl mx-auto px-6 py-10 text-muted-foreground">Caricamento…</div>;
  if (!data?.mod) return <div className="max-w-5xl mx-auto px-6 py-10">Modulo non trovato.</div>;

  // Aggregated agents & tools from lessons
  const agentSet = new Set<string>();
  const toolSet = new Set<string>();
  data.lessons.forEach((l) => {
    if (l.recommended_agent) agentSet.add(l.recommended_agent);
    (l.recommended_tools as string[] | null)?.forEach((t) => toolSet.add(t));
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/academy" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
        <ArrowLeft className="size-4" /> Tutti i moduli
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="size-12 rounded-xl gradient-bg grid place-items-center glow-soft text-primary-foreground font-display font-semibold text-lg shrink-0">
          {data.mod.order_index}
        </div>
        <div>
          <h1 className="text-3xl font-display font-semibold">{data.mod.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{data.mod.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Target className="size-3.5 text-primary" /> Obiettivo
          </div>
          <p className="text-sm">{data.mod.objective}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Sparkles className="size-3.5 text-primary" /> Output finale
          </div>
          <p className="text-sm">{data.mod.final_output}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
            <Bot className="size-3.5 text-primary" /> Agenti consigliati
          </div>
          <div className="flex flex-wrap gap-2">
            {[...agentSet].map((a) => (
              <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-secondary/60 text-foreground">{a}</span>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
            <Wrench className="size-3.5 text-primary" /> Tool consigliati
          </div>
          <div className="flex flex-wrap gap-2">
            {[...toolSet].map((t) => (
              <ToolBadge key={t} name={t} size="sm" />
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3">Lezioni</h2>
      <div className="space-y-2">
        {data.lessons.map((l) => {
          const done = completedSet.has(l.id);
          return (
            <Link
              key={l.id}
              to="/academy/lessons/$id"
              params={{ id: l.id }}
              className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all group"
            >
              {done ? <CheckCircle2 className="size-5 text-primary shrink-0" /> : <Circle className="size-5 text-muted-foreground/40 shrink-0" />}
              <span className="text-xs text-muted-foreground w-6">{l.order_index}.</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{l.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{l.description}</p>
              </div>
              <ArrowRight className="size-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
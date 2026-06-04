import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Compass, CheckCircle2, ArrowRight, Folder, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-path")({
  head: () => ({ meta: [{ title: "Il mio percorso — Da Idea ad App" }] }),
  component: MyPathPage,
});

function MyPathPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-path", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: modules }, { data: lessons }, { data: progress }, { data: projects }, { data: prompts }] = await Promise.all([
        supabase.from("course_modules").select("*").order("order_index"),
        supabase.from("course_lessons").select("id, module_id, title, order_index").order("order_index"),
        supabase.from("user_lesson_progress").select("*").order("updated_at", { ascending: false }),
        supabase.from("projects").select("id, title, updated_at").order("updated_at", { ascending: false }),
        supabase.from("prompts").select("id, title, project_id").not("project_id", "is", null).limit(10),
      ]);
      return {
        modules: modules ?? [], lessons: lessons ?? [],
        progress: progress ?? [], projects: projects ?? [], prompts: prompts ?? [],
      };
    },
  });

  if (isLoading || !data) return <div className="max-w-6xl mx-auto px-6 py-10 text-muted-foreground">Caricamento…</div>;

  const completedSet = new Set(data.progress.filter((p) => p.status === "completed").map((p) => p.lesson_id));
  const totalLessons = data.lessons.length;
  const doneLessons = data.lessons.filter((l) => completedSet.has(l.id)).length;
  const pct = totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100);

  const ordered = [...data.lessons].sort((a, b) => {
    const ma = data.modules.find((m) => m.id === a.module_id)?.order_index ?? 0;
    const mb = data.modules.find((m) => m.id === b.module_id)?.order_index ?? 0;
    return ma - mb || a.order_index - b.order_index;
  });
  const next = ordered.find((l) => !completedSet.has(l.id));
  const nextMod = next ? data.modules.find((m) => m.id === next.module_id) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Compass className="size-3.5 text-primary" /> Il tuo percorso
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">A che punto sei</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-xl p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Lezioni completate</p>
          <p className="text-3xl font-display font-semibold mt-2">{doneLessons} / {totalLessons}</p>
          <Progress value={pct} className="mt-3" />
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Progetti attivi</p>
          <p className="text-3xl font-display font-semibold mt-2">{data.projects.length}</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Prompt nel tuo archivio</p>
          <p className="text-3xl font-display font-semibold mt-2">{data.prompts.length}+</p>
        </div>
      </div>

      {next && nextMod && (
        <div className="glass-card rounded-2xl p-6 mb-8 border-primary/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Prossima azione consigliata</p>
              <p className="font-display font-semibold text-lg mt-1">{next.title}</p>
              <p className="text-sm text-muted-foreground">Modulo {nextMod.order_index} · {nextMod.title}</p>
            </div>
            <Link to="/academy/lessons/$id" params={{ id: next.id }}>
              <Button variant="hero"><Sparkles className="size-4" /> Continua</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3">Moduli completati</h2>
          <div className="space-y-2">
            {data.modules.map((m) => {
              const mLessons = data.lessons.filter((l) => l.module_id === m.id);
              const mDone = mLessons.filter((l) => completedSet.has(l.id)).length;
              const mPct = mLessons.length === 0 ? 0 : Math.round((mDone / mLessons.length) * 100);
              return (
                <Link
                  key={m.id}
                  to="/academy/modules/$id"
                  params={{ id: m.id }}
                  className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/50 transition-all"
                >
                  {mPct === 100 ? <CheckCircle2 className="size-5 text-primary" /> : <span className="size-5 grid place-items-center text-xs text-muted-foreground">{mPct}%</span>}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{m.title}</p>
                    <Progress value={mPct} className="mt-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3">I tuoi progetti</h2>
          <div className="space-y-2">
            {data.projects.length === 0 && (
              <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground">
                Nessun progetto. <Link to="/new-project" className="text-primary hover:underline">Creane uno</Link> per collegarlo al percorso.
              </div>
            )}
            {data.projects.map((p) => (
              <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/50 transition-all">
                <Folder className="size-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{p.title}</p>
                </div>
                <Link to="/workbook/$projectId" params={{ projectId: p.id }} className="text-xs text-primary hover:underline shrink-0 inline-flex items-center gap-1">
                  Workbook <ArrowRight className="size-3" />
                </Link>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
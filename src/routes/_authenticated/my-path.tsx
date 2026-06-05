import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Compass, CheckCircle2, ArrowRight, Folder, Sparkles, Bot, Wrench, BookOpen } from "lucide-react";
import { ActiveProjectBox } from "@/components/ActiveProjectBox";
import { useActiveProject } from "@/hooks/use-active-project";
import { ToolBadge } from "@/components/ToolBadge";

export const Route = createFileRoute("/_authenticated/my-path")({
  head: () => ({ meta: [{ title: "I miei progetti — Da Idea ad App" }] }),
  component: MyPathPage,
});

function MyPathPage() {
  const { user } = useAuth();
  const { active } = useActiveProject();
  const { data, isLoading } = useQuery({
    queryKey: ["my-path", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: modules }, { data: lessons }, { data: progress }, { data: projects }, { data: prompts }] = await Promise.all([
        supabase.from("course_modules").select("*").order("order_index"),
        supabase.from("course_lessons").select("id, module_id, title, order_index, recommended_agent, recommended_tools").order("order_index"),
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
  const nextTools = (next?.recommended_tools as string[] | null) ?? [];
  const lastProgress = data.progress.find((p) => p.notes && p.notes.trim().length > 0);
  const lastLesson = lastProgress ? data.lessons.find((l) => l.id === lastProgress.lesson_id) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Compass className="size-3.5 text-primary" /> I tuoi progetti
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">I miei progetti</h1>
      </div>

      <div className="mb-6">
        <ActiveProjectBox />
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
        <div className="glass-card rounded-2xl p-6 mb-8 border-primary/40">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-primary">Prossima azione consigliata</p>
              <p className="font-display font-semibold text-xl mt-1">
                Lezione {nextMod.order_index}.{next.order_index} — {next.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Modulo {nextMod.order_index} · {nextMod.title}</p>
              <p className="text-sm mt-3 leading-relaxed">
                Apri questa lezione, usa l'<span className="text-foreground font-medium">Agente {next.recommended_agent ?? "consigliato"}</span>
                {nextTools.length > 0 && (<> con <span className="text-foreground font-medium">{nextTools.join(", ")}</span></>)},
                copia il prompt {active ? <>già personalizzato su <span className="text-foreground font-medium">"{active.title}"</span></> : "(personalizzato sul tuo progetto se ne hai uno attivo)"}, e salva l'output nel Workbook.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {next.recommended_agent && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary/60">
                    <Bot className="size-3 text-primary" /> {next.recommended_agent}
                  </span>
                )}
                {nextTools.map((t) => (
                  <ToolBadge key={t} name={t} size="sm" prefix="Apri" />
                ))}
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="hero"><Sparkles className="size-4" /> Continua</Button>
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-3 text-xs">
            {active && (
              <Link to="/workbook/$projectId" params={{ projectId: active.id }} className="text-primary hover:underline inline-flex items-center gap-1">
                <BookOpen className="size-3" /> Apri Workbook
              </Link>
            )}
            {active && (
              <Link to="/projects/$id" params={{ id: active.id }} className="text-primary hover:underline inline-flex items-center gap-1">
                <Folder className="size-3" /> Apri progetto
              </Link>
            )}
            <Link to="/tools" className="text-primary hover:underline inline-flex items-center gap-1">
              <Wrench className="size-3" /> Libreria strumenti
            </Link>
          </div>
        </div>
      )}

      {lastLesson && (
        <div className="glass-card rounded-xl p-5 mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Ultimo output salvato</p>
          <p className="font-medium mt-1">{lastLesson.title}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lastProgress?.notes}</p>
          <Link to="/dashboard" className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
            Apri dashboard <ArrowRight className="size-3" />
          </Link>
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
                  to="/dashboard"
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
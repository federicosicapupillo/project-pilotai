import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, ArrowRight, CheckCircle2, Circle, Rocket } from "lucide-react";
import { OperativeCircuit } from "@/components/OperativeCircuit";
import { ReusableToolkitBox } from "@/components/ReusableToolkitBox";
import { AcademyLock, useAcademyAccess } from "@/components/AcademyLock";

export const Route = createFileRoute("/academy")({
  head: () => ({ meta: [{ title: "Academy — Da Idea ad App" }] }),
  component: AcademyPage,
});

function AcademyPage() {
  const { hasAccess, isLoading: accessLoading } = useAcademyAccess();
  const { data, isLoading } = useQuery({
    queryKey: ["academy-overview"],
    queryFn: async () => {
      const [{ data: modules, error: e1 }, { data: lessons, error: e2 }, { data: progress, error: e3 }] = await Promise.all([
        supabase.from("course_modules").select("*").order("order_index"),
        supabase.from("course_lessons").select("id, module_id, order_index, title"),
        supabase.from("user_lesson_progress").select("lesson_id, status, completed_at"),
      ]);
      if (e1) throw e1; if (e2) throw e2; if (e3) throw e3;
      return { modules: modules ?? [], lessons: lessons ?? [], progress: progress ?? [] };
    },
    enabled: hasAccess,
  });

  const completedSet = new Set((data?.progress ?? []).filter((p) => p.status === "completed").map((p) => p.lesson_id));
  const totalLessons = data?.lessons.length ?? 0;
  const completedCount = (data?.lessons ?? []).filter((l) => completedSet.has(l.id)).length;
  const overallPct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  // next lesson = first in order across modules that isn't completed
  const orderedLessons = [...(data?.lessons ?? [])].sort((a, b) => {
    const ma = data?.modules.find((m) => m.id === a.module_id)?.order_index ?? 0;
    const mb = data?.modules.find((m) => m.id === b.module_id)?.order_index ?? 0;
    return ma - mb || a.order_index - b.order_index;
  });
  const nextLesson = orderedLessons.find((l) => !completedSet.has(l.id));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
            <GraduationCap className="size-3.5 text-primary" /> Laboratorio guidato dall'AI
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold">Costruisci la tua app passo dopo passo</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Niente video lunghi. Segui gli step, copia i prompt e fatti guidare dal tuo agente AI personale.
          </p>
        </div>
        {nextLesson && (
          <Link to="/academy/lessons/$id" params={{ id: nextLesson.id }}>
            <Button variant="hero" size="lg">
              <Rocket className="size-4" /> {completedCount === 0 ? "Inizia dal primo step" : "Continua il percorso"}
            </Button>
          </Link>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Avanzamento totale</p>
            <p className="text-2xl font-display font-semibold mt-1">{completedCount} / {totalLessons} lezioni</p>
          </div>
          <div className="text-3xl font-display font-semibold gradient-text">{overallPct}%</div>
        </div>
        <Progress value={overallPct} />
      </div>

      <div className="mb-8">
        <OperativeCircuit />
      </div>

      <div className="mb-8">
        <ReusableToolkitBox />
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      <div className="grid md:grid-cols-2 gap-5">
        {data?.modules.map((m) => {
          const mLessons = (data.lessons ?? []).filter((l) => l.module_id === m.id);
          const mDone = mLessons.filter((l) => completedSet.has(l.id)).length;
          const pct = mLessons.length === 0 ? 0 : Math.round((mDone / mLessons.length) * 100);
          return (
            <Link
              key={m.id}
              to="/academy/modules/$id"
              params={{ id: m.id }}
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft text-primary-foreground font-display font-semibold">
                  {m.order_index}
                </div>
                {pct === 100 ? (
                  <CheckCircle2 className="size-5 text-primary" />
                ) : pct > 0 ? (
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                ) : (
                  <Circle className="size-5 text-muted-foreground/50" />
                )}
              </div>
              <h3 className="font-display font-semibold text-lg mt-4">{m.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
              <div className="mt-4">
                <Progress value={pct} />
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>{mLessons.length} lezioni</span>
                <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  Apri modulo <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
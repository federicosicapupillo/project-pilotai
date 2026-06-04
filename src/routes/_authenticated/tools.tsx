import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "Libreria Strumenti — Da Idea ad App" }] }),
  component: ToolsPage,
});

const difficultyColor: Record<string, string> = {
  Facile: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  Medio: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  Avanzato: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
};

function ToolsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tool-library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tool_library").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Wrench className="size-3.5 text-primary" /> Libreria
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">Strumenti AI</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Gli strumenti che useremo nel percorso. Per ognuno: a cosa serve, quando aprirlo, livello e un esempio pratico.
        </p>
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((t) => (
          <div key={t.id} className="glass-card rounded-xl p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-display font-semibold text-lg">{t.name}</h3>
              {t.difficulty_level && (
                <span className={"text-[10px] uppercase tracking-wider px-2 py-1 rounded-full " + (difficultyColor[t.difficulty_level] ?? "bg-secondary/60")}>
                  {t.difficulty_level}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{t.description}</p>
            <dl className="space-y-2 text-sm mt-3">
              {t.use_case && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Quando usarlo</dt>
                <dd>{t.use_case}</dd>
              </>)}
              {t.course_phase && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Fase del percorso</dt>
                <dd>{t.course_phase}</dd>
              </>)}
              {t.example_use && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Esempio d'uso</dt>
                <dd className="italic text-muted-foreground">{t.example_use}</dd>
              </>)}
            </dl>
            {t.url && (
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="mt-auto pt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Apri strumento <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
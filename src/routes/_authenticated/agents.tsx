import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/agents")({
  head: () => ({ meta: [{ title: "Libreria Agenti — Da Idea ad App" }] }),
  component: AgentsPage,
});

function AgentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["agent-library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_library").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Bot className="size-3.5 text-primary" /> Libreria
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">Agenti AI</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          La tua squadra di agenti specializzati. Per ognuno: ruolo, quando usarlo, cosa produce e prompt base pronto da copiare.
        </p>
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {data?.map((a) => (
          <div key={a.id} className="glass-card rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display font-semibold text-lg">Agente {a.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{a.role}</p>
              </div>
              {a.course_phase && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary/60 text-muted-foreground shrink-0">
                  {a.course_phase}
                </span>
              )}
            </div>
            <dl className="space-y-2 text-sm">
              {a.when_to_use && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-3">Quando usarlo</dt>
                <dd>{a.when_to_use}</dd>
              </>)}
              {a.expected_output && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-3">Cosa produce</dt>
                <dd>{a.expected_output}</dd>
              </>)}
              {Array.isArray(a.recommended_tools) && a.recommended_tools.length > 0 && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-3">Tool consigliati</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {(a.recommended_tools as string[]).map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary/60">{t}</span>
                  ))}
                </dd>
              </>)}
            </dl>
            {a.base_prompt && (
              <div className="mt-4 bg-secondary/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Prompt base</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(a.base_prompt!);
                      toast.success("Prompt copiato!");
                    }}
                  >
                    <ClipboardCopy className="size-3.5" /> Copia
                  </Button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-sans">{a.base_prompt}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
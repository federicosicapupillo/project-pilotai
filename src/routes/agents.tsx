import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot, ClipboardCopy, Lock, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { AgentIcon } from "@/components/AgentIcon";
import { ToolBadge } from "@/components/ToolBadge";
import { toast } from "sonner";
import { useAcademyAccess } from "@/components/AcademyLock";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "Libreria Agenti — Da Idea ad App" }] }),
  component: AgentsPage,
});

const AGENT_GREETING: Record<string, { hello: string; pitch: string }> = {
  Stratega:          { hello: "Ciao, sono il tuo Agente Stratega",   pitch: "Ti aiuto a trasformare un'idea confusa in una direzione chiara. Prima di costruire, capisco cosa serve davvero." },
  "Product Manager": { hello: "Ciao, sono il tuo Product Manager",    pitch: "Organizzo il progetto, scelgo le funzioni importanti e preparo la strada per creare la prima versione." },
  Validatore:        { hello: "Ciao, sono il tuo Agente Validatore",  pitch: "Controllo se la tua idea ha senso, se risolve un problema reale e se vale la pena costruirla." },
  Ricercatore:       { hello: "Ciao, sono il tuo Agente Ricercatore", pitch: "Cerco informazioni utili, competitor, esempi e dati per rendere la tua app più solida." },
  UX:                { hello: "Ciao, sono il tuo UX Agent",           pitch: "Ti aiuto a capire quali schermate servono e come rendere l'app semplice da usare." },
  Build:             { hello: "Ciao, sono il tuo Build Agent",        pitch: "Preparo la struttura operativa per trasformare l'idea in una prima versione funzionante." },
  Test:              { hello: "Ciao, sono il tuo Test Agent",         pitch: "Controllo errori, punti deboli e passaggi da migliorare prima di andare avanti." },
  Lancio:            { hello: "Ciao, sono il tuo Launch Agent",       pitch: "Ti aiuto a preparare la tua app per presentarla, venderla o lanciarla." },
};

function greetingFor(name: string, role: string | null | undefined) {
  if (AGENT_GREETING[name]) return AGENT_GREETING[name];
  return {
    hello: `Ciao, sono il tuo Agente ${name}`,
    pitch: role || "Sono parte del tuo Team AI e lavoro al tuo fianco sulla tua idea.",
  };
}

function AgentsPage() {
  const { hasAccess } = useAcademyAccess();
  const { data, isLoading } = useQuery({
    queryKey: ["agent-library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_library").select("*").order("sort_order").order("name");
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
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          La tua squadra di <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">agenti AI</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Ogni agente ha un ruolo preciso. Tu dai le direttive, loro preparano il lavoro. Dopo l'attivazione vedrai tool, prompt e istruzioni operative per usarli davvero.
        </p>
        {hasAccess ? (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
            <CheckCircle2 className="size-3.5" /> Il tuo Team AI è attivo. Ora puoi usare tool, prompt e agenti operativi.
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs text-primary">
            <Lock className="size-3.5" /> Puoi conoscere il team. Per metterlo al lavoro, attiva il Team AI.
          </div>
        )}
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {data?.map((a) => (
          <div key={a.id} className="glass-card rounded-xl p-6 relative">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-md" aria-hidden />
                  <div className="relative size-14 rounded-full bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 grid place-items-center text-primary-foreground ring-2 ring-primary/40 shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--primary)_70%,transparent)]">
                    <AgentIcon name={a.icon} size={24} />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg leading-tight">{greetingFor(a.name, a.role).hello}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{a.role}</p>
                </div>
              </div>
              {hasAccess ? (
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0 inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Sbloccato
                </span>
              ) : a.course_phase ? (
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary/60 text-muted-foreground shrink-0">
                  {a.course_phase}
                </span>
              ) : null}
            </div>

            <p className="text-sm text-foreground/85 mb-3">
              {greetingFor(a.name, a.role).pitch}
            </p>

            {hasAccess ? (
              <>
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
                    <ToolBadge key={t} name={t} size="sm" />
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
              </>
            ) : (
              <div
                className="mt-3 rounded-xl border border-primary/30 p-4"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklab, var(--primary) 12%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
                }}
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary/90 font-semibold">
                  <Lock className="size-3.5" /> Area operativa bloccata
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Questo agente è pronto. Attiva il Team AI per metterlo al lavoro sulla tua idea e vedere tool consigliati, prompt base e istruzioni operative.
                </p>
                <div className="mt-3">
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/prezzi">
                      <Sparkles className="size-3.5" /> Attiva Team AI - 29€ <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
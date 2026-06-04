import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, ExternalLink } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { OperativeCircuit } from "@/components/OperativeCircuit";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "Tool Stack — Da Idea ad App" }] }),
  component: ToolsPage,
});

const LEVEL_STYLE: Record<string, string> = {
  base: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  intermedio: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  avanzato: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};
const LEVEL_LABEL: Record<string, string> = { base: "Base", intermedio: "Intermedio", avanzato: "Avanzato" };

const REQ_STYLE: Record<string, string> = {
  required: "bg-primary/15 text-primary border-primary/30",
  recommended: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  optional: "bg-secondary/60 text-muted-foreground border-border/60",
};
const REQ_LABEL: Record<string, string> = { required: "Obbligatorio", recommended: "Consigliato", optional: "Opzionale" };

const CATEGORY_ORDER = [
  "Sviluppo / Costruzione",
  "AI di supporto",
  "Memoria / Organizzazione",
  "Creatività / Media",
  "Integrazioni prodotto",
];

function ToolsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tool-library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tool_library").select("*").order("sort_order").order("name");
      if (error) throw error;
      return data;
    },
  });

  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, t) => {
    const cat = t.category ?? "Altro";
    if (!acc[cat]) acc[cat] = [] as never;
    (acc[cat] as unknown as typeof data)!.push(t);
    return acc;
  }, {});
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]?.length),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Wrench className="size-3.5 text-primary" /> Tool stack
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">Tutti gli strumenti del tuo percorso</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Usa solo gli strumenti che ti servono davvero, quando ti servono. Stripe e Twilio si attivano solo nelle integrazioni di prodotto. GitHub Desktop è un supporto a GitHub, non lo sostituisce. Antigravity ti aiuta su codice e logica, ma non sostituisce Obsidian per la memoria del progetto.
        </p>
      </div>

      <div className="mb-8">
        <OperativeCircuit />
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      {orderedCats.map((cat) => (
        <section key={cat} className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{cat}</h2>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{grouped[cat]?.length} strumenti</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[cat]?.map((t) => {
              const lvl = (t.level ?? t.difficulty_level ?? "").toLowerCase();
              const req = t.requirement ?? "";
              const pairs = Array.isArray(t.pairs_with_agents) ? (t.pairs_with_agents as string[]) : [];
              return (
                <div key={t.id} className="glass-card rounded-xl p-5 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-11 rounded-xl bg-background/60 border border-border/60 grid place-items-center shrink-0">
                      <ToolIcon name={t.name} size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-lg leading-tight">{t.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {req && REQ_LABEL[req] && (
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${REQ_STYLE[req]}`}>
                            {REQ_LABEL[req]}
                          </span>
                        )}
                        {lvl && LEVEL_LABEL[lvl] && (
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${LEVEL_STYLE[lvl]}`}>
                            {LEVEL_LABEL[lvl]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                  <dl className="space-y-2 text-sm mt-3">
                    {t.phase_note && (<>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Quando usarlo</dt>
                      <dd>{t.phase_note}</dd>
                    </>)}
                    {t.course_phase && (<>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Fase del percorso</dt>
                      <dd className="text-foreground/90">{t.course_phase}</dd>
                    </>)}
                    {pairs.length > 0 && (<>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Agenti con cui si abbina</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {pairs.map((p) => (
                          <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/60">{p}</span>
                        ))}
                      </dd>
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
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
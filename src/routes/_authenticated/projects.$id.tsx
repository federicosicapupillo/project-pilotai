import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, CheckCircle2, Circle, CircleDot, Users, Sparkles, ClipboardList, ListChecks, Layers, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { ToolBadge } from "@/components/ToolBadge";
import { OperativeCircuit } from "@/components/OperativeCircuit";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({ meta: [{ title: "Progetto — Da Idea ad App" }] }),
  component: ProjectPage,
});

type StatusValue = "todo" | "in_progress" | "done";
const STATUS_LABEL: Record<StatusValue, string> = {
  todo: "Da fare",
  in_progress: "In corso",
  done: "Completato",
};
const STATUS_ORDER: StatusValue[] = ["todo", "in_progress", "done"];

function ProjectPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: analysis } = useQuery({
    queryKey: ["analysis", id],
    queryFn: async () => {
      const { data } = await supabase.from("project_analysis").select("*").eq("project_id", id).maybeSingle();
      return data;
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["agents", id],
    queryFn: async () => {
      const { data } = await supabase.from("agents").select("*").eq("project_id", id).order("created_at");
      return data ?? [];
    },
  });

  const { data: prompts } = useQuery({
    queryKey: ["prompts", id],
    queryFn: async () => {
      const { data } = await supabase.from("prompts").select("*").eq("project_id", id).order("created_at");
      return data ?? [];
    },
  });

  const { data: roadmap } = useQuery({
    queryKey: ["roadmap", id],
    queryFn: async () => {
      const { data } = await supabase.from("roadmap_items").select("*").eq("project_id", id).order("priority");
      return data ?? [];
    },
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiato negli appunti");
  };

  const cycleStatus = async (itemId: string, current: string) => {
    const idx = STATUS_ORDER.indexOf((current as StatusValue) ?? "todo");
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    await supabase.from("roadmap_items").update({ status: next }).eq("id", itemId);
    qc.invalidateQueries({ queryKey: ["roadmap", id] });
  };

  const completed = roadmap?.filter((r) => r.status === "done").length ?? 0;
  const total = roadmap?.length ?? 0;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  // Recommended stack: derived from product type with sensible defaults
  const stackOrder: { tool: string; why: string; required?: boolean; optional?: boolean }[] = [
    { tool: "ChatGPT", why: "Chiarire l'idea e ragionare passo passo.", required: true },
    { tool: "Perplexity", why: "Ricerca di mercato con fonti reali." },
    { tool: "Obsidian", why: "Salva decisioni, prompt, screenshot del progetto." },
    { tool: "Lovable", why: "Costruisci la prima versione dell'app.", required: true },
    { tool: "Supabase", why: "Database, login e salvataggio dati." },
    { tool: "Antigravity", why: "Analizza e correggi codice e logica.", optional: true },
    { tool: "GitHub", why: "Versiona tutte le modifiche." },
    { tool: "GitHub Desktop", why: "Push/pull/commit visuale senza terminale.", optional: true },
    { tool: "Midjourney", why: "Concept visivi e mood di brand.", optional: true },
    { tool: "Runway", why: "Video demo o teaser dell'MVP.", optional: true },
    { tool: "Stripe", why: "Aggiungi pagamenti SOLO se l'MVP li richiede.", optional: true },
    { tool: "Twilio", why: "OTP/SMS SOLO se servono al prodotto.", optional: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" /> Dashboard
      </button>

      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {project?.product_type ?? "Progetto"}
            </span>
            <h1 className="text-3xl font-display font-semibold mt-1">{project?.title ?? "—"}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{project?.idea_description}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Avanzamento</div>
            <div className="text-3xl font-display font-semibold gradient-text">{pct}%</div>
            <div className="text-xs text-muted-foreground">{completed}/{total} step</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-bg transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Tabs defaultValue="scheda">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="scheda"><ClipboardList className="size-4" /> Scheda</TabsTrigger>
          <TabsTrigger value="stack"><Layers className="size-4" /> Stack</TabsTrigger>
          <TabsTrigger value="agents"><Users className="size-4" /> Agenti</TabsTrigger>
          <TabsTrigger value="prompts"><Sparkles className="size-4" /> Prompt</TabsTrigger>
          <TabsTrigger value="roadmap"><ListChecks className="size-4" /> Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="scheda" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <SchedaBlock title="Target utenti" content={analysis?.target_users} />
            <SchedaBlock title="Problema risolto" content={analysis?.main_problem} />
            <SchedaBlock title="Soluzione proposta" content={analysis?.proposed_solution} />
            <SchedaList title="Funzioni principali" items={analysis?.main_features as string[]} />
            <SchedaList title="Schermate necessarie" items={analysis?.required_screens as string[]} />
            <SchedaList title="Dati da salvare" items={analysis?.data_to_save as string[]} />
            <SchedaList title="Rischi" items={analysis?.risks as string[]} accent="destructive" />
            <SchedaBlock title="Prima versione MVP" content={analysis?.mvp_version} />
            <SchedaList title="Cosa NON costruire subito" items={analysis?.not_to_build_now as string[]} />
          </div>
        </TabsContent>

        <TabsContent value="stack" className="mt-6 space-y-6">
          <OperativeCircuit />
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Stack consigliato</div>
                <h3 className="font-display font-semibold text-lg mt-0.5">Ordine d'uso per questo progetto</h3>
              </div>
              <Link to="/workbook/$projectId" params={{ projectId: id }} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                <BookOpen className="size-3.5" /> Apri workbook
              </Link>
            </div>
            <ol className="space-y-3">
              {stackOrder.map((s, i) => (
                <li key={s.tool} className="flex items-start gap-3">
                  <span className="size-6 rounded-full bg-secondary/70 text-xs grid place-items-center font-display font-semibold text-muted-foreground shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ToolBadge name={s.tool} size="sm" />
                      {s.required && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">Obbligatorio</span>
                      )}
                      {s.optional && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-secondary/60 text-muted-foreground border border-border/60">Opzionale</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.why}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground mt-4">
              Stripe e Twilio servono solo se il tuo MVP richiede pagamenti reali o telefonia/SMS. Non sono il primo passo.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {agents?.map((a) => (
              <div key={a.id} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                    <Sparkles className="size-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{a.name}</h3>
                    <p className="text-xs text-muted-foreground">{a.role}</p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div><dt className="text-xs uppercase text-muted-foreground tracking-wider">Quando usarlo</dt><dd>{a.when_to_use}</dd></div>
                  <div><dt className="text-xs uppercase text-muted-foreground tracking-wider">Output atteso</dt><dd>{a.expected_output}</dd></div>
                </dl>
                <div className="mt-4 rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-auto">
                  {a.prompt_text}
                </div>
                <Button variant="glass" size="sm" className="mt-3 w-full" onClick={() => copy(a.prompt_text ?? "")}>
                  <Copy className="size-4" /> Copia prompt
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6 space-y-4">
          {prompts?.map((p) => (
            <div key={p.id} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                    {p.category}
                  </span>
                  <h3 className="font-display font-semibold mt-2">{p.title}</h3>
                  {p.recommended_tool && (
                    <p className="text-xs text-muted-foreground mt-1">Consigliato: {p.recommended_tool}</p>
                  )}
                </div>
                <Button variant="glass" size="sm" onClick={() => copy(p.prompt_text)}>
                  <Copy className="size-4" /> Copia
                </Button>
              </div>
              <pre className="mt-3 rounded-lg border border-border/60 bg-background/60 p-4 font-mono text-xs whitespace-pre-wrap overflow-auto">
{p.prompt_text}
              </pre>
            </div>
          ))}
          {prompts && prompts.length === 0 && <p className="text-muted-foreground">Nessun prompt.</p>}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <div className="glass-card rounded-2xl p-6 space-y-2">
            {roadmap?.map((r) => {
              const Icon = r.status === "done" ? CheckCircle2 : r.status === "in_progress" ? CircleDot : Circle;
              const color = r.status === "done" ? "text-primary" : r.status === "in_progress" ? "text-accent" : "text-muted-foreground";
              return (
                <button
                  key={r.id}
                  onClick={() => cycleStatus(r.id, r.status)}
                  className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <Icon className={`size-5 mt-0.5 ${color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-medium ${r.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                        {r.title}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {STATUS_LABEL[r.status as StatusValue]}
                      </span>
                    </div>
                    {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                  </div>
                </button>
              );
            })}
            <p className="text-xs text-muted-foreground text-center pt-4">
              Clicca su uno step per cambiare stato → Da fare → In corso → Completato.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-10 text-center">
        <Link to="/library" className="text-sm text-primary hover:underline">
          Esplora la libreria di prompt globale →
        </Link>
      </div>
    </div>
  );
}

function SchedaBlock({ title, content }: { title: string; content?: string | null }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</h3>
      <p className="mt-2 text-sm">{content || "—"}</p>
    </div>
  );
}

function SchedaList({ title, items, accent }: { title: string; items?: string[]; accent?: "destructive" }) {
  const list = Array.isArray(items) ? items : [];
  const dotColor = accent === "destructive" ? "bg-destructive" : "bg-primary";
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {list.length === 0 && <li className="text-sm text-muted-foreground">—</li>}
        {list.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={`size-1.5 rounded-full mt-2 shrink-0 ${dotColor}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
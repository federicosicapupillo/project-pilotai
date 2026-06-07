import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Users, Sparkles, ClipboardList, ListChecks, Layers, BookOpen, MessageSquare, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { ToolBadge } from "@/components/ToolBadge";
import { OperativeCircuit } from "@/components/OperativeCircuit";
import { AppRoadmap, useAppRoadmap } from "@/components/AppRoadmap";
import { SyntheticRoadmap } from "@/components/SyntheticRoadmap";
import { computeProgress, currentPhase, nextActionableStep } from "@/lib/app-roadmap";
import { useActivateTeam } from "@/hooks/use-activate-team";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({ meta: [{ title: "Progetto — IdeaPilot AI" }] }),
  component: ProjectPage,
});

function ProjectPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

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

  const { data: roadmap = [] } = useAppRoadmap(id);
  const { activate, hasAccess } = useActivateTeam();

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiato negli appunti");
  };

  const progress = computeProgress(roadmap);
  const phaseNow = currentPhase(roadmap);
  const nextStep = nextActionableStep(roadmap);

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
    { tool: "Runway", why: "Video demo o teaser della prima versione dell'app.", optional: true },
    { tool: "Stripe", why: "Aggiungi pagamenti SOLO se la prima versione dell'app li richiede.", optional: true },
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
            <div className="text-3xl font-display font-semibold gradient-text">{progress.pct}%</div>
            <div className="text-xs text-muted-foreground">{progress.completed}/{progress.total} step</div>
            {phaseNow && <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Fase: {phaseNow}</div>}
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-bg transition-all" style={{ width: `${progress.pct}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="text-foreground/90 font-medium">Prossimo step:</span>{" "}
          {hasAccess
            ? "segui la roadmap e inizia a lavorare con il tuo Team AI."
            : "attiva il Team AI e fai partire il lavoro sulla tua idea."}
        </p>
        {project?.idea_run_id && (
          <div className="mt-4">
            <Button variant="outline" size="lg" asChild>
              <Link
                to="/account/ideas/$runId"
                params={{ runId: project.idea_run_id as string }}
              >
                <FileText className="size-4" /> Rivedi report e potenziale stimato
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Puoi tornare quando vuoi a rivedere la stima, il potenziale e i prossimi step della tua app.
            </p>
          </div>
        )}
        {hasAccess && (
          <div className="mt-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/project-manager" search={{ projectId: id } as never}>
                <MessageSquare className="size-4" /> Parla con il mio Project Manager <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Tabs
        defaultValue="scheda"
        onValueChange={(v) => {
          if (v === "agents") {
            navigate({ to: "/agents", search: { projectId: id } as never });
          }
        }}
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="scheda"><ClipboardList className="size-4" /> Scheda</TabsTrigger>
          <TabsTrigger value="stack"><Layers className="size-4" /> Stack</TabsTrigger>
          <TabsTrigger value="agents"><Users className="size-4" /> Agenti</TabsTrigger>
          <TabsTrigger value="prompts"><Sparkles className="size-4" /> Prompt</TabsTrigger>
          <TabsTrigger value="roadmap"><ListChecks className="size-4" /> Roadmap App</TabsTrigger>
        </TabsList>

        <TabsContent value="scheda" className="mt-6">
          <div className="glass-card rounded-xl p-5 mb-4 border border-primary/20">
            <h3 className="font-display font-semibold text-base">Cos'è la prima versione dell'app?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Non devi costruire subito l'app perfetta. La prima versione (chiamata anche MVP) serve a creare qualcosa di semplice, funzionante e testabile. Contiene solo le funzioni indispensabili per capire se la tua idea può davvero funzionare.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <SchedaBlock title="Target utenti" content={analysis?.target_users} />
            <SchedaBlock title="Problema risolto" content={analysis?.main_problem} />
            <SchedaBlock title="Soluzione proposta" content={analysis?.proposed_solution} />
            <SchedaList title="Funzioni principali" items={analysis?.main_features as string[]} />
            <SchedaList title="Schermate necessarie" items={analysis?.required_screens as string[]} />
            <SchedaList title="Dati da salvare" items={analysis?.data_to_save as string[]} />
            <SchedaList title="Rischi" items={analysis?.risks as string[]} accent="destructive" />
            <SchedaBlock title="Prima versione dell'app (MVP)" content={analysis?.mvp_version} />
            <SchedaList title="Cosa NON costruire subito" items={analysis?.not_to_build_now as string[]} />
          </div>
        </TabsContent>

        <TabsContent value="stack" className="mt-6 space-y-6">
          <OperativeCircuit hideTools={!hasAccess} />
          {hasAccess ? (
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
                Stripe e Twilio servono solo se la prima versione della tua app richiede pagamenti reali o telefonia/SMS. Non sono il primo passo.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Metodo</div>
              <h3 className="font-display font-semibold text-lg mt-0.5">Ordine operativo del progetto</h3>
              <ol className="mt-4 space-y-3">
                {[
                  "Chiarire l'idea",
                  "Analizzare il contesto",
                  "Organizzare il progetto",
                  "Costruire la prima versione",
                  "Gestire dati e accessi",
                  "Testare e migliorare",
                  "Preparare il lancio",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="size-6 rounded-full bg-secondary/70 text-xs grid place-items-center font-display font-semibold text-muted-foreground shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground/90 mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Gli strumenti reali usati in ogni fase si sbloccano dopo l'attivazione del Team AI.
              </p>
            </div>
          )}
          {!hasAccess && (
            <div className="rounded-2xl p-6 sm:p-8 border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 glow-soft text-center">
              <h3 className="text-xl sm:text-2xl font-display font-semibold">
                Vuoi sbloccare gli strumenti del tuo Team AI?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
                Ora vedi il metodo. Dopo l'attivazione vedrai anche gli strumenti reali, l'ordine operativo completo e come usarli nel tuo progetto.
              </p>
              <div className="mt-5 flex justify-center">
                <Button size="lg" variant="hero" onClick={() => activate("project_stack_cta", id)}>
                  <Lock className="size-4" /> Attiva il mio Team AI - 29€
                </Button>
              </div>
            </div>
          )}
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
          {hasAccess ? (
            <div className="space-y-8">
              <SyntheticRoadmap projectId={id} />
              <AppRoadmap projectId={id} />
            </div>
          ) : (
            <div className="rounded-2xl p-6 sm:p-8 border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 glow-soft text-center">
              <h3 className="text-xl sm:text-2xl font-display font-semibold">
                La roadmap operativa si sblocca con il Team AI
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
                Attiva il Team AI per vedere la roadmap del progetto e iniziare ad avanzare step per step.
              </p>
              <div className="mt-5 flex justify-center">
                <Button size="lg" variant="hero" onClick={() => activate("project_roadmap_cta", id)}>
                  <Lock className="size-4" /> Attiva il mio Team AI - 29€
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!hasAccess && (
        <div className="mt-12 rounded-2xl p-8 sm:p-10 border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 glow-soft text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold">
            Vuoi iniziare davvero a costruire questa app?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Il progetto è pronto. Ora devi solo attivare il tuo Team AI per mettere al lavoro gli agenti, sbloccare prompt, strumenti e roadmap operative.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              size="lg"
              variant="hero"
              onClick={() => activate("project_detail_cta", id)}
            >
              <Lock className="size-4" /> Attiva il mio Team AI - 29€
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Pagamento sicuro. Accesso immediato dopo l'attivazione.
          </p>
        </div>
      )}

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
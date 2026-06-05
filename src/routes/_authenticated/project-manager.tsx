import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bot, Lock, Send, Loader2, ArrowRight, Sparkles, User, Check, Circle, Copy, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useActivateTeam } from "@/hooks/use-activate-team";
import {
  getPmHistory,
  sendPmMessage,
  getPmLogs,
  generateOperationalPrompt,
  listOperationalPrompts,
  markOperationalPromptCopied,
} from "@/lib/project-manager.functions";
import { SYNTHETIC_STEPS, syntheticProgress } from "@/components/SyntheticRoadmap";

export const Route = createFileRoute("/_authenticated/project-manager")({
  head: () => ({ meta: [{ title: "Il tuo AI Project Manager" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    projectId: typeof s.projectId === "string" ? s.projectId : undefined,
  }),
  component: ProjectManagerPage,
});

const TEAM = [
  "Stratega",
  "Validatore",
  "Ricercatore",
  "MVP",
  "UX",
  "Architetto Dati",
  "Istruttore",
  "Costruttore",
  "Controllo Qualità",
  "Sicurezza",
  "Lancio",
];

const QUICK_ACTIONS = [
  "Andiamo avanti con il prossimo step",
  "Qual è lo step corrente?",
  "Mostrami il riepilogo della roadmap",
  "Prepara il prossimo prompt",
  "Salva una miglioria nel Backlog futuro",
  "Mostrami il Backlog migliorie",
  "Dimmi cosa fare adesso",
];

const FOLLOWUP_ACTIONS = [
  "Approvo, vai avanti",
  "Genera prompt operativo",
  "Fammi vedere un'alternativa",
  "Semplifica",
  "Approfondisci",
  "Salva nel Backlog migliorie",
];

function ProjectManagerPage() {
  const navigate = useNavigate();
  const { projectId: searchProjectId } = Route.useSearch();
  const { hasAccess, activate } = useActivateTeam();
  const qc = useQueryClient();

  // Resolve active project: search param > localStorage > most recent
  const { data: projects } = useQuery({
    queryKey: ["pm-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, idea_description, status, product_type, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [activeId, setActiveId] = useState<string | null>(searchProjectId ?? null);
  useEffect(() => {
    if (activeId) return;
    if (searchProjectId) {
      setActiveId(searchProjectId);
      return;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("active_project_id");
      if (stored) {
        setActiveId(stored);
        return;
      }
    }
    if (projects && projects.length > 0) setActiveId(projects[0].id);
  }, [searchProjectId, projects, activeId]);

  const activeProject = projects?.find((p) => p.id === activeId) ?? null;

  const { pct, next: nextStep } = syntheticProgress();
  const currentStep = SYNTHETIC_STEPS.find((s) => s.status === "in_progress") ?? SYNTHETIC_STEPS[0];

  const introContent = activeProject
    ? `Ciao, sono il tuo AI Project Manager.\n\nAbbiamo già impostato il progetto: ${activeProject.title}.\n\nIn questo momento siamo allo step: ${currentStep.title} — ${currentStep.description}\n\nIl prossimo passo consigliato è: ${nextStep?.title ?? "definire la prima versione"}.\n\nVuoi che andiamo avanti con questo step oppure preferisci prima migliorare l'idea o controllare se manca qualcosa?`
    : "Ciao, sono il tuo AI Project Manager. Seleziona un progetto attivo per partire dallo step giusto.";

  const INTRO = { role: "assistant" as const, id: "intro", content: introContent };

  const fetchHistory = useServerFn(getPmHistory);
  const send = useServerFn(sendPmMessage);
  const fetchLogs = useServerFn(getPmLogs);
  const genOpPrompt = useServerFn(generateOperationalPrompt);
  const listOpPrompts = useServerFn(listOperationalPrompts);
  const markCopied = useServerFn(markOperationalPromptCopied);

  const { data: history } = useQuery({
    queryKey: ["pm-history", activeId],
    enabled: !!hasAccess && !!activeId,
    queryFn: () => fetchHistory({ data: { projectId: activeId } }),
  });

  const { data: logs } = useQuery({
    queryKey: ["pm-logs", activeId],
    enabled: !!hasAccess && !!activeId,
    queryFn: () => fetchLogs({ data: { projectId: activeId, limit: 30 } }),
  });

  const { data: opPrompts } = useQuery({
    queryKey: ["pm-op-prompts", activeId],
    enabled: !!hasAccess && !!activeId,
    queryFn: () => listOpPrompts({ data: { projectId: activeId } }),
  });

  const opGenMutation = useMutation({
    mutationFn: (stepTitle: string) =>
      genOpPrompt({ data: { projectId: activeId, stepTitle } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-op-prompts", activeId] });
      qc.invalidateQueries({ queryKey: ["pm-logs", activeId] });
    },
  });

  const copyMutation = useMutation({
    mutationFn: (id: string) => markCopied({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-op-prompts", activeId] }),
  });

  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) => send({ data: { projectId: activeId, message } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-history", activeId] });
      qc.invalidateQueries({ queryKey: ["pm-logs", activeId] });
      setInput("");
      requestAnimationFrame(() => inputRef.current?.focus());
    },
  });

  function sendQuick(text: string) {
    if (mutation.isPending) return;
    if (text === "Genera prompt operativo") {
      if (!activeProject || opGenMutation.isPending) return;
      opGenMutation.mutate(currentStep.title);
      return;
    }
    mutation.mutate(text);
  }

  function continueAppCreation() {
    if (mutation.isPending) return;
    if (!activeProject) {
      alert("Prima di continuare devi definire il progetto.");
      return;
    }
    const step = nextStep?.title ?? currentStep.title;
    const command = `Proseguiamo con la creazione dell'app. Il progetto è già stato definito. Avvia ora lo step previsto dalla roadmap: ${step}. Lavora solo su questo step, secondo la roadmap attiva (bloccata). Analizza punti di forza, criticità, rischi principali, aspetti da semplificare, cosa tenere nella prima versione e cosa rimandare al Backlog migliorie future. Proponi l'avanzamento allo step successivo solo dopo aver completato questo.`;
    mutation.mutate(command);
  }

  const messages = [INTRO, ...(history?.messages ?? [])];

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages.length, mutation.isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId, hasAccess]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || mutation.isPending) return;
    mutation.mutate(text);
  }

  // GATE: not paying
  if (!hasAccess) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mx-auto inline-flex items-center justify-center size-16 rounded-full border border-border/60 bg-background/40 mb-6">
          <Lock className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          Project Manager non ancora attivo
        </h1>
        <p className="text-muted-foreground mt-4">
          Per parlare con il tuo AI Project Manager devi prima attivare il Team AI.
        </p>
        <div className="mt-8">
          <Button variant="hero" size="lg" onClick={() => activate("project_manager_gate", activeId ?? undefined)}>
            <Lock className="size-4" /> Attiva il mio Team AI - 29€
          </Button>
        </div>
      </main>
    );
  }

  // No project at all
  if (projects && projects.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mx-auto inline-flex items-center justify-center size-16 rounded-full border border-border/60 bg-background/40 mb-6">
          <Bot className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          Seleziona un progetto su cui vuoi far lavorare il Project Manager
        </h1>
        <p className="text-muted-foreground mt-4">
          Crea il tuo primo progetto per iniziare a dare direttive al tuo Project Manager AI.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button variant="hero" size="lg" onClick={() => navigate({ to: "/dashboard" })}>
            Vai alla Dashboard <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
          <Bot className="size-3 text-primary" /> AI Project Manager
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold mt-4">
          Parla con il tuo <span className="gradient-text">AI Project Manager</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Lui conosce il tuo progetto, segue la roadmap e coordina gli agenti per farti avanzare uno step alla volta.
        </p>
      </div>

      {/* PROJECT STATUS CARD */}
      {activeProject && (
        <div className="mb-6 glass-card rounded-2xl p-5 border border-border/60">
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Progetto</div>
              <div className="font-display font-semibold mt-1 truncate">{activeProject.title}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stato</div>
              <div className="font-medium mt-1 truncate">{currentStep.title}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avanzamento</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full gradient-bg" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-semibold gradient-text">{pct}%</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Prossimo output</div>
              <div className="font-medium mt-1 truncate">{nextStep?.title ?? "—"}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* CHAT */}
        <section className="order-2 lg:order-1 flex flex-col glass-card rounded-2xl border border-border/60 overflow-hidden">
          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-4 max-h-[60vh] min-h-[360px]"
          >
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role === "user" ? "user" : "assistant"}
                content={m.content}
              />
            ))}
            {/* Quick actions under the intro, before the user has sent anything */}
            {messages.length === 1 && !mutation.isPending && (
              <div className="flex flex-wrap gap-2 pl-11">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => sendQuick(a)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 text-foreground/90 transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
            {/* Follow-up actions after the latest assistant reply */}
            {messages.length > 1 &&
              messages[messages.length - 1].role === "assistant" &&
              !mutation.isPending && (
                <div className="flex flex-wrap gap-2 pl-11">
                  {FOLLOWUP_ACTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => sendQuick(a)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/60 hover:text-foreground text-muted-foreground transition-colors"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            {mutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                Sto coordinando il team…
              </div>
            )}
            {mutation.isError && (
              <p className="text-sm text-destructive">
                {(mutation.error as Error)?.message ?? "Errore. Riprova."}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border/40 p-3 sm:p-4 space-y-3 bg-background/40">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Scrivi una domanda o una direttiva al tuo Project Manager…"
              rows={2}
              className="w-full resize-none rounded-lg bg-secondary/40 border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
              disabled={mutation.isPending}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendQuick(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border/60 hover:border-primary/60 hover:text-foreground text-muted-foreground transition-colors"
                  disabled={mutation.isPending}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="hero" disabled={mutation.isPending || !input.trim()}>
                {mutation.isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> Invio…</>
                ) : (
                  <>Invia <Send className="size-4" /></>
                )}
              </Button>
            </div>
          </form>

          <div className="border-t border-border/40 p-3 sm:p-4 bg-background/20">
            <Button
              type="button"
              variant="hero"
              size="lg"
              className="w-full"
              onClick={continueAppCreation}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Sto preparando il prossimo step…</>
              ) : (
                <><ArrowRight className="size-4" /> Continuiamo con la creazione dell'app</>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Avanza al prossimo step della roadmap (bloccata): {nextStep?.title ?? currentStep.title}
            </p>
          </div>
        </section>

        {/* OPERATIONAL PROMPT PANEL — fuori dalla chat */}
        <section className="order-3 lg:col-span-2 glass-card rounded-2xl border border-border/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Wrench className="size-3.5 text-primary" /> Prompt operativo generato
              </div>
              <h2 className="font-display font-semibold text-xl mt-1">
                Prompt pronti da copiare nello strumento giusto
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Quando l'analisi di uno step è confermata, l'agente competente genera qui un prompt operativo separato dalla chat.
              </p>
            </div>
            <Button
              type="button"
              variant="hero"
              onClick={() => sendQuick("Genera prompt operativo")}
              disabled={opGenMutation.isPending || !activeProject}
            >
              {opGenMutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Sto generando…</>
              ) : (
                <><Sparkles className="size-4" /> Genera per: {currentStep.title}</>
              )}
            </Button>
          </div>

          {opGenMutation.isError && (
            <p className="text-sm text-destructive mt-3">
              {(opGenMutation.error as Error)?.message ?? "Errore nella generazione."}
            </p>
          )}

          <div className="mt-5 space-y-4">
            {(opPrompts?.prompts ?? []).length === 0 && !opGenMutation.isPending && (
              <div className="text-sm text-muted-foreground border border-dashed border-border/60 rounded-xl p-6 text-center">
                Nessun prompt operativo ancora generato. Clicca su "Genera per: {currentStep.title}" per crearne uno.
              </div>
            )}
            {(opPrompts?.prompts ?? []).map((p) => (
              <OperationalPromptCard
                key={p.id}
                prompt={p}
                onCopied={(id) => copyMutation.mutate(id)}
              />
            ))}
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="order-1 lg:order-2 space-y-4">
          {activeProject ? (
            <div className="glass-card rounded-2xl p-5 border border-border/60">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Progetto attivo</div>
              <h3 className="font-display font-semibold mt-1 line-clamp-2">{activeProject.title}</h3>
              {activeProject.idea_description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-4">
                  {activeProject.idea_description}
                </p>
              )}
              <div className="flex flex-col gap-2 mt-4">
                <Link to="/projects/$id" params={{ id: activeProject.id }}>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    Vai alla scheda progetto <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Cambia progetto <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
              {projects && projects.length > 1 && (
                <div className="mt-4">
                  <label className="text-xs text-muted-foreground">Cambia rapidamente</label>
                  <select
                    value={activeId ?? ""}
                    onChange={(e) => setActiveId(e.target.value)}
                    className="mt-1 w-full bg-secondary/40 border border-border/50 rounded-md px-2 py-1.5 text-sm"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : null}

          {/* MINI ROADMAP */}
          <div className="glass-card rounded-2xl p-5 border border-border/60">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Roadmap sintetica</h3>
              <span className="text-xs text-muted-foreground">{pct}%</span>
            </div>
            <ol className="mt-3 space-y-2">
              {SYNTHETIC_STEPS.map((s) => (
                <li key={s.n} className="flex items-start gap-2 text-xs">
                  <span className="mt-0.5 shrink-0">
                    {s.status === "done" ? (
                      <Check className="size-3.5 text-primary" />
                    ) : s.status === "in_progress" ? (
                      <Loader2 className="size-3.5 text-accent animate-spin" />
                    ) : (
                      <Circle className="size-3 text-muted-foreground" />
                    )}
                  </span>
                  <span
                    className={
                      s.status === "in_progress"
                        ? "text-foreground font-medium"
                        : s.status === "done"
                        ? "text-muted-foreground line-through"
                        : "text-muted-foreground"
                    }
                  >
                    {s.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-border/60">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="font-display font-semibold">Il team che coordino</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tu parli con me. Io assegno il lavoro a questi agenti.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
              {TEAM.map((t) => (
                <li
                  key={t}
                  className="px-2 py-1.5 rounded-md bg-secondary/40 border border-border/40 text-muted-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* STORICO PROJECT MANAGER */}
          <div className="glass-card rounded-2xl p-5 border border-border/60">
            <h3 className="font-display font-semibold">Storico Project Manager</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tutto ciò che il PM ha detto, generato e deciso. Salvato in automatico.
            </p>
            <ul className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
              {(logs?.logs ?? []).length === 0 && (
                <li className="text-xs text-muted-foreground">Nessuna attività registrata ancora.</li>
              )}
              {(logs?.logs ?? []).map((l) => (
                <li key={l.id} className="text-xs border border-border/40 rounded-md p-2 bg-secondary/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground/90 truncate">{l.action_type}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(l.created_at).toLocaleString()}
                    </span>
                  </div>
                  {l.step_title && (
                    <div className="text-[11px] text-muted-foreground mt-1 truncate">
                      Step: {l.step_title}
                    </div>
                  )}
                  {(l.user_message || l.project_manager_response || l.decision) && (
                    <p className="mt-1 line-clamp-3 text-foreground/80">
                      {l.decision || l.project_manager_response || l.user_message}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/30 px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary mb-1">
            <User className="size-3" /> Tu
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="size-8 rounded-full gradient-bg grid place-items-center shrink-0">
        <Bot className="size-4 text-primary-foreground" />
      </div>
      <div className="max-w-[85%]">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Project Manager
        </div>
        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{content}</p>
      </div>
    </div>
  );
}

type OperationalPrompt = {
  id: string;
  title: string;
  agent_name: string;
  recommended_tool: string;
  instructions: string;
  prompt_text: string;
  step_title: string;
  created_at: string;
  copied: boolean;
};

function OperationalPromptCard({
  prompt,
  onCopied,
}: {
  prompt: OperationalPrompt;
  onCopied: (id: string) => void;
}) {
  const [justCopied, setJustCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setJustCopied(true);
      onCopied(prompt.id);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      // ignore
    }
  }
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-semibold">{prompt.title}</h3>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>Generato da: <span className="text-foreground/90">{prompt.agent_name}</span></span>
            <span>Step: <span className="text-foreground/90">{prompt.step_title}</span></span>
            <span>Da usare su: <span className="text-foreground/90">{prompt.recommended_tool}</span></span>
          </div>
        </div>
        {prompt.copied && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
            Copiato
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-3">{prompt.instructions}</p>
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-relaxed bg-background/60 border border-border/50 rounded-lg p-3 text-foreground/90">
        {prompt.prompt_text}
      </pre>
      <div className="mt-3 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="size-3.5" /> {justCopied ? "Copiato!" : "Copia prompt"}
        </Button>
      </div>
    </div>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bot, Lock, Send, Loader2, ArrowRight, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useActivateTeam } from "@/hooks/use-activate-team";
import { getPmHistory, sendPmMessage } from "@/lib/project-manager.functions";

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

const SUGGESTIONS = [
  "Qual è il prossimo passo?",
  "Fammi migliorare questa idea",
  "Prepara il prompt per costruire la prima schermata",
  "Controlla se manca qualcosa",
  "Fammi lavorare sull'MVP",
  "Cosa devo fare adesso?",
];

const INTRO = {
  role: "assistant" as const,
  id: "intro",
  content:
    "Ciao, sono il tuo AI Project Manager. Dimmi cosa vuoi fare con questo progetto: posso aiutarti a chiarire il prossimo step, migliorare una funzione, preparare un prompt, controllare la roadmap o far lavorare gli altri agenti.",
};

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

  const fetchHistory = useServerFn(getPmHistory);
  const send = useServerFn(sendPmMessage);

  const { data: history } = useQuery({
    queryKey: ["pm-history", activeId],
    enabled: !!hasAccess && !!activeId,
    queryFn: () => fetchHistory({ data: { projectId: activeId } }),
  });

  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) => send({ data: { projectId: activeId, message } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-history", activeId] });
      setInput("");
      requestAnimationFrame(() => inputRef.current?.focus());
    },
  });

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
          Il tuo <span className="gradient-text">AI Project Manager</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Fagli una domanda, dagli una direttiva o chiedigli qual è il prossimo passo. Lui coordina il Team AI e ti restituisce una risposta operativa.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* CHAT */}
        <section className="order-2 lg:order-1 flex flex-col glass-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Concetto</div>
            <h2 className="font-display font-semibold mt-0.5">
              Parli con un solo agente. Lui coordina tutti gli altri.
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Scrivi cosa vuoi fare. Il tuo Project Manager AI analizza la richiesta, capisce quali agenti coinvolgere e ti propone il prossimo passo operativo.
            </p>
            <p className="text-xs text-primary mt-2">
              Tu dai la direttiva. Il Project Manager organizza il lavoro.
            </p>
          </div>

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
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
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
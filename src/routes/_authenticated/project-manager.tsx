import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bot, Lock, Send, Loader2, ArrowRight, Sparkles, User, Check, Circle, Copy, Wrench, ThumbsUp, ThumbsDown } from "lucide-react";
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
import { AgentAvatar } from "@/components/AgentAvatar";
import { ToolIcon } from "@/components/ToolIcon";
import { resolveAgentIdentity } from "@/lib/agent-identity";

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

const CORRECTION_LABELS = [
  "Voglio semplificare",
  "Voglio più dettaglio",
  "Voglio una versione più grafica",
  "Voglio ridurre le funzioni",
  "Voglio aggiungere un rischio",
  "Voglio cambiare priorità",
  "Voglio una versione più tecnica",
  "Voglio una versione più commerciale",
  "Voglio salvare questa idea nel backlog",
];

const VALIDATION_CORRECTION_LABELS = [
  "Manca dettaglio",
  "Troppo generico",
  "Voglio più rischi",
  "Voglio più punti di forza",
  "Voglio più criticità",
  "Voglio una versione più pratica",
  "Voglio una versione più tecnica",
  "Rigenera prompt correttivo",
];

// Soglia per riconoscere una risposta incollata da una AI esterna
// (es. ChatGPT, Lovable, Perplexity). Sopra questa lunghezza, e se per
// lo step corrente esiste già un prompt operativo generato, trattiamo il
// messaggio come "external_ai_response_pasted".
const EXTERNAL_AI_RESPONSE_MIN_CHARS = 400;

function ProjectManagerPage() {
  const navigate = useNavigate();
  const { projectId: searchProjectId } = Route.useSearch();
  const { hasAccess, activate } = useActivateTeam();
  const qc = useQueryClient();

  // Step completati persistenti per progetto (avanzamento della roadmap sintetica).
  // Non modifica la roadmap né la salta: marca solo gli step già chiusi.
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

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

  // Carica gli step completati dal localStorage quando cambia il progetto.
  useEffect(() => {
    if (typeof window === "undefined" || !activeId) return;
    try {
      const raw = localStorage.getItem(`pm_completed_steps:${activeId}`);
      setCompletedSteps(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setCompletedSteps([]);
    }
  }, [activeId]);

  // Calcola lo step corrente e l'avanzamento in base agli step completati
  // dall'utente, senza modificare la roadmap sintetica originale.
  const dynamicSteps = SYNTHETIC_STEPS.map((s) => {
    if (completedSteps.includes(s.title)) return { ...s, status: "done" as const };
    return s;
  });
  const firstOpenIdx = dynamicSteps.findIndex((s) => s.status !== "done");
  const currentStep =
    firstOpenIdx >= 0
      ? { ...dynamicSteps[firstOpenIdx], status: "in_progress" as const }
      : dynamicSteps[dynamicSteps.length - 1];
  const nextStep =
    firstOpenIdx >= 0
      ? dynamicSteps.slice(firstOpenIdx + 1).find((s) => s.status !== "done") ?? null
      : null;
  const doneCount = dynamicSteps.filter((s) => s.status === "done").length;
  const pct = Math.round((doneCount / dynamicSteps.length) * 100);

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
      requestAnimationFrame(() => {
        opPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
  });

  const copyMutation = useMutation({
    mutationFn: (id: string) => markCopied({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-op-prompts", activeId] }),
  });

  const [input, setInput] = useState("");
  // Flusso decisionale:
  // - 'idle': chat normale
  // - 'schema-review': PM ha mostrato lo schema dello step, mostra "Approvo e genera il prompt" / "Non approvo"
  // - 'corrections': l'utente ha rifiutato lo schema, mostra le label di correzione dello schema
  // - 'validation-review': l'utente ha incollato una risposta AI esterna, PM l'ha validata, mostra "Approvo il risultato e passa allo step successivo" / "Non approvo"
  // - 'validation-corrections': l'utente ha rifiutato la validazione, mostra le label di correzione del risultato AI esterno
  const [reviewMode, setReviewMode] = useState<
    "idle" | "schema-review" | "corrections" | "validation-review" | "validation-corrections"
  >("idle");
  // Flag: la prossima risposta del PM è una validazione di una risposta AI esterna.
  const [pendingValidation, setPendingValidation] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const opPanelRef = useRef<HTMLElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) => send({ data: { projectId: activeId, message } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-history", activeId] });
      qc.invalidateQueries({ queryKey: ["pm-logs", activeId] });
      setInput("");
      if (pendingValidation) {
        setReviewMode("validation-review");
        setPendingValidation(false);
      }
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
    setReviewMode("idle");
    mutation.mutate(text);
  }

  function continueAppCreation() {
    if (mutation.isPending) return;
    if (!activeProject) {
      alert("Prima di continuare devi definire il progetto.");
      return;
    }
    const step = currentStep.title;
    const command = `Proseguiamo con la creazione dell'app. Lavora SOLO sullo step corrente della roadmap attiva (bloccata): "${step}".

Genera ORA uno SCHEMA/ANALISI di questo step, NON un prompt operativo.

Struttura la risposta esattamente così:

Step corrente: ${step}

Questo è lo schema che ti propongo per questo passaggio della roadmap.

Poi elenca in modo chiaro:
- analisi dello step (punti chiave specifici per "${step}")
- decisioni consigliate
- elementi da tenere nella prima versione
- elementi da rimandare al Backlog migliorie future
- consiglio operativo per proseguire

Concludi con: "Ti consiglio di approvare questo step e proseguire con la generazione del prompt operativo."

REGOLE:
- Non modificare la roadmap.
- Non saltare step.
- Non generare ancora il prompt operativo completo: solo lo schema.
- Le migliorie extra vanno nel Backlog migliorie future.`;
    setReviewMode("schema-review");
    mutation.mutate(command);
  }

  function approveSchema() {
    if (mutation.isPending || opGenMutation.isPending) return;
    if (!activeProject) return;
    setReviewMode("idle");
    if (typeof window !== "undefined") {
      localStorage.setItem(`pm_step_approved:${activeProject.id}:${currentStep.title}`, "1");
    }
    // Flusso unificato: approva lo schema E genera subito il prompt operativo.
    opGenMutation.mutate(currentStep.title);
  }

  function rejectSchema() {
    setReviewMode("corrections");
  }

  function applyCorrection(label: string) {
    if (mutation.isPending) return;
    setReviewMode("schema-review");
    mutation.mutate(
      `Non approvo ancora lo schema dello step "${currentStep.title}". Rigeneralo applicando questa correzione: "${label}". Mantieni la stessa struttura (analisi, decisioni, da tenere, da rimandare, consiglio operativo). Non modificare la roadmap, non saltare step. Non generare ancora il prompt operativo.`,
    );
  }

  // L'utente approva il risultato dell'AI esterna: chiudi lo step corrente,
  // aggiorna avanzamento, fai partire lo schema dello step successivo.
  function approveExternalResult() {
    if (mutation.isPending || !activeProject) return;
    const closed = currentStep.title;
    const next = nextStep?.title ?? null;
    const newCompleted = completedSteps.includes(closed)
      ? completedSteps
      : [...completedSteps, closed];
    setCompletedSteps(newCompleted);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `pm_completed_steps:${activeProject.id}`,
        JSON.stringify(newCompleted),
      );
    }
    setReviewMode("schema-review");
    if (!next) {
      mutation.mutate(
        `Ho approvato il risultato dell'AI esterna per lo step "${closed}". Segna lo step come completato. La roadmap è terminata: fammi un riepilogo finale del percorso.`,
      );
      return;
    }
    const command = `Ho approvato il risultato dell'AI esterna per lo step "${closed}". Segnalo come completato e passa ORA allo step successivo della roadmap: "${next}".

Genera lo SCHEMA/ANALISI di questo nuovo step (NON il prompt operativo), strutturato così:

Step corrente: ${next}

Questo è lo schema che ti propongo per questo passaggio della roadmap.

Poi elenca:
- analisi dello step (punti chiave specifici per "${next}")
- decisioni consigliate
- elementi da tenere nella prima versione
- elementi da rimandare al Backlog migliorie future
- consiglio operativo per proseguire

Concludi con: "Ti consiglio di approvare questo step e proseguire con la generazione del prompt operativo."

REGOLE:
- Non modificare la roadmap.
- Non saltare step.
- Non generare ancora il prompt operativo.
- Non rigenerare il prompt dello step appena chiuso ("${closed}").`;
    mutation.mutate(command);
  }

  function rejectExternalResult() {
    setReviewMode("validation-corrections");
  }

  function applyValidationCorrection(label: string) {
    if (mutation.isPending) return;
    setReviewMode("idle");
    mutation.mutate(
      `Non approvo ancora il risultato dell'AI esterna per lo step "${currentStep.title}". Correzione richiesta: "${label}". Analizza di nuovo la risposta incollata in precedenza e dimmi cosa manca o cosa va corretto, senza chiudere lo step e senza modificare la roadmap.`,
    );
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
    // Heuristica: testo lungo + esiste già un prompt operativo per lo step
    // corrente => l'utente sta incollando una risposta di una AI esterna.
    const hasOpPromptForStep = (opPrompts?.prompts ?? []).some(
      (p) => p.step_title === currentStep.title,
    );
    const looksLikeExternalAi =
      text.length >= EXTERNAL_AI_RESPONSE_MIN_CHARS && hasOpPromptForStep;
    if (looksLikeExternalAi) {
      setPendingValidation(true);
      setReviewMode("idle");
      const wrapped = `[external_ai_response_pasted]
Ho incollato qui sotto la risposta generata da una AI esterna usando il prompt operativo dello step "${currentStep.title}".

Valida questa risposta come Project Manager: dimmi se è coerente con il progetto e con lo step corrente, se contiene informazioni sufficienti, se ci sono criticità o parti da correggere, e se possiamo chiudere lo step. Concludi con una sintesi breve e una raccomandazione chiara (chiudere lo step e passare a "${nextStep?.title ?? "(fine roadmap)"}", oppure correggere).

Non rigenerare un nuovo prompt operativo per lo stesso step. Non modificare la roadmap.

RISPOSTA AI ESTERNA DA VALIDARE:
${text}`;
      mutation.mutate(wrapped);
      return;
    }
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
          <div className="mt-5 pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Avanza lungo la roadmap (bloccata). Lo step corrente è{" "}
              <span className="text-foreground/90 font-medium">{currentStep.title}</span>.
            </p>
            <Button
              type="button"
              variant="hero"
              size="lg"
              onClick={continueAppCreation}
              disabled={mutation.isPending}
              className="w-full sm:w-auto"
            >
              {mutation.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Preparo lo schema…</>
              ) : (
                <><ArrowRight className="size-4" /> Continuiamo con la creazione dell'app</>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* MAIN COLUMN: chat + operational prompt panel, stacked tight */}
        <div className="order-2 lg:order-1 space-y-4 min-w-0">
        {currentStep.title === "Punti di forza e criticità" && (
          <div className="glass-card rounded-2xl border border-primary/40 bg-primary/5 p-4 sm:p-5">
            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
              A cosa serve questo step
            </div>
            <h2 className="font-display font-semibold mt-1">Punti di forza e criticità</h2>
            <p className="text-sm text-foreground/90 mt-2 leading-relaxed">
              Questo passaggio serve per capire meglio come sviluppare l'app nel
              modo corretto. Analizzare punti di forza e criticità permette di
              individuare cosa valorizzare, cosa semplificare, quali rischi
              evitare e quali aspetti devono essere chiariti prima di passare
              alla costruzione vera e propria. Non è una fase teorica: serve a
              prendere decisioni migliori sullo sviluppo dell'app.
            </p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Ti consiglio di approvare questo passaggio solo quando i punti di
              forza e le criticità ti sembrano chiari. Questo ci aiuterà a
              costruire l'app in modo più ordinato, evitando funzioni inutili,
              errori di priorità o problemi che potrebbero rallentare lo
              sviluppo.
            </p>
          </div>
        )}
        <section className="flex flex-col glass-card rounded-2xl border border-border/60 overflow-hidden">
          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 max-h-[48vh] min-h-[260px]"
          >
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role === "user" ? "user" : "assistant"}
                content={m.content}
              />
            ))}
            {/* Follow-up actions after the latest assistant reply */}
            {messages.length > 1 &&
              messages[messages.length - 1].role === "assistant" &&
              !mutation.isPending && (
                <div className="space-y-2 pl-11">
                  {reviewMode === "corrections" ? (
                    <>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Scegli una correzione per rigenerare lo schema
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CORRECTION_LABELS.map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => applyCorrection(l)}
                            className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/60 hover:text-foreground text-muted-foreground transition-colors"
                          >
                            {l}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setReviewMode("schema-review")}
                          className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/60 hover:text-foreground text-muted-foreground transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    </>
                  ) : reviewMode === "validation-corrections" ? (
                    <>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Cosa va corretto nel risultato dell'AI esterna?
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {VALIDATION_CORRECTION_LABELS.map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => applyValidationCorrection(l)}
                            className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/60 hover:text-foreground text-muted-foreground transition-colors"
                          >
                            {l}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setReviewMode("validation-review")}
                          className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/60 hover:text-foreground text-muted-foreground transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    </>
                  ) : reviewMode === "validation-review" ? (
                    <>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Il Project Manager ha validato la risposta dell'AI esterna
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={approveExternalResult}
                          disabled={mutation.isPending}
                          className="text-xs px-3 py-2 rounded-lg border border-primary/50 bg-primary/10 hover:bg-primary/20 text-foreground inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <ThumbsUp className="size-3.5" /> Approvo il risultato e passa allo step successivo
                        </button>
                        <button
                          type="button"
                          onClick={rejectExternalResult}
                          className="text-xs px-3 py-2 rounded-lg border border-border/60 hover:border-destructive/60 hover:text-foreground text-muted-foreground inline-flex items-center justify-center gap-1.5"
                        >
                          <ThumbsDown className="size-3.5" /> Non approvo / correggiamo questo risultato
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Cosa vuoi fare con questa risposta?
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={approveSchema}
                          disabled={opGenMutation.isPending}
                          className="text-xs px-3 py-2 rounded-lg border border-primary/50 bg-primary/10 hover:bg-primary/20 text-foreground inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {opGenMutation.isPending ? (
                            <><Loader2 className="size-3.5 animate-spin" /> Sto generando il prompt…</>
                          ) : (
                            <><ThumbsUp className="size-3.5" /> Approvo e genera il prompt</>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={rejectSchema}
                          className="text-xs px-3 py-2 rounded-lg border border-border/60 hover:border-destructive/60 hover:text-foreground text-muted-foreground inline-flex items-center justify-center gap-1.5"
                        >
                          <ThumbsDown className="size-3.5" /> Non approvo / voglio modificare
                        </button>
                      </div>
                    </>
                  )}
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
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-[11px] tabular-nums ${
                  input.length > 100000 ? "text-destructive" : "text-muted-foreground/70"
                }`}
              >
                Caratteri: {input.length.toLocaleString("it-IT")} / 100.000
              </span>
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

        {/* OPERATIONAL PROMPT PANEL — sotto la chat, stessa colonna */}
        <section ref={opPanelRef} className="glass-card rounded-2xl border border-border/60 p-5 scroll-mt-24">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Wrench className="size-3.5 text-primary" /> Prompt operativo generato
              </div>
              <h2 className="font-display font-semibold text-lg mt-1">
                Prompt pronto da copiare nello strumento giusto
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
                <><Loader2 className="size-4 animate-spin" /> Sto generando il prompt operativo…</>
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

          <div className="mt-4 space-y-4">
            {(opPrompts?.prompts ?? []).length === 0 && !opGenMutation.isPending && (
              <div className="text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg p-3 text-center">
                Nessun prompt operativo generato. Clicca su "Genera il prompt operativo da copiare" per creare il prompt dello step corrente.
              </div>
            )}
            {opGenMutation.isPending && (opPrompts?.prompts ?? []).length === 0 && (
              <div className="text-xs text-muted-foreground border border-dashed border-primary/40 rounded-lg p-3 text-center inline-flex items-center justify-center gap-2 w-full">
                <Loader2 className="size-3.5 animate-spin text-primary" /> Sto generando il prompt operativo…
              </div>
            )}
            {(() => {
              // Mostra UN SOLO prompt: il più recente per lo step corrente del progetto attivo.
              // Lo storico completo resta nel pannello "Storico Project Manager".
              const all = opPrompts?.prompts ?? [];
              const latest =
                all.find((p) => p.step_title === currentStep.title) ?? all[0];
              if (!latest) return null;
              return (
                <OperationalPromptCard
                  prompt={latest}
                  onCopied={(id) => copyMutation.mutate(id)}
                />
              );
            })()}
          </div>
        </section>
        </div>

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
  const agent = resolveAgentIdentity(prompt.agent_name);
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display font-semibold min-w-0">{prompt.title}</h3>
        {prompt.copied && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
            Copiato
          </span>
        )}
      </div>

      {/* Header visivo: agente generatore + strumento consigliato */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
          <AgentAvatar agent={agent} size="sm" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Agente che ha generato il prompt
            </div>
            <div className="font-display font-semibold text-sm truncate">
              {prompt.agent_name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 p-3">
          <ToolIcon name={prompt.recommended_tool} size={36} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Da usare su
            </div>
            <div className="font-display font-semibold text-sm truncate">
              {prompt.recommended_tool}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        Step: <span className="text-foreground/90">{prompt.step_title}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">{prompt.instructions}</p>
      <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
        <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
          Cosa fare dopo
        </div>
        <p className="text-xs text-foreground/90 mt-1 leading-relaxed">
          Dopo aver copiato questo prompt e averlo incollato in{" "}
          <span className="font-medium">{prompt.recommended_tool}</span>, copia la
          risposta generata da quella AI e incollala qui nella chat del Project
          Manager. In questo modo il Project Manager potrà validare il risultato,
          capire se è coerente con la roadmap e decidere se possiamo proseguire
          allo step successivo oppure se serve correggere qualcosa.
        </p>
      </div>
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
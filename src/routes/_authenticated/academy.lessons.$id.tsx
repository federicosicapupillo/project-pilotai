import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Target, Bot, Wrench, ClipboardCopy, ListChecks,
  PlayCircle, CheckCircle2, FileText, Sparkles, Loader2, RefreshCw, AlertCircle, Circle, ShieldCheck, XCircle,
} from "lucide-react";
import { ToolBadge } from "@/components/ToolBadge";
import { ActiveProjectBox } from "@/components/ActiveProjectBox";
import { useActiveProject, personalizePrompt } from "@/hooks/use-active-project";

export const Route = createFileRoute("/_authenticated/academy/lessons/$id")({
  head: () => ({ meta: [{ title: "Lezione — Academy" }] }),
  component: LessonPage,
});

// ---- Workbook save-check (modules 1–4) -------------------------------------
// For each (module_order, lesson_order) we declare which Workbook fields the
// user must have filled before the lesson can be marked completed.
type WBField =
  | "idea" | "target" | "problem" | "solution" | "mvp"
  | "decisions" | "next_steps" | "bugs_found" | "agents_used";

type FieldCheckStatus = "ok" | "missing" | "invalid";
type FieldCheckResult = { status: FieldCheckStatus; reason?: string };
type WBRequirement = {
  field: WBField;
  label: string;
  hint: string;
  validate?: (v: unknown) => FieldCheckResult;
};

// ---- Validators -------------------------------------------------------------
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const lineCount = (s: string) =>
  s.split(/\n|•|—|;|\u2022/).map((l) => l.trim()).filter((l) => l.length > 2).length;

const filledText = (min = 10) => (v: unknown): FieldCheckResult => {
  if (typeof v !== "string" || !v.trim()) return { status: "missing" };
  if (v.trim().length < min) return { status: "invalid", reason: `Troppo breve (min ~${min} caratteri).` };
  return { status: "ok" };
};

const filledArray = (min = 1) => (v: unknown): FieldCheckResult => {
  const arr = Array.isArray(v) ? v.filter((x) => (typeof x === "string" ? x.trim() : x)) : [];
  if (arr.length === 0) return { status: "missing" };
  if (arr.length < min) return { status: "invalid", reason: `Servono almeno ${min} voci (ora ${arr.length}).` };
  return { status: "ok" };
};

const filledObjectOrArray = (v: unknown): FieldCheckResult => {
  if (Array.isArray(v) && v.length > 0) return { status: "ok" };
  if (v && typeof v === "object" && Object.keys(v as object).length > 0) return { status: "ok" };
  if (typeof v === "string" && v.trim().length >= 10) return { status: "ok" };
  return { status: "missing" };
};

const ideaSentence = (v: unknown): FieldCheckResult => {
  if (typeof v !== "string" || !v.trim()) return { status: "missing" };
  const w = wordCount(v);
  if (w > 20) return { status: "invalid", reason: `Frase troppo lunga: ${w} parole (max 20).` };
  if (w < 5) return { status: "invalid", reason: `Frase troppo corta: ${w} parole.` };
  return { status: "ok" };
};

const mvpMaxFunctions = (max: number) => (v: unknown): FieldCheckResult => {
  if (Array.isArray(v)) {
    const n = v.filter(Boolean).length;
    if (n === 0) return { status: "missing" };
    if (n > max) return { status: "invalid", reason: `${n} funzioni elencate, max ${max}.` };
    return { status: "ok" };
  }
  if (typeof v !== "string" || !v.trim()) return { status: "missing" };
  const n = lineCount(v);
  if (n === 0) return { status: "missing" };
  if (n > max) return { status: "invalid", reason: `${n} funzioni rilevate, max ${max}.` };
  return { status: "ok" };
};

const minLines = (min: number, max?: number) => (v: unknown): FieldCheckResult => {
  const n = Array.isArray(v) ? v.filter(Boolean).length
    : typeof v === "string" ? lineCount(v) : 0;
  if (n === 0) return { status: "missing" };
  if (n < min) return { status: "invalid", reason: `Servono almeno ${min} voci (ora ${n}).` };
  if (max && n > max) return { status: "invalid", reason: `Massimo ${max} voci (ora ${n}). Tagliane.` };
  return { status: "ok" };
};

// ---- Mapping ----------------------------------------------------------------
const REQUIRED_BY_LESSON: Record<string, WBRequirement[]> = {
  "1-1": [{ field: "decisions", label: "Ruolo di regista + cosa deleghi", hint: "Sezione Decisioni", validate: filledObjectOrArray }],
  "1-2": [{ field: "mvp", label: "Classificazione funzioni costruibili/no", hint: "Sezione Prima versione dell'app (MVP)", validate: filledText(40) }],
  "1-3": [{ field: "next_steps", label: "Le 5 fasi del prodotto", hint: "Sezione Roadmap", validate: minLines(5) }],
  "1-4": [{ field: "decisions", label: "Le tue 5 regole personali", hint: "Sezione Decisioni / Note operative", validate: minLines(5) }],

  "2-1": [{ field: "idea", label: "Idea in una frase (≤20 parole)", hint: "Sezione Idea", validate: ideaSentence }],
  "2-2": [{ field: "target", label: "Target principale + nicchia", hint: "Sezione Target", validate: filledText(20) }],
  "2-3": [
    { field: "problem", label: "Problema concreto", hint: "Sezione Problema", validate: filledText(20) },
    { field: "solution", label: "Soluzione proposta (max 3 punti)", hint: "Sezione Soluzione", validate: filledText(20) },
  ],
  "2-4": [{ field: "mvp", label: "Prima versione semplificata (≤3 funzioni)", hint: "Sezione Prima versione dell'app (MVP)", validate: mvpMaxFunctions(3) }],

  "3-1": [{ field: "decisions", label: "Mappa competitor (≥3 voci)", hint: "Sezione Decisioni / Competitor", validate: minLines(3) }],
  "3-2": [{ field: "decisions", label: "Prove di domanda (≥3)", hint: "Sezione Decisioni / Validazione", validate: minLines(3) }],
  "3-3": [{ field: "bugs_found", label: "Rischi e assunzioni (≥5)", hint: "Sezione Rischi", validate: minLines(5) }],
  "3-4": [{ field: "target", label: "Nicchia iniziale scelta", hint: "Sezione Target", validate: filledText(20) }],

  "4-1": [{ field: "mvp", label: "Definizione della prima versione dell'app (ipotesi + comportamento)", hint: "Sezione Prima versione dell'app (MVP)", validate: filledText(40) }],
  "4-2": [{ field: "mvp", label: "Funzioni essenziali (≤5)", hint: "Sezione Prima versione dell'app (MVP)", validate: mvpMaxFunctions(5) }],
  "4-3": [{ field: "decisions", label: "Lista NOT NOW (≥10 voci)", hint: "Sezione Decisioni / Fuori scope", validate: minLines(10) }],
  "4-4": [{ field: "next_steps", label: "Roadmap di 5–7 step", hint: "Sezione Roadmap", validate: minLines(5, 7) }],
};

function checkRequirement(wb: Record<string, unknown> | null | undefined, req: WBRequirement): FieldCheckResult {
  if (!wb) return { status: "missing" };
  const v = wb[req.field];
  if (req.validate) return req.validate(v);
  return filledObjectOrArray(v);
}
// ---------------------------------------------------------------------------

type SyncArgs = {
  userId: string;
  completedLesson: { id: string; title: string; module_id: string; order_index: number; recommended_agent: string | null };
  currentModule: { id: string; title: string; order_index: number } | null;
  siblings: { id: string; order_index: number; title: string }[];
};

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

async function syncWorkbooksOnCompletion({ userId, completedLesson, currentModule, siblings }: SyncArgs) {
  // Find next lesson: prefer in-module, fallback to next module's first lesson
  const idx = siblings.findIndex((s) => s.id === completedLesson.id);
  let nextTitle: string | null = null;
  let nextModuleTitle: string | null = null;
  if (idx >= 0 && idx < siblings.length - 1) {
    nextTitle = siblings[idx + 1].title;
    nextModuleTitle = currentModule?.title ?? null;
  } else if (currentModule) {
    const { data: nextMod } = await supabase
      .from("course_modules").select("id, title, order_index")
      .gt("order_index", currentModule.order_index).order("order_index").limit(1).maybeSingle();
    if (nextMod) {
      const { data: firstLesson } = await supabase
        .from("course_lessons").select("title").eq("module_id", nextMod.id)
        .order("order_index").limit(1).maybeSingle();
      if (firstLesson) { nextTitle = firstLesson.title; nextModuleTitle = nextMod.title; }
    }
  }

  const completedLabel = `✓ ${completedLesson.title}`;
  const nextLabel = nextTitle ? `→ ${nextTitle}${nextModuleTitle ? ` (${nextModuleTitle})` : ""}` : null;

  const { data: projects } = await supabase
    .from("projects").select("id").eq("user_id", userId);
  if (!projects?.length) return;

  await Promise.all(projects.map(async (p) => {
    const { data: wb } = await supabase
      .from("project_workbook").select("*").eq("project_id", p.id).maybeSingle();

    const prevNext = Array.isArray(wb?.next_steps) ? (wb!.next_steps as string[]) : [];
    const prevAgents = Array.isArray(wb?.agents_used) ? (wb!.agents_used as string[]) : [];
    const prevPrompts = Array.isArray(wb?.prompts_used) ? (wb!.prompts_used as string[]) : [];

    // Remove any prior entry that referenced the now-completed lesson
    const cleaned = prevNext.filter((s) =>
      !s.includes(completedLesson.title) || s.startsWith("✓")
    );
    const withCompleted = uniq([completedLabel, ...cleaned]);
    const finalNext = nextLabel ? uniq([nextLabel, ...withCompleted.filter((s) => s !== nextLabel)]) : withCompleted;

    const finalAgents = completedLesson.recommended_agent
      ? uniq([...prevAgents, completedLesson.recommended_agent])
      : prevAgents;

    const payload = {
      user_id: userId,
      project_id: p.id,
      next_steps: finalNext,
      agents_used: finalAgents,
      prompts_used: prevPrompts,
    };
    await supabase.from("project_workbook").upsert(payload, { onConflict: "project_id" });
  }));
}

function LessonPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { active } = useActiveProject();
  const [notes, setNotes] = useState("");
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [syncStage, setSyncStage] = useState<"idle" | "saving" | "syncing" | "synced" | "error">("idle");
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const { data: lesson, error } = await supabase.from("course_lessons").select("*").eq("id", id).single();
      if (error) throw error;
      const { data: mod } = await supabase.from("course_modules").select("*").eq("id", lesson.module_id).single();
      const { data: siblings } = await supabase.from("course_lessons").select("id, order_index, title").eq("module_id", lesson.module_id).order("order_index");
      const { data: progress } = await supabase.from("user_lesson_progress").select("*").eq("lesson_id", id).maybeSingle();
      return { lesson, mod, siblings: siblings ?? [], progress };
    },
  });

  // Live Workbook for the active project — used to verify required fields are saved before completion.
  const { data: workbook } = useQuery({
    queryKey: ["workbook-check", active?.id],
    enabled: !!active?.id,
    queryFn: async () => {
      const { data: wb } = await supabase
        .from("project_workbook").select("*").eq("project_id", active!.id).maybeSingle();
      return wb as Record<string, unknown> | null;
    },
  });

  useEffect(() => {
    if (data?.progress?.notes) setNotes(data.progress.notes);
  }, [data?.progress?.notes]);

  const saveMutation = useMutation({
    mutationFn: async (status: "in_progress" | "completed") => {
      if (!user) throw new Error("Non autenticato");
      setSyncStage("saving");
      const payload = {
        user_id: user.id,
        lesson_id: id,
        status,
        notes,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      };
      const { error } = await supabase.from("user_lesson_progress").upsert(payload, { onConflict: "user_id,lesson_id" });
      if (error) throw error;
      if (status === "completed" && data?.lesson) {
        setSyncStage("syncing");
        await syncWorkbooksOnCompletion({
          userId: user.id,
          completedLesson: data.lesson,
          currentModule: data.mod,
          siblings: data.siblings,
        });
      }
    },
    onSuccess: (_, status) => {
      toast.success(status === "completed" ? "Lezione completata!" : "Note salvate");
      setSyncStage("synced");
      setSyncedAt(new Date().toISOString());
      qc.invalidateQueries({ queryKey: ["lesson", id] });
      qc.invalidateQueries({ queryKey: ["academy-overview"] });
      qc.invalidateQueries({ queryKey: ["module"] });
      qc.invalidateQueries({ queryKey: ["my-path"] });
      qc.invalidateQueries({ queryKey: ["workbook"] });
    },
    onError: (e: Error) => { setSyncStage("error"); toast.error(e.message); },
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-6 py-10 text-muted-foreground">Caricamento…</div>;
  if (!data?.lesson) return <div className="max-w-4xl mx-auto px-6 py-10">Lezione non trovata.</div>;

  const { lesson, mod, siblings } = data;
  const checklist: string[] = (lesson.checklist_items as string[] | null) ?? [];
  const tools: string[] = (lesson.recommended_tools as string[] | null) ?? [];
  const idx = siblings.findIndex((s) => s.id === id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const isCompleted = data.progress?.status === "completed";
  const isInProgress = data.progress?.status === "in_progress";

  // ---- Workbook save-check (modules 1–4) ---------------------------------
  const key = mod ? `${mod.order_index}-${lesson.order_index}` : "";
  const requirements = REQUIRED_BY_LESSON[key] ?? [];
  const requirementsActive = requirements.length > 0;
  const fieldStatus = requirements.map((r) => {
    const result = checkRequirement(workbook, r);
    return { ...r, ...result };
  });
  const allFieldsOk = fieldStatus.every((f) => f.status === "ok");
  const missingCount = fieldStatus.filter((f) => f.status === "missing").length;
  const invalidCount = fieldStatus.filter((f) => f.status === "invalid").length;
  const completionBlocked = requirementsActive && (!active || !allFieldsOk) && !isCompleted;
  // -----------------------------------------------------------------------

  // Effective sync state: prefer live mutation stage, otherwise derive from DB progress
  const effectiveStage: "not_started" | "saving" | "syncing" | "in_progress" | "synced" | "error" =
    syncStage === "saving" || syncStage === "syncing" || syncStage === "error"
      ? syncStage
      : isCompleted
        ? "synced"
        : isInProgress
          ? "in_progress"
          : "not_started";

  const lastSyncDate = syncedAt ?? data.progress?.completed_at ?? data.progress?.updated_at ?? null;
  const stageMeta: Record<typeof effectiveStage, { label: string; cls: string; Icon: typeof CheckCircle2; spin?: boolean }> = {
    not_started: { label: "Non iniziata", cls: "bg-secondary/60 text-muted-foreground border-border/60", Icon: Circle },
    in_progress: { label: "In corso — non sincronizzata", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", Icon: RefreshCw },
    saving: { label: "Invio in corso…", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30", Icon: Loader2, spin: true },
    syncing: { label: "Sincronizzo con il Workbook…", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30", Icon: Loader2, spin: true },
    synced: { label: "Sincronizzata con il Workbook", cls: "bg-primary/15 text-primary border-primary/30", Icon: CheckCircle2 },
    error: { label: "Errore di sincronizzazione", cls: "bg-red-500/15 text-red-300 border-red-500/30", Icon: AlertCircle },
  };
  const stage = stageMeta[effectiveStage];
  const StageIcon = stage.Icon;

  const copyPrompt = async () => {
    if (!lesson.prompt_text) return;
    await navigator.clipboard.writeText(personalizePrompt(lesson.prompt_text, active));
    toast.success(active ? `Prompt copiato (personalizzato su "${active.title}")` : "Prompt copiato!");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        to="/academy/modules/$id"
        params={{ id: lesson.module_id }}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="size-4" /> {mod?.title}
      </Link>

      <div className="mb-6">
        <ActiveProjectBox />
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Lezione {lesson.order_index}</span>
          <h1 className="text-3xl font-display font-semibold mt-1">{lesson.title}</h1>
          <p className="text-muted-foreground mt-2">{lesson.description}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${stage.cls}`}>
            <StageIcon className={`size-3.5 ${stage.spin ? "animate-spin" : ""}`} /> {stage.label}
          </span>
          {lastSyncDate && (effectiveStage === "synced" || effectiveStage === "in_progress") && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ultimo agg.: {new Date(lastSyncDate).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          <PlayCircle className="size-3.5 text-primary" /> Video lezione
        </div>
        <div className="aspect-video rounded-lg bg-secondary/50 border border-border/50 grid place-items-center">
          <div className="text-center">
            <PlayCircle className="size-12 text-primary/60 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Video lezione (placeholder)</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
          <Target className="size-3.5 text-primary" /> Obiettivo
        </div>
        <p>{lesson.objective}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Bot className="size-3.5 text-primary" /> Agente da usare
          </div>
          <p className="font-display font-semibold">{lesson.recommended_agent ?? "—"}</p>
          <Link to="/agents" className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
            Vedi nella libreria <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Wrench className="size-3.5 text-primary" /> Tool da aprire
          </div>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => (
              <ToolBadge key={t} name={t} size="sm" prefix="Usa" />
            ))}
          </div>
          {lesson.recommended_agent && tools.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              <span className="text-foreground/80 font-medium">Perché questa combinazione:</span> {lesson.recommended_agent} ti guida nel ragionamento; i tool sopra sono dove eseguire concretamente il passo.
            </p>
          )}
        </div>
      </div>

      {lesson.prompt_text && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> Prompt pronto
            </div>
            <Button variant="ghost" size="sm" onClick={copyPrompt}>
              <ClipboardCopy className="size-4" /> Copia
            </Button>
          </div>
          <pre className="text-sm whitespace-pre-wrap bg-secondary/40 rounded-lg p-4 font-sans">
            {personalizePrompt(lesson.prompt_text, active)}
          </pre>
          <p className="text-[11px] text-muted-foreground mt-2">
            {active
              ? `Prompt personalizzato automaticamente sul tuo progetto "${active.title}".`
              : "Accedi e crea un progetto per ricevere il prompt già personalizzato sui tuoi dati."}
          </p>
        </div>
      )}

      {lesson.exercise_text && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <FileText className="size-3.5 text-primary" /> Esercizio pratico
          </div>
          <p>{lesson.exercise_text}</p>
        </div>
      )}

      {checklist.length > 0 && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
            <ListChecks className="size-3.5 text-primary" /> Checklist di completamento
          </div>
          <ul className="space-y-2">
            {checklist.map((c, i) => (
              <li key={i}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-primary cursor-pointer"
                    checked={!!checks[i]}
                    onChange={(e) => setChecks((p) => ({ ...p, [i]: e.target.checked }))}
                  />
                  <span className={checks[i] ? "line-through text-muted-foreground" : ""}>{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {requirementsActive && (
        <div className={`glass-card rounded-xl p-6 mb-6 border ${allFieldsOk ? "border-primary/30" : "border-amber-500/30"}`}>
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" /> Controllo salvataggio Workbook
            </div>
            {active && (
              <Link
                to="/workbook/$projectId"
                params={{ projectId: active.id }}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Apri Workbook <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
          {!active ? (
            <p className="text-sm text-muted-foreground">
              Seleziona un progetto attivo per verificare i campi salvati nel Workbook prima di completare la lezione.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Prima di segnare questa lezione come completata verifico che i campi del Workbook del progetto <span className="text-foreground/90 font-medium">"{active.title}"</span> siano davvero salvati e validi.
              </p>
              <ul className="space-y-2">
                {fieldStatus.map((f) => {
                  const isOk = f.status === "ok";
                  const isMissing = f.status === "missing";
                  const Icon = isOk ? CheckCircle2 : isMissing ? XCircle : AlertCircle;
                  const iconCls = isOk ? "text-primary" : isMissing ? "text-amber-400" : "text-red-400";
                  const badge = isOk ? "OK" : isMissing ? "Mancante" : "Validazione fallita";
                  const badgeCls = isOk
                    ? "bg-primary/15 text-primary border-primary/30"
                    : isMissing
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-red-500/15 text-red-300 border-red-500/30";
                  return (
                    <li key={f.field + f.label} className="flex items-start gap-3 text-sm">
                      <Icon className={`size-4 mt-0.5 shrink-0 ${iconCls}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-foreground">{f.label}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeCls}`}>{badge}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isOk
                            ? `Salvato correttamente in "${f.hint}".`
                            : isMissing
                              ? `Compila e salva in "${f.hint}".`
                              : `${f.reason ?? "Contenuto non valido."} Correggi in "${f.hint}".`}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {!allFieldsOk && (
                <p className="text-xs text-amber-300/90 mt-3">
                  {missingCount > 0 && <>Mancanti: <span className="font-medium">{missingCount}</span>. </>}
                  {invalidCount > 0 && <>Da correggere: <span className="font-medium">{invalidCount}</span>. </>}
                  Apri il Workbook, sistema i campi indicati, poi torna qui per completare la lezione.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          <FileText className="size-3.5 text-primary" /> Le tue note
        </div>
        {active && (
          <p className="text-xs text-muted-foreground mb-3">
            Suggerimento: incolla qui l'output ottenuto da {lesson.recommended_agent ?? "l'agente"}, poi
            <Link to="/workbook/$projectId" params={{ projectId: active.id }} className="text-primary hover:underline mx-1">
              salvalo nel Workbook
            </Link>
            del progetto "{active.title}" per consolidarlo.
          </p>
        )}
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Scrivi qui le tue note, i risultati ottenuti, le idee venute fuori…"
          rows={5}
        />
        <div className="flex justify-end mt-3">
          <Button variant="ghost" size="sm" onClick={() => saveMutation.mutate("in_progress")} disabled={saveMutation.isPending}>
            Salva note
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          {prev && (
            <Link to="/academy/lessons/$id" params={{ id: prev.id }}>
              <Button variant="ghost"><ArrowLeft className="size-4" /> Precedente</Button>
            </Link>
          )}
        </div>
        <Button
          variant="hero"
          size="lg"
          onClick={async () => {
            await saveMutation.mutateAsync("completed");
            if (next) navigate({ to: "/academy/lessons/$id", params: { id: next.id } });
            else navigate({ to: "/academy/modules/$id", params: { id: lesson.module_id } });
          }}
          disabled={saveMutation.isPending || completionBlocked}
          title={completionBlocked ? "Completa prima il salvataggio nel Workbook" : undefined}
        >
          <CheckCircle2 className="size-4" /> {isCompleted ? "Già completata — continua" : "Segna come completata"}
        </Button>
      </div>
    </div>
  );
}
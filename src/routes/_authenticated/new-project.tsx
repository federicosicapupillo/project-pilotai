import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PRODUCT_TYPES,
  URGENCY_OPTIONS,
  EXPERIENCE_LEVELS,
  ANALYSIS_TEMPLATE,
  AGENT_TEMPLATE,
  ROADMAP_TEMPLATE,
} from "@/lib/project-templates";
import { generateProjectContent } from "@/lib/ai-generation.functions";
import { generateAppRoadmap } from "@/lib/app-roadmap.functions";
import { buildFallbackRoadmap } from "@/lib/app-roadmap";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";
import { GenerationProgressDialog, type GenState } from "@/components/GenerationProgressDialog";

export const Route = createFileRoute("/_authenticated/new-project")({
  head: () => ({ meta: [{ title: "Nuovo progetto — Da Idea ad App" }] }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [genState, setGenState] = useState<GenState>("idle");
  const [phase, setPhase] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const generate = useServerFn(generateProjectContent);
  const generateRoadmap = useServerFn(generateAppRoadmap);
  const [form, setForm] = useState({
    title: "",
    idea_description: "",
    target: "",
    problem: "",
    solution: "",
    product_type: "Web app",
    urgency: "medium",
    existing_tools: "",
    experience_level: "beginner",
  });

  // Prefill from landing-page idea estimator, if present.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = localStorage.getItem("draft_idea_description");
    const draftTitle = localStorage.getItem("draft_idea_title");
    const draftTarget = localStorage.getItem("draft_idea_target");
    const draftProblem = localStorage.getItem("draft_idea_problem");
    const draftSolution = localStorage.getItem("draft_idea_solution");
    const draftProductType = localStorage.getItem("draft_idea_product_type");
    if (draft && draft.trim()) {
      setForm((f) => {
        if (f.idea_description.trim()) return f;
        return {
          ...f,
          idea_description: draft,
          title: f.title || draftTitle || draft.slice(0, 60),
          target: f.target || draftTarget || "",
          problem: f.problem || draftProblem || "",
          solution: f.solution || draftSolution || "",
          product_type:
            f.product_type && f.product_type !== "Web app"
              ? f.product_type
              : draftProductType && PRODUCT_TYPES.includes(draftProductType as (typeof PRODUCT_TYPES)[number])
                ? draftProductType
                : f.product_type,
        };
      });
      localStorage.removeItem("draft_idea_description");
      localStorage.removeItem("draft_idea_title");
      localStorage.removeItem("draft_idea_target");
      localStorage.removeItem("draft_idea_problem");
      localStorage.removeItem("draft_idea_solution");
      localStorage.removeItem("draft_idea_product_type");
    }
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const runGeneration = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg(undefined);
    setPhase(0);
    setGenState("running");
    setDialogOpen(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("Non autenticato");
      const { data: project, error } = await supabase
        .from("projects")
        .insert({ ...form, user_id: userRes.user.id, status: "in_progress" })
        .select("*")
        .single();
      if (error || !project) throw error ?? new Error("Errore creazione");
      setCreatedProjectId(project.id);

      // Try AI generation; fall back to templates on any failure.
      let analysis: ReturnType<typeof ANALYSIS_TEMPLATE>;
      let agents: Array<{ project_id: string; name: string; role: string; when_to_use: string; expected_output: string; prompt_text: string }>;
      let prompts: Array<{ project_id: string; category: string; title: string; prompt_text: string; recommended_tool: string }>;
      type RoadmapInsert = {
        project_id: string;
        title: string;
        description: string | null;
        phase: string | null;
        order_index: number;
        priority: number;
        status: string;
        recommended_agent: string | null;
        recommended_tool: string | null;
        prompt_text: string | null;
        expected_output: string | null;
        checklist_items: string[];
        progress_weight: number;
      };
      let roadmap: RoadmapInsert[];
      let usedAi = false;

      try {
        const ai = await generate({
          data: {
            title: form.title,
            idea_description: form.idea_description,
            target: form.target,
            problem: form.problem,
            solution: form.solution,
            product_type: form.product_type,
            experience_level: form.experience_level,
            existing_tools: form.existing_tools,
            urgency: form.urgency,
          },
        });
        analysis = ai.project_analysis;
        agents = ai.agents.map((a) => ({ project_id: project.id, ...a }));
        prompts = ai.prompts.map((p) => ({ project_id: project.id, ...p }));
        usedAi = true;
      } catch (aiErr) {
        console.error("AI generation failed, falling back to templates", aiErr);
        toast.message("L'AI non ha risposto: uso una struttura base. Potrai rigenerare in seguito.");
        analysis = ANALYSIS_TEMPLATE(project);
        const agentTpl = AGENT_TEMPLATE(project.idea_description ?? project.title);
        agents = agentTpl.map((a) => ({ project_id: project.id, ...a }));
        prompts = agentTpl.map((a) => ({
          project_id: project.id,
          category: "Progettazione app",
          title: `Prompt ${a.name}`,
          prompt_text: a.prompt_text,
          recommended_tool: "ChatGPT / Claude",
        }));
      }

      setPhase(1);
      await supabase.from("project_analysis").insert({ project_id: project.id, ...analysis });
      setPhase(2);
      await supabase.from("agents").insert(agents);
      setPhase(3);
      await supabase.from("prompts").insert(prompts);
      setPhase(4);

      // App Construction Roadmap (rich, personalized). Fallback to deterministic template on any failure.
      try {
        const aiRoadmap = await generateRoadmap({
          data: {
            title: form.title,
            idea_description: form.idea_description,
            target: form.target,
            problem: form.problem,
            solution: form.solution,
            product_type: form.product_type,
            experience_level: form.experience_level,
            existing_tools: form.existing_tools,
            urgency: form.urgency,
          },
        });
        roadmap = aiRoadmap.map((s) => ({
          project_id: project.id,
          title: s.title,
          description: s.description,
          phase: s.phase,
          order_index: s.order_index,
          priority: s.priority,
          status: s.status,
          recommended_agent: s.recommended_agent,
          recommended_tool: s.recommended_tool,
          prompt_text: s.prompt_text,
          expected_output: s.expected_output,
          checklist_items: s.checklist_items as string[],
          progress_weight: s.progress_weight,
        }));
      } catch (e) {
        console.error("AI roadmap failed, using fallback", e);
        const fb = buildFallbackRoadmap({ title: form.title, idea_description: form.idea_description });
        roadmap = fb.map((s) => ({
          project_id: project.id,
          title: s.title,
          description: s.description,
          phase: s.phase,
          order_index: s.order_index,
          priority: s.priority,
          status: String(s.status),
          recommended_agent: s.recommended_agent,
          recommended_tool: s.recommended_tool,
          prompt_text: s.prompt_text,
          expected_output: s.expected_output,
          checklist_items: s.checklist_items as string[],
          progress_weight: s.progress_weight,
        }));
      }
      await supabase.from("roadmap_items").insert(roadmap);
      setPhase(5);
      setGenState("done");

      toast.success(usedAi ? "Progetto generato con AI!" : "Progetto creato!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore";
      setErrorMsg(message);
      setGenState("error");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runGeneration();
  };

  const handleGoToProject = () => {
    if (!createdProjectId) return;
    setDialogOpen(false);
    navigate({ to: "/projects/$id", params: { id: createdProjectId } });
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (genState !== "running") setGenState("idle");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" /> Torna alla dashboard
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
          <Sparkles className="size-5 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-semibold">Nuovo progetto</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Rispondi alle domande. Generiamo scheda progetto, agenti, prompt e roadmap.
      </p>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        <Field label="Titolo del progetto" required>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={120} />
        </Field>

        <Field label="Descrivi la tua idea" required>
          <Textarea
            value={form.idea_description}
            onChange={(e) => set("idea_description", e.target.value)}
            required
            rows={4}
            maxLength={2000}
            placeholder="In poche frasi: cosa fa, come funziona, cosa cambia per chi la usa."
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="A chi serve?">
            <Input value={form.target} onChange={(e) => set("target", e.target.value)} placeholder="Es. ristoratori indipendenti" />
          </Field>
          <Field label="Che problema risolve?">
            <Input value={form.problem} onChange={(e) => set("problem", e.target.value)} placeholder="Es. perdono prenotazioni" />
          </Field>
        </div>

        <Field label="Che risultato vuoi ottenere?">
          <Textarea
            value={form.solution}
            onChange={(e) => set("solution", e.target.value)}
            rows={3}
            placeholder="Cosa deve cambiare dopo aver usato l'app."
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Tipo di prodotto">
            <Select value={form.product_type} onValueChange={(v) => set("product_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Quanto è urgente?">
            <Select value={form.urgency} onValueChange={(v) => set("urgency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Strumenti che vuoi usare (opzionale)">
          <Input value={form.existing_tools} onChange={(e) => set("existing_tools", e.target.value)} placeholder="Es. Lovable, Supabase, Notion" />
        </Field>

        <Field label="Il tuo livello di esperienza">
          <Select value={form.experience_level} onValueChange={(v) => set("experience_level", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
          {busy ? "Generazione in corso…" : "Genera scheda progetto"}
        </Button>
      </form>

      <GenerationProgressDialog
        open={dialogOpen}
        state={genState}
        phase={phase}
        errorMessage={errorMsg}
        onRetry={() => void runGeneration()}
        onClose={handleClose}
        onGoToProject={handleGoToProject}
      />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}
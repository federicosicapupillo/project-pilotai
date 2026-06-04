import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/new-project")({
  head: () => ({ meta: [{ title: "Nuovo progetto — Da Idea ad App" }] }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
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

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("Non autenticato");
      const { data: project, error } = await supabase
        .from("projects")
        .insert({ ...form, user_id: userRes.user.id, status: "in_progress" })
        .select("*")
        .single();
      if (error || !project) throw error ?? new Error("Errore creazione");

      const analysis = ANALYSIS_TEMPLATE(project);
      const agents = AGENT_TEMPLATE(project.idea_description ?? project.title).map((a) => ({
        ...a,
        project_id: project.id,
      }));
      const roadmap = ROADMAP_TEMPLATE.map((r, i) => ({
        ...r,
        project_id: project.id,
        status: "todo",
        priority: i,
      }));
      const prompts = agents.map((a) => ({
        project_id: project.id,
        category: "Progettazione app",
        title: `Prompt ${a.name}`,
        prompt_text: a.prompt_text,
        recommended_tool: "ChatGPT / Claude",
      }));

      await Promise.all([
        supabase.from("project_analysis").insert({ project_id: project.id, ...analysis }),
        supabase.from("agents").insert(agents),
        supabase.from("roadmap_items").insert(roadmap),
        supabase.from("prompts").insert(prompts),
      ]);

      toast.success("Progetto creato!");
      navigate({ to: "/projects/$id", params: { id: project.id } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore";
      toast.error(message);
    } finally {
      setBusy(false);
    }
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
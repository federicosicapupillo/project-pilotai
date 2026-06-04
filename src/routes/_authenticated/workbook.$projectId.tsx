import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/workbook/$projectId")({
  head: () => ({ meta: [{ title: "Workbook progetto — Da Idea ad App" }] }),
  component: WorkbookPage,
});

type Wb = {
  idea: string; target: string; problem: string; solution: string; mvp: string;
  screens: string; data_to_save: string; agents_used: string; prompts_used: string;
  bugs_found: string; next_steps: string;
};

const empty: Wb = {
  idea: "", target: "", problem: "", solution: "", mvp: "",
  screens: "", data_to_save: "", agents_used: "", prompts_used: "",
  bugs_found: "", next_steps: "",
};

function toLines(v: unknown): string {
  if (Array.isArray(v)) return v.join("\n");
  if (typeof v === "string") return v;
  return "";
}
function fromLines(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

function WorkbookPage() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<Wb>(empty);

  const { data } = useQuery({
    queryKey: ["workbook", projectId],
    queryFn: async () => {
      const { data: project } = await supabase.from("projects").select("id, title, idea_description, target, problem, solution").eq("id", projectId).single();
      const { data: wb } = await supabase.from("project_workbook").select("*").eq("project_id", projectId).maybeSingle();
      return { project, wb };
    },
  });

  useEffect(() => {
    if (!data) return;
    if (data.wb) {
      setForm({
        idea: data.wb.idea ?? data.project?.idea_description ?? "",
        target: data.wb.target ?? data.project?.target ?? "",
        problem: data.wb.problem ?? data.project?.problem ?? "",
        solution: data.wb.solution ?? data.project?.solution ?? "",
        mvp: data.wb.mvp ?? "",
        screens: toLines(data.wb.screens),
        data_to_save: toLines(data.wb.data_to_save),
        agents_used: toLines(data.wb.agents_used),
        prompts_used: toLines(data.wb.prompts_used),
        bugs_found: toLines(data.wb.bugs_found),
        next_steps: toLines(data.wb.next_steps),
      });
    } else if (data.project) {
      setForm({
        ...empty,
        idea: data.project.idea_description ?? "",
        target: data.project.target ?? "",
        problem: data.project.problem ?? "",
        solution: data.project.solution ?? "",
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non autenticato");
      const payload = {
        user_id: user.id,
        project_id: projectId,
        idea: form.idea, target: form.target, problem: form.problem,
        solution: form.solution, mvp: form.mvp,
        screens: fromLines(form.screens),
        data_to_save: fromLines(form.data_to_save),
        agents_used: fromLines(form.agents_used),
        prompts_used: fromLines(form.prompts_used),
        bugs_found: fromLines(form.bugs_found),
        next_steps: fromLines(form.next_steps),
      };
      const { error } = await supabase.from("project_workbook").upsert(payload, { onConflict: "project_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Workbook salvato"); qc.invalidateQueries({ queryKey: ["workbook", projectId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/projects/$id" params={{ id: projectId }} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="size-4" /> Torna al progetto
      </Link>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
            <BookOpen className="size-3.5 text-primary" /> Workbook operativo
          </div>
          <h1 className="text-3xl font-display font-semibold">{data?.project?.title ?? "Workbook"}</h1>
          <p className="text-muted-foreground mt-2">Raccogli tutto il pensiero operativo del tuo progetto in un'unica pagina viva.</p>
        </div>
        <Button variant="hero" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="size-4" /> Salva workbook
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Idea iniziale" value={form.idea} onChange={(v) => setForm({ ...form, idea: v })} />
        <Field label="Target" value={form.target} onChange={(v) => setForm({ ...form, target: v })} />
        <Field label="Problema" value={form.problem} onChange={(v) => setForm({ ...form, problem: v })} />
        <Field label="Soluzione" value={form.solution} onChange={(v) => setForm({ ...form, solution: v })} />
        <Field label="MVP" value={form.mvp} onChange={(v) => setForm({ ...form, mvp: v })} rows={4} />
        <Field label="Schermate" hint="Una per riga" value={form.screens} onChange={(v) => setForm({ ...form, screens: v })} lines rows={5} />
        <Field label="Dati da salvare" hint="Una tabella/campo per riga" value={form.data_to_save} onChange={(v) => setForm({ ...form, data_to_save: v })} lines rows={5} />
        <Field label="Agenti usati" hint="Uno per riga" value={form.agents_used} onChange={(v) => setForm({ ...form, agents_used: v })} lines rows={4} />
        <Field label="Prompt usati" hint="Uno per riga" value={form.prompts_used} onChange={(v) => setForm({ ...form, prompts_used: v })} lines rows={5} />
        <Field label="Bug trovati" hint="Uno per riga" value={form.bugs_found} onChange={(v) => setForm({ ...form, bugs_found: v })} lines rows={5} />
        <Field label="Prossimi step" hint="Uno per riga" value={form.next_steps} onChange={(v) => setForm({ ...form, next_steps: v })} lines rows={5} />
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="hero" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="size-4" /> Salva workbook
        </Button>
      </div>
    </div>
  );
}
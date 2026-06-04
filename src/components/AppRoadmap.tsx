import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, Circle, CircleDot, ClipboardCopy, ListChecks,
  Bot, Wrench, Sparkles, Target, FileText, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { ToolBadge } from "@/components/ToolBadge";
import {
  APP_ROADMAP_PHASES, computeProgress, nextActionableStep, type RoadmapItem,
} from "@/lib/app-roadmap";

type Status = "todo" | "in_progress" | "done";
const STATUS_NEXT: Record<Status, Status> = { todo: "in_progress", in_progress: "done", done: "todo" };
const STATUS_LABEL: Record<Status, string> = { todo: "Da fare", in_progress: "In corso", done: "Completato" };

export function useAppRoadmap(projectId: string) {
  return useQuery({
    queryKey: ["app-roadmap", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmap_items").select("*").eq("project_id", projectId).order("order_index");
      if (error) throw error;
      return (data ?? []) as unknown as RoadmapItem[];
    },
  });
}

export function AppRoadmap({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useAppRoadmap(projectId);
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const progress = useMemo(() => computeProgress(items), [items]);
  const next = useMemo(() => nextActionableStep(items), [items]);

  const phases = useMemo(() => {
    const groups = new Map<string, RoadmapItem[]>();
    for (const ph of APP_ROADMAP_PHASES) groups.set(ph, []);
    for (const it of items) {
      const ph = it.phase ?? "MVP";
      if (!groups.has(ph)) groups.set(ph, []);
      groups.get(ph)!.push(it);
    }
    return Array.from(groups.entries()).filter(([, arr]) => arr.length > 0);
  }, [items]);

  const setStatus = async (it: RoadmapItem, status: Status) => {
    const completed_at = status === "done" ? new Date().toISOString() : null;
    const { error } = await supabase.from("roadmap_items")
      .update({ status, completed_at }).eq("id", it.id!);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["app-roadmap", projectId] });
    qc.invalidateQueries({ queryKey: ["roadmap", projectId] });
    qc.invalidateQueries({ queryKey: ["projects-progress"] });
    qc.invalidateQueries({ queryKey: ["my-path"] });
    if (status === "done") toast.success("Step completato — avanzamento aggiornato");
  };

  const saveNote = async (it: RoadmapItem) => {
    const value = noteDraft[it.id!] ?? "";
    const { error } = await supabase.from("roadmap_items")
      .update({ user_notes: value }).eq("id", it.id!);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["app-roadmap", projectId] });
    toast.success("Note salvate");
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Prompt copiato");
  };

  if (isLoading) return <div className="text-muted-foreground">Caricamento roadmap…</div>;
  if (items.length === 0) return (
    <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground">
      Nessuno step in roadmap. La roadmap viene generata alla creazione del progetto.
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header progress */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Roadmap di costruzione della tua app</div>
            <h3 className="font-display font-semibold text-lg mt-0.5">Avanzamento</h3>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-semibold gradient-text">{progress.pct}%</div>
            <div className="text-xs text-muted-foreground">{progress.completed}/{progress.total} step</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-bg transition-all" style={{ width: `${progress.pct}%` }} />
        </div>
        {next && (
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="text-foreground/90 font-medium">Prossimo step:</span> {next.title}
            {next.recommended_agent && <> — usa <span className="text-foreground/90">{next.recommended_agent}</span></>}
            {next.recommended_tool && <> con <span className="text-foreground/90">{next.recommended_tool}</span></>}.
          </div>
        )}
      </div>

      {/* Phases */}
      {phases.map(([phase, list]) => {
        const phaseDone = list.filter((i) => i.status === "done").length;
        return (
          <div key={phase} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{phase}</h4>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{phaseDone}/{list.length}</span>
            </div>
            <div className="space-y-2">
              {list.map((it) => {
                const status = (it.status as Status) ?? "todo";
                const Icon = status === "done" ? CheckCircle2 : status === "in_progress" ? CircleDot : Circle;
                const color = status === "done" ? "text-primary" : status === "in_progress" ? "text-accent" : "text-muted-foreground";
                const checklist = Array.isArray(it.checklist_items) ? (it.checklist_items as string[]) : [];
                const isOpen = openId === it.id;
                return (
                  <div key={it.id} className="glass-card rounded-xl">
                    <button
                      onClick={() => setOpenId(isOpen ? null : it.id ?? null)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-secondary/40 rounded-xl transition-colors"
                    >
                      <Icon className={`size-5 mt-0.5 shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`font-medium ${status === "done" ? "line-through text-muted-foreground" : ""}`}>
                            {it.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{STATUS_LABEL[status]}</span>
                        </div>
                        {it.description && <p className="text-sm text-muted-foreground mt-1">{it.description}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          {it.recommended_agent && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60 border border-border/60">
                              <Bot className="size-3 text-primary" /> {it.recommended_agent}
                            </span>
                          )}
                          {it.recommended_tool && <ToolBadge name={it.recommended_tool} size="sm" />}
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="size-4 text-muted-foreground mt-1" /> : <ChevronDown className="size-4 text-muted-foreground mt-1" />}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-4 border-t border-border/60">
                        {it.prompt_text && (
                          <div className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                                <Sparkles className="size-3.5 text-primary" /> Prompt pronto
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => copy(it.prompt_text!)}>
                                <ClipboardCopy className="size-4" /> Copia
                              </Button>
                            </div>
                            <pre className="text-sm whitespace-pre-wrap bg-secondary/40 rounded-lg p-3 font-sans">{it.prompt_text}</pre>
                          </div>
                        )}

                        {it.expected_output && (
                          <div>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
                              <Target className="size-3.5 text-primary" /> Output atteso
                            </div>
                            <p className="text-sm">{it.expected_output}</p>
                          </div>
                        )}

                        {checklist.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              <ListChecks className="size-3.5 text-primary" /> Checklist completamento
                            </div>
                            <ul className="space-y-1.5">
                              {checklist.map((c, i) => (
                                <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                                  <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            <FileText className="size-3.5 text-primary" /> Note personali
                          </div>
                          <Textarea
                            rows={3}
                            defaultValue={it.user_notes ?? ""}
                            onChange={(e) => setNoteDraft((p) => ({ ...p, [it.id!]: e.target.value }))}
                            placeholder="Scrivi qui cosa hai prodotto, decisioni prese, link agli output…"
                          />
                          <div className="flex justify-end mt-2">
                            <Button variant="ghost" size="sm" onClick={() => saveNote(it)}>Salva note</Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-xs text-muted-foreground">
                            Peso avanzamento: <span className="text-foreground/80">{it.progress_weight}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => setStatus(it, STATUS_NEXT[status])}
                            >
                              <Wrench className="size-4" /> Sposta in "{STATUS_LABEL[STATUS_NEXT[status]]}"
                            </Button>
                            {status !== "done" && (
                              <Button variant="hero" size="sm" onClick={() => setStatus(it, "done")}>
                                <CheckCircle2 className="size-4" /> Segna come completato
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
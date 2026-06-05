import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Eye, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AgentAvatar } from "@/components/AgentAvatar";
import { ToolIcon } from "@/components/ToolIcon";
import { resolveAgentIdentity } from "@/lib/agent-identity";
import { toast } from "sonner";

type OpPromptMeta = {
  id: string;
  project_id: string | null;
  step_title: string;
  agent_name: string;
  recommended_tool: string;
  title: string;
  created_at: string;
};

type OpPromptFull = OpPromptMeta & {
  instructions: string;
  prompt_text: string;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} - ${hh}:${mi}`;
}

export function AgentPromptsSection({ projectId }: { projectId?: string | null }) {
  const { data: prompts, isLoading } = useQuery({
    queryKey: ["agent-prompts", projectId ?? "none"],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [] as OpPromptMeta[];
      const { data, error } = await supabase
        .from("operational_prompts")
        .select(
          // Lightweight list payload: skip the heavy prompt_text and
          // instructions fields here; they're loaded on demand when the
          // user opens "Vedi prompt" or clicks "Copia prompt".
          "id, project_id, step_title, agent_name, recommended_tool, title, created_at",
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OpPromptMeta[];
    },
    staleTime: 30_000,
  });

  const [viewing, setViewing] = useState<OpPromptFull | null>(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  async function loadFull(id: string): Promise<OpPromptFull | null> {
    const { data, error } = await supabase
      .from("operational_prompts")
      .select(
        "id, project_id, step_title, agent_name, recommended_tool, title, created_at, instructions, prompt_text",
      )
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as OpPromptFull;
  }

  async function openPrompt(p: OpPromptMeta) {
    setOpeningId(p.id);
    setViewingLoading(true);
    const full = await loadFull(p.id);
    setViewingLoading(false);
    setOpeningId(null);
    if (full) setViewing(full);
    else toast.error("Impossibile aprire il prompt");
  }

  const grouped = useMemo(() => {
    const map = new Map<string, OpPromptMeta[]>();
    for (const p of prompts ?? []) {
      const key = p.agent_name || "Agente";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    // ogni gruppo già ordinato per created_at desc grazie alla query
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const da = new Date(a[1][0]?.created_at ?? 0).getTime();
      const db = new Date(b[1][0]?.created_at ?? 0).getTime();
      return db - da;
    });
    return entries;
  }, [prompts]);

  const copyPromptFull = async (p: OpPromptFull) => {
    try {
      await navigator.clipboard.writeText(p.prompt_text);
      toast.success("Prompt copiato");
    } catch {
      toast.error("Impossibile copiare il prompt");
    }
  };

  const copyPromptById = async (p: OpPromptMeta) => {
    setCopyingId(p.id);
    const full = await loadFull(p.id);
    setCopyingId(null);
    if (!full) {
      toast.error("Impossibile copiare il prompt");
      return;
    }
    void copyPromptFull(full);
  };

  return (
    <>
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
        Prompt generati dagli agenti
      </h2>
      <p className="text-xs text-muted-foreground -mt-2">
        Clicca su un agente per vedere i prompt che ha generato, con data, ora,
        step roadmap e strumento consigliato.
      </p>
      <div className="glass-card rounded-xl p-4">
        {!projectId ? (
          <p className="text-sm text-muted-foreground p-4 text-center">
            Seleziona un progetto per vedere i prompt generati dagli agenti.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground p-4 text-center">Caricamento…</p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">
            Nessun prompt generato per questo progetto. Quando il Project Manager
            coordinerà gli agenti, i prompt appariranno qui.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {grouped.map(([agentName, items]) => {
              const identity = resolveAgentIdentity(agentName);
              const last = items[0];
              return (
                <AccordionItem key={agentName} value={agentName} className="border-border/60">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 w-full text-left min-w-0">
                      <AgentAvatar agent={identity} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-semibold text-sm">
                            {identity.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                            {items.length} prompt
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          Ultimo: {last.step_title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                          <span>{formatDateTime(last.created_at)}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <ToolIcon name={last.recommended_tool} size={12} />
                            {last.recommended_tool}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-1">
                      {items.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-lg border border-border/60 bg-background/40 p-3"
                        >
                          <p className="text-sm font-medium line-clamp-2">{p.title}</p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                            <span>Step: {p.step_title}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <ToolIcon name={p.recommended_tool} size={12} />
                              {p.recommended_tool}
                            </span>
                            <span>·</span>
                            <span>Generato il {formatDateTime(p.created_at)}</span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="glass"
                              className="h-7 text-xs"
                              onClick={() => void openPrompt(p)}
                              disabled={openingId === p.id}
                            >
                              <Eye className="size-3" />
                              {openingId === p.id ? "Apertura…" : "Vedi prompt"}
                            </Button>
                            <Button
                              size="sm"
                              variant="glass"
                              className="h-7 text-xs"
                              onClick={() => void copyPromptById(p)}
                              disabled={copyingId === p.id}
                            >
                              <Copy className="size-3" />
                              {copyingId === p.id ? "Copia…" : "Copia prompt"}
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {viewing && (() => {
            const identity = resolveAgentIdentity(viewing.agent_name);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <AgentAvatar agent={identity} size="sm" />
                    <span className="min-w-0">
                      <span className="block font-display text-base">{viewing.title}</span>
                      <span className="block text-xs text-muted-foreground font-normal">
                        {identity.name}
                      </span>
                    </span>
                  </DialogTitle>
                  <DialogDescription className="flex flex-wrap gap-2 text-xs mt-1">
                    <span>Step: {viewing.step_title}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <ToolIcon name={viewing.recommended_tool} size={12} />
                      Da usare su: {viewing.recommended_tool}
                    </span>
                    <span>·</span>
                    <span>Generato il {formatDateTime(viewing.created_at)}</span>
                  </DialogDescription>
                </DialogHeader>
                {viewing.instructions && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                      <Bot className="size-3" /> Dove incollarlo / cosa fare dopo
                    </p>
                    {viewing.instructions}
                  </div>
                )}
                <div className="rounded-lg border border-border/60 bg-background/60 p-3 overflow-auto flex-1">
                  <pre className="text-xs whitespace-pre-wrap font-mono">{viewing.prompt_text}</pre>
                </div>
                <div className="flex justify-end">
                  <Button variant="hero" onClick={() => copyPrompt(viewing)}>
                    <Copy className="size-4" /> Copia prompt
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
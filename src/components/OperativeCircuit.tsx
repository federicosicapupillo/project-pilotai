import { ToolIcon } from "./ToolIcon";
import { ArrowRight } from "lucide-react";

const STEPS: { label: string; tools: string[] }[] = [
  { label: "Idea", tools: ["ChatGPT", "Claude"] },
  { label: "Analisi", tools: ["Perplexity", "ChatGPT"] },
  { label: "Memoria", tools: ["Obsidian", "Notion"] },
  { label: "Costruzione", tools: ["Lovable", "Codex"] },
  { label: "Versioning", tools: ["GitHub", "GitHub Desktop"] },
  { label: "Backend", tools: ["Supabase"] },
  { label: "Test", tools: ["Antigravity", "Lovable"] },
  { label: "Media", tools: ["Midjourney", "Runway", "ElevenLabs", "HyperFrames"] },
  { label: "Lancio", tools: ["Stripe", "Twilio", "Canva"] },
];

export function OperativeCircuit({ compact = false }: { compact?: boolean }) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Circuito operativo</div>
          <h3 className="font-display font-semibold text-lg mt-0.5">Dal pensiero al lancio</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
          {STEPS.length} fasi · usa solo i tool che servono davvero
        </span>
      </div>
      <div className="flex items-stretch gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 shrink-0">
            <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 min-w-[120px]">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
              <div className="font-display font-semibold text-sm mt-0.5">{s.label}</div>
              {!compact && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {s.tools.map((t) => (
                    <ToolIcon key={t} name={t} size={16} />
                  ))}
                </div>
              )}
            </div>
            {i < STEPS.length - 1 && <ArrowRight className="size-4 text-muted-foreground/60 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
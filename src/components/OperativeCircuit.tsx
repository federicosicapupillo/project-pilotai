import { useState } from "react";
import { ToolIcon } from "./ToolIcon";
import { ArrowRight } from "lucide-react";

type Tool = { name: string; role: "principale" | "supporto" | "opzionale" };
type Step = {
  label: string;
  desc: string;
  microcopy: string;
  tools: Tool[];
};

const STEPS: Step[] = [
  {
    label: "Idea",
    desc: "Dai forma all'idea iniziale e scrivila in modo chiaro.",
    microcopy: "Usa ChatGPT e Claude per trasformare l'idea grezza in una prima descrizione chiara.",
    tools: [
      { name: "ChatGPT", role: "principale" },
      { name: "Claude", role: "supporto" },
    ],
  },
  {
    label: "Analisi",
    desc: "Capisci se l'idea ha senso, chi la usa e se esistono alternative.",
    microcopy: "Usa Perplexity per fare ricerca, poi ChatGPT e Claude per organizzare e validare le informazioni.",
    tools: [
      { name: "Perplexity", role: "principale" },
      { name: "ChatGPT", role: "supporto" },
      { name: "Claude", role: "supporto" },
    ],
  },
  {
    label: "Memoria",
    desc: "Salva decisioni, prompt, bug, roadmap e appunti del progetto.",
    microcopy: "Usa Obsidian per salvare tutto ciò che decidi e non perdere il filo del progetto.",
    tools: [
      { name: "Obsidian", role: "principale" },
      { name: "Notion", role: "opzionale" },
    ],
  },
  {
    label: "Costruzione",
    desc: "Crea la prima versione funzionante della tua app.",
    microcopy: "Usa Lovable per costruire la prima versione della tua app e ChatGPT per scrivere prompt più efficaci.",
    tools: [
      { name: "Lovable", role: "principale" },
      { name: "ChatGPT", role: "supporto" },
    ],
  },
  {
    label: "Versioning",
    desc: "Salva, traccia e gestisci le versioni del progetto.",
    microcopy: "Usa GitHub per salvare il progetto e GitHub Desktop per gestire le modifiche in modo più semplice.",
    tools: [
      { name: "GitHub", role: "principale" },
      { name: "GitHub Desktop", role: "supporto" },
    ],
  },
  {
    label: "Backend",
    desc: "Gestisci database, login, dati e struttura tecnica.",
    microcopy: "Usa Supabase per dati e utenti, Lovable per collegarlo all'app, Antigravity solo se serve analisi tecnica.",
    tools: [
      { name: "Supabase", role: "principale" },
      { name: "Lovable", role: "supporto" },
      { name: "Antigravity", role: "opzionale" },
    ],
  },
  {
    label: "Test",
    desc: "Controlla bug, logica e flussi utente.",
    microcopy: "Usa Antigravity per il debug, ChatGPT per chiarire i problemi e GitHub Desktop per gestire le correzioni.",
    tools: [
      { name: "Antigravity", role: "principale" },
      { name: "ChatGPT", role: "supporto" },
      { name: "GitHub Desktop", role: "supporto" },
    ],
  },
  {
    label: "Media",
    desc: "Crea immagini, demo, video e contenuti di presentazione.",
    microcopy: "Usa questi strumenti per presentare meglio la tua app con immagini, video, voce e demo.",
    tools: [
      { name: "Midjourney", role: "principale" },
      { name: "Runway", role: "principale" },
      { name: "ElevenLabs", role: "supporto" },
      { name: "HyperFrames", role: "supporto" },
      { name: "D-ID", role: "opzionale" },
      { name: "Canva", role: "opzionale" },
    ],
  },
  {
    label: "Lancio",
    desc: "Prepara il prodotto per essere usato, venduto o testato.",
    microcopy: "Usa Stripe e Twilio solo se il prodotto ne ha davvero bisogno. Usa Canva e ChatGPT per presentare e lanciare il progetto.",
    tools: [
      { name: "Stripe", role: "opzionale" },
      { name: "Twilio", role: "opzionale" },
      { name: "Canva", role: "supporto" },
      { name: "ChatGPT", role: "supporto" },
    ],
  },
];

const ROLE_STYLE: Record<Tool["role"], string> = {
  principale: "bg-primary/15 border-primary/40 text-foreground",
  supporto: "bg-secondary/60 border-border/50 text-foreground/90",
  opzionale: "bg-background/40 border-dashed border-border/50 text-muted-foreground",
};

const ROLE_LABEL: Record<Tool["role"], string> = {
  principale: "Principale",
  supporto: "Supporto",
  opzionale: "Opzionale",
};

export function OperativeCircuit({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Circuito operativo</div>
          <h3 className="font-display font-semibold text-lg mt-0.5">Dal pensiero al lancio</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Ogni fase ha i suoi strumenti: qui vedi quali usare e quando. Non serve usarli tutti insieme.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline shrink-0 mt-1">
          {STEPS.length} fasi
        </span>
      </div>

      <div className="flex items-stretch gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {STEPS.map((s, i) => {
          const isActive = active === i;
          return (
            <div key={s.label} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActive(isActive ? null : i)}
                className={`text-left rounded-xl border bg-background/40 px-3 py-2.5 min-w-[160px] max-w-[200px] transition-colors hover:border-primary/50 hover:bg-background/60 ${
                  isActive ? "border-primary/60 bg-background/70" : "border-border/60"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
                <div className="font-display font-semibold text-sm mt-0.5">{s.label}</div>
                {!compact && (
                  <>
                    <div className="flex flex-wrap items-center gap-1 mt-2">
                      {s.tools.map((t) => (
                        <span
                          key={t.name}
                          className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] ${ROLE_STYLE[t.role]}`}
                          title={`${t.name} · ${ROLE_LABEL[t.role]}`}
                        >
                          <ToolIcon name={t.name} size={12} />
                          <span className="font-medium truncate max-w-[80px]">{t.name}</span>
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{s.desc}</div>
                  </>
                )}
              </button>
              {i < STEPS.length - 1 && <ArrowRight className="size-4 text-muted-foreground/60 shrink-0" />}
            </div>
          );
        })}
      </div>

      {active !== null && !compact && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-background/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                Step {active + 1} · {STEPS[active].label}
              </div>
              <p className="text-sm text-foreground mt-1">{STEPS[active].desc}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">{STEPS[active].microcopy}</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="text-xs text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 grid sm:grid-cols-3 gap-2">
            {(["principale", "supporto", "opzionale"] as const).map((role) => {
              const items = STEPS[active].tools.filter((t) => t.role === role);
              if (!items.length) return null;
              return (
                <div key={role} className="rounded-lg border border-border/40 bg-background/40 p-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                    {ROLE_LABEL[role]}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((t) => (
                      <span
                        key={t.name}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] ${ROLE_STYLE[t.role]}`}
                      >
                        <ToolIcon name={t.name} size={13} />
                        <span className="font-medium">{t.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
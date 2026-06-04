import { useState } from "react";
import { ToolIcon } from "./ToolIcon";
import {
  ArrowRight, Lightbulb, Search, Brain, Code2, GitBranch,
  Database, ShieldCheck, ImageIcon, Rocket, LucideIcon,
} from "lucide-react";

type Tool = { name: string; role: "principale" | "supporto" | "opzionale" };
type Step = {
  label: string;
  desc: string;
  microcopy: string;
  icon: LucideIcon;
  color: string; // hex for icon glow
  tools: Tool[];
};

const STEPS: Step[] = [
  {
    label: "Idea",
    desc: "Dai forma all'idea iniziale e scrivila in modo chiaro.",
    microcopy: "Usa ChatGPT e Claude per trasformare l'idea grezza in una prima descrizione chiara.",
    icon: Lightbulb,
    color: "#FBBF24",
    tools: [
      { name: "ChatGPT", role: "principale" },
      { name: "Claude", role: "supporto" },
    ],
  },
  {
    label: "Analisi",
    desc: "Capisci se l'idea ha senso, chi la usa e se esistono alternative.",
    microcopy: "Usa Perplexity per fare ricerca, poi ChatGPT e Claude per organizzare e validare le informazioni.",
    icon: Search,
    color: "#A78BFA",
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
    icon: Brain,
    color: "#C084FC",
    tools: [
      { name: "Obsidian", role: "principale" },
      { name: "Notion", role: "opzionale" },
    ],
  },
  {
    label: "Costruzione",
    desc: "Crea la prima versione funzionante della tua app.",
    microcopy: "Usa Lovable per costruire la prima versione della tua app e ChatGPT per scrivere prompt più efficaci.",
    icon: Code2,
    color: "#60A5FA",
    tools: [
      { name: "Lovable", role: "principale" },
      { name: "ChatGPT", role: "supporto" },
    ],
  },
  {
    label: "Versioning",
    desc: "Salva, traccia e gestisci le versioni del progetto.",
    microcopy: "Usa GitHub per salvare il progetto e GitHub Desktop per gestire le modifiche in modo più semplice.",
    icon: GitBranch,
    color: "#A78BFA",
    tools: [
      { name: "GitHub", role: "principale" },
      { name: "GitHub Desktop", role: "supporto" },
    ],
  },
  {
    label: "Backend",
    desc: "Gestisci database, login, dati e struttura tecnica.",
    microcopy: "Usa Supabase per dati e utenti, Lovable per collegarlo all'app, Antigravity solo se serve analisi tecnica.",
    icon: Database,
    color: "#34D399",
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
    icon: ShieldCheck,
    color: "#A78BFA",
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
    icon: ImageIcon,
    color: "#F472B6",
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
    icon: Rocket,
    color: "#FB923C",
    tools: [
      { name: "Stripe", role: "opzionale" },
      { name: "Twilio", role: "opzionale" },
      { name: "Canva", role: "supporto" },
      { name: "ChatGPT", role: "supporto" },
    ],
  },
];

const ROLE_STYLE: Record<Tool["role"], string> = {
  principale: "bg-primary/20 border-primary/50 text-foreground shadow-[0_0_12px_-4px_hsl(var(--primary)/0.6)]",
  supporto: "bg-white/5 border-white/15 text-foreground/90",
  opzionale: "bg-transparent border-dashed border-white/15 text-muted-foreground",
};

const ROLE_LABEL: Record<Tool["role"], string> = {
  principale: "Principale",
  supporto: "Supporto",
  opzionale: "Opzionale",
};

export function OperativeCircuit({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0a0f1f] via-[#0b1124] to-[#070a18] p-6 sm:p-8">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_60%)]" />

      {/* HEADER */}
      <div className="relative flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary/90 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Circuito operativo
          </div>
          <h3 className="font-display font-semibold text-2xl sm:text-4xl mt-3 tracking-tight">
            Dal pensiero al <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">lancio</span>
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
            Ogni fase ha i suoi strumenti: qui vedi quali usare e quando. Non serve usarli tutti insieme.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground/80 shrink-0 mt-1 backdrop-blur">
          <span className="size-1 rounded-full bg-emerald-400" />
          {STEPS.length} fasi
        </span>
      </div>

      {/* TIMELINE */}
      <div className="relative">
        <div className="flex items-stretch gap-0 overflow-x-auto pb-3 snap-x snap-mandatory -mx-1 px-1 scrollbar-thin">
          {STEPS.map((s, i) => {
            const isActive = active === i;
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-stretch shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => setActive(isActive ? null : i)}
                  className={`group relative text-center rounded-2xl border bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md p-5 w-[190px] flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                    isActive ? "border-white/40" : "border-white/10"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? `0 0 40px -8px ${s.color}55, inset 0 0 0 1px ${s.color}33`
                      : undefined,
                  }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: s.color }}
                  >
                    Step {i + 1}
                  </span>

                  <div className="mt-3 mx-auto grid place-items-center size-14 rounded-2xl border transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(180deg, ${s.color}1f, ${s.color}08)`,
                      borderColor: `${s.color}40`,
                      boxShadow: `0 0 22px -6px ${s.color}66`,
                    }}
                  >
                    <Icon className="size-7" style={{ color: s.color }} strokeWidth={1.75} />
                  </div>

                  <div className="font-display font-semibold text-lg mt-3">{s.label}</div>

                  {!compact && (
                    <>
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-2 min-h-[3.75rem]">
                        {s.desc}
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1.5">
                        {s.tools.slice(0, 4).map((t) => (
                          <span
                            key={t.name}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] ${ROLE_STYLE[t.role]}`}
                            title={`${t.name} · ${ROLE_LABEL[t.role]}`}
                          >
                            <ToolIcon name={t.name} size={13} />
                            <span className="font-medium truncate text-left flex-1">{t.name}</span>
                          </span>
                        ))}
                        {s.tools.length > 4 && (
                          <span className="text-[10px] text-muted-foreground text-left">
                            +{s.tools.length - 4} altri
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center justify-center shrink-0 px-2">
                    <div className="size-7 rounded-full border border-white/15 bg-white/5 grid place-items-center backdrop-blur">
                      <ArrowRight className="size-3.5 text-primary/80" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAIL */}
      {active !== null && !compact && (
        <div className="relative mt-5 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-md p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">
                <span className="size-1.5 rounded-full bg-primary" />
                Step {active + 1} · {STEPS[active].label}
              </div>
              <p className="text-base text-foreground mt-2">{STEPS[active].desc}</p>
              <p className="text-sm text-muted-foreground mt-2 italic">{STEPS[active].microcopy}</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="size-7 grid place-items-center rounded-full border border-white/10 bg-white/5 text-xs text-muted-foreground hover:text-foreground hover:border-white/30 shrink-0"
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            {(["principale", "supporto", "opzionale"] as const).map((role) => {
              const items = STEPS[active].tools.filter((t) => t.role === role);
              if (!items.length) return null;
              return (
                <div key={role} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
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

      <p className="relative text-center text-xs sm:text-sm text-muted-foreground mt-6 italic">
        Questo è il tuo arsenale completo: in ogni fase usi solo gli strumenti giusti.
      </p>
    </section>
  );
}
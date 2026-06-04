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
  accent: string; // tailwind color token base, e.g. "from-amber-400/30 to-amber-500/10"
  ring: string;   // ring/glow color
  tools: Tool[];
};

const STEPS: Step[] = [
  {
    label: "Idea",
    desc: "Dai forma all'idea iniziale e scrivila in modo chiaro.",
    microcopy: "Usa ChatGPT e Claude per trasformare l'idea grezza in una prima descrizione chiara.",
    icon: Lightbulb,
    accent: "from-amber-400/25 to-amber-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(251,191,36,0.45)]",
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
    accent: "from-cyan-400/25 to-cyan-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(34,211,238,0.45)]",
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
    accent: "from-violet-400/25 to-violet-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(167,139,250,0.5)]",
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
    accent: "from-pink-400/25 to-pink-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(244,114,182,0.5)]",
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
    accent: "from-slate-300/20 to-slate-400/5",
    ring: "shadow-[0_0_40px_-10px_rgba(203,213,225,0.4)]",
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
    accent: "from-emerald-400/25 to-emerald-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(52,211,153,0.45)]",
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
    accent: "from-sky-400/25 to-sky-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(56,189,248,0.45)]",
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
    accent: "from-fuchsia-400/25 to-fuchsia-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(232,121,249,0.5)]",
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
    accent: "from-indigo-400/25 to-indigo-500/5",
    ring: "shadow-[0_0_40px_-10px_rgba(129,140,248,0.5)]",
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
        <div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-1 px-1 scrollbar-thin">
          {STEPS.map((s, i) => {
            const isActive = active === i;
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2 shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => setActive(isActive ? null : i)}
                  className={`group relative text-left rounded-2xl border bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md p-4 w-[220px] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 ${
                    isActive
                      ? `border-primary/60 ${s.ring}`
                      : "border-white/10 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.4)]"
                  }`}
                >
                  {/* accent gradient halo */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${s.accent} opacity-60 pointer-events-none`} />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="size-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                        <Icon className="size-4 text-foreground/90" />
                      </div>
                    </div>
                    <div className="font-display font-semibold text-base mt-3">{s.label}</div>
                    {!compact && (
                      <>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
                          {s.desc}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 mt-3">
                          {s.tools.slice(0, 4).map((t) => (
                            <span
                              key={t.name}
                              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] backdrop-blur ${ROLE_STYLE[t.role]}`}
                              title={`${t.name} · ${ROLE_LABEL[t.role]}`}
                            >
                              <ToolIcon name={t.name} size={11} />
                              <span className="font-medium truncate max-w-[70px]">{t.name}</span>
                            </span>
                          ))}
                          {s.tools.length > 4 && (
                            <span className="text-[10px] text-muted-foreground px-1">+{s.tools.length - 4}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center shrink-0">
                    <div className="h-px w-3 bg-gradient-to-r from-white/30 to-white/5" />
                    <ArrowRight className="size-3.5 text-white/40 -ml-0.5" />
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
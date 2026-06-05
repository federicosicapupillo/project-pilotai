import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot, ClipboardCopy, Sparkles, ArrowRight, CheckCircle2, Crown, MessageSquare } from "lucide-react";
import { AgentIcon } from "@/components/AgentIcon";
import { ToolBadge } from "@/components/ToolBadge";
import { toast } from "sonner";
import { useAcademyAccess } from "@/components/AcademyLock";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "Libreria Agenti — Da Idea ad App" }] }),
  component: AgentsPage,
});

type AgentProfile = {
  name: string;
  role: string;
  collaborates: string;
  produces: string;
};

const AGENT_PROFILES: Array<{ match: RegExp; profile: AgentProfile }> = [
  {
    match: /stratega|strateg/i,
    profile: {
      name: "Agente Stratega",
      role: "Definisce la direzione del progetto.",
      collaborates: "Validatore + Project Manager",
      produces: "Visione, priorità e cosa eliminare.",
    },
  },
  {
    match: /validator|validat/i,
    profile: {
      name: "Agente Validatore",
      role: "Mette alla prova l'idea.",
      collaborates: "Stratega + Ricercatore",
      produces: "Criticità, punti deboli e conferme.",
    },
  },
  {
    match: /ricercatore|research/i,
    profile: {
      name: "Agente Ricercatore",
      role: "Cerca dati, esempi e competitor.",
      collaborates: "Validatore + Product Manager",
      produces: "Informazioni utili per decidere meglio.",
    },
  },
  {
    match: /mvp|product(?!\s*manager)/i,
    profile: {
      name: "Agente MVP Specialist",
      role: "Riduce il progetto alla prima versione.",
      collaborates: "Project Manager + UX Agent",
      produces: "Funzioni essenziali e roadmap MVP.",
    },
  },
  {
    match: /\bux\b|design|interfac/i,
    profile: {
      name: "UX Agent",
      role: "Disegna esperienza e schermate.",
      collaborates: "MVP Specialist + Build Agent",
      produces: "Flussi, schermate e struttura utente.",
    },
  },
  {
    match: /database|db\b|data\s*planner/i,
    profile: {
      name: "Database Planner",
      role: "Organizza dati, tabelle e relazioni.",
      collaborates: "Build Agent + Supabase Assistant",
      produces: "Struttura dati chiara e ordinata.",
    },
  },
  {
    match: /prompt/i,
    profile: {
      name: "Prompt Engineer",
      role: "Trasforma le decisioni in istruzioni operative.",
      collaborates: "Project Manager + Build Agent",
      produces: "Prompt pronti per costruire.",
    },
  },
  {
    match: /lovable|builder|build/i,
    profile: {
      name: "Lovable Builder",
      role: "Guida la costruzione dell'app.",
      collaborates: "UX + Database + Prompt Engineer",
      produces: "Istruzioni per generare la prima versione.",
    },
  },
  {
    match: /supabase|backend|auth/i,
    profile: {
      name: "Supabase Assistant",
      role: "Gestisce database, login e salvataggio dati.",
      collaborates: "Database Planner + Test Agent",
      produces: "Configurazioni dati e autenticazione.",
    },
  },
  {
    match: /test|qa\b|quality/i,
    profile: {
      name: "Test Agent",
      role: "Controlla errori e punti deboli.",
      collaborates: "Build Agent + UX Agent",
      produces: "Checklist, correzioni e miglioramenti.",
    },
  },
  {
    match: /launch|lancio|go\s*live/i,
    profile: {
      name: "Launch Agent",
      role: "Prepara l'app per essere presentata o venduta.",
      collaborates: "Stratega + Project Manager",
      produces: "Messaggio, landing e primi passi di lancio.",
    },
  },
];

function profileFor(name: string, role: string | null | undefined): AgentProfile {
  const found = AGENT_PROFILES.find((p) => p.match.test(name) || (role ? p.match.test(role) : false));
  if (found) return found.profile;
  return {
    name: name || "Agente",
    role: role || "Parte operativa del Team AI.",
    collaborates: "Project Manager",
    produces: "Contributo specifico al flusso operativo.",
  };
}

function isProjectManager(name: string, role: string | null | undefined) {
  const re = /product\s*manager|project\s*manager|\bpm\b/i;
  return re.test(name) || (role ? re.test(role) : false);
}

function AgentsPage() {
  const { hasAccess } = useAcademyAccess();
  const { data, isLoading } = useQuery({
    queryKey: ["agent-library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_library").select("*").order("sort_order").order("name");
      if (error) throw error;
      return data;
    },
  });

  const agents = [...(data ?? [])].sort((a, b) => {
    const ap = isProjectManager(a.name, a.role) ? 0 : 1;
    const bp = isProjectManager(b.name, b.role) ? 0 : 1;
    return ap - bp;
  });
  const pm = agents.find((a) => isProjectManager(a.name, a.role));
  const others = agents.filter((a) => !isProjectManager(a.name, a.role));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Bot className="size-3.5 text-primary" /> Libreria
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          La tua squadra di <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">agenti AI</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-3xl">
          Tu non devi gestire tutti gli agenti. Parli con il tuo AI Project Manager: lui raccoglie le tue direttive, assegna i compiti al team e ti mostra cosa approvare o correggere.
        </p>
        {hasAccess && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
            <CheckCircle2 className="size-3.5" /> Team AI attivo
          </div>
        )}
      </div>

      <div
        className="mb-8 rounded-2xl border border-primary/40 p-6 sm:p-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 16%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
          boxShadow: "0 0 40px -10px color-mix(in oklab, var(--primary) 40%, transparent)",
        }}
      >
        <h2 className="text-xl sm:text-2xl font-display font-semibold mb-3 flex items-center gap-2">
          <Crown className="size-5 text-primary" /> Parli con un solo agente. Lui coordina tutti gli altri.
        </h2>
        <p className="text-sm sm:text-base text-foreground/85 leading-relaxed max-w-3xl">
          Il Team AI lavora come una squadra, ma tu non devi gestirlo manualmente. Il tuo AI Project Manager riceve le tue direttive, assegna i compiti agli agenti giusti e ti presenta il lavoro da approvare.
        </p>
        <p className="mt-4 text-base sm:text-lg font-display font-semibold bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Tu dai l'ok. Il Project Manager coordina. Gli agenti eseguono.
        </p>
        {!hasAccess && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/prezzi">
                <Sparkles className="size-4" /> Attiva il mio Team AI - 29€ <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">Dopo l'attivazione sblocchi tool, prompt e istruzioni operative.</p>
          </div>
        )}
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      {pm && (
        <div
          className="mb-6 glass-card rounded-2xl p-6 sm:p-7 border-primary/50"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
            boxShadow: "0 0 36px -10px color-mix(in oklab, var(--primary) 55%, transparent)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-primary/50 blur-lg" aria-hidden />
              <div className="relative size-16 rounded-full bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 grid place-items-center text-primary-foreground ring-2 ring-primary/60 shadow-[0_0_32px_-4px_color-mix(in_oklab,var(--primary)_80%,transparent)]">
                <AgentIcon name={pm.icon} size={28} />
              </div>
              <div className="absolute -top-1 -right-1 size-6 rounded-full bg-amber-400 grid place-items-center text-amber-950 ring-2 ring-background shadow">
                <Crown className="size-3.5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-semibold text-xl leading-tight">AI Project Manager</h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 inline-flex items-center gap-1">
                  <Crown className="size-3" /> Coordinatore del Team
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Il tuo unico punto di contatto</p>
              <p className="text-sm text-foreground/85 mt-3 leading-relaxed">
                Tu parli con lui. Lui capisce la tua richiesta, assegna i compiti agli altri agenti, raccoglie i risultati e ti mostra cosa approvare.
              </p>
            </div>
          </div>

          <ol className="mt-5 grid sm:grid-cols-4 gap-2 text-sm">
            {["Tu dai le direttive", "Lui coordina il Team AI", "Gli agenti preparano il lavoro", "Tu approvi o chiedi modifiche"].map((step, i) => (
              <li key={i} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 flex items-start gap-2">
                <span className="text-xs font-semibold text-primary shrink-0">{i + 1}</span>
                <span className="text-foreground/85">{step}</span>
              </li>
            ))}
          </ol>

          {hasAccess && (
            <div className="mt-5">
              <Button variant="hero" size="lg" asChild>
                <Link to="/agente-ai">
                  <MessageSquare className="size-4" /> Parla con il Project Manager <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          {hasAccess && (
            <div className="mt-5 space-y-3">
              {Array.isArray(pm.recommended_tools) && pm.recommended_tools.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tool consigliati</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(pm.recommended_tools as string[]).map((t) => <ToolBadge key={t} name={t} size="sm" />)}
                  </div>
                </div>
              )}
              {pm.base_prompt && (
                <div className="bg-secondary/40 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Prompt base</span>
                    <Button variant="ghost" size="sm" onClick={async () => { await navigator.clipboard.writeText(pm.base_prompt!); toast.success("Prompt copiato!"); }}>
                      <ClipboardCopy className="size-3.5" /> Copia
                    </Button>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-sans">{pm.base_prompt}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {others.map((a) => {
          const p = profileFor(a.name, a.role);
          return (
            <div key={a.id} className="glass-card rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-primary/25 blur-md" aria-hidden />
                  <div className="relative size-12 rounded-full bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 grid place-items-center text-primary-foreground ring-2 ring-primary/40">
                    <AgentIcon name={a.icon} size={20} />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-base leading-tight">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.role}</p>
                </div>
              </div>
              <dl className="text-xs space-y-1.5">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground shrink-0">Collabora con:</dt>
                  <dd className="text-foreground/85">{p.collaborates}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground shrink-0">Produce:</dt>
                  <dd className="text-foreground/85">{p.produces}</dd>
                </div>
              </dl>

              {hasAccess && (
                <div className="mt-4 space-y-3">
                  {Array.isArray(a.recommended_tools) && a.recommended_tools.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Tool</div>
                      <div className="flex flex-wrap gap-1">
                        {(a.recommended_tools as string[]).map((t) => <ToolBadge key={t} name={t} size="sm" />)}
                      </div>
                    </div>
                  )}
                  {a.base_prompt && (
                    <div className="bg-secondary/40 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Prompt</span>
                        <Button variant="ghost" size="sm" onClick={async () => { await navigator.clipboard.writeText(a.base_prompt!); toast.success("Prompt copiato!"); }}>
                          <ClipboardCopy className="size-3" /> Copia
                        </Button>
                      </div>
                      <pre className="text-[11px] whitespace-pre-wrap font-sans">{a.base_prompt}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hasAccess && (
        <div
          className="mt-10 rounded-2xl border border-primary/40 p-6 sm:p-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 16%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
            boxShadow: "0 0 40px -10px color-mix(in oklab, var(--primary) 45%, transparent)",
          }}
        >
          <h2 className="text-xl sm:text-2xl font-display font-semibold">Vuoi mettere al lavoro il tuo Team AI?</h2>
          <p className="text-sm sm:text-base text-foreground/85 mt-3 max-w-2xl mx-auto leading-relaxed">
            Con l'attivazione sblocchi tool, prompt e istruzioni operative. Tu dai le direttive al Project Manager, lui coordina gli agenti e ti mostra il lavoro da approvare.
          </p>
          <div className="mt-5 flex flex-col items-center gap-2">
            <Button variant="hero" size="lg" asChild>
              <Link to="/prezzi">
                <Sparkles className="size-4" /> Attiva il mio Team AI - 29€ <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">Accesso immediato dopo il pagamento.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* legacy block removed */
function _LegacyUnused() {
  return null;
}
/*
        {[].map((a: any) => {
          const p: any = {};
          const isPM = false;
          return (
          <div
            key={a.id}
            className={
              isPM
                ? "glass-card rounded-xl p-6 relative md:col-span-2 border-primary/50"
                : "glass-card rounded-xl p-6 relative"
            }
            style={
              isPM
                ? {
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
                    boxShadow:
                      "0 0 36px -10px color-mix(in oklab, var(--primary) 55%, transparent)",
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className={isPM ? "absolute inset-0 rounded-full bg-primary/50 blur-lg" : "absolute inset-0 rounded-full bg-primary/30 blur-md"} aria-hidden />
                  <div className={
                    isPM
                      ? "relative size-16 rounded-full bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 grid place-items-center text-primary-foreground ring-2 ring-primary/60 shadow-[0_0_32px_-4px_color-mix(in_oklab,var(--primary)_80%,transparent)]"
                      : "relative size-14 rounded-full bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 grid place-items-center text-primary-foreground ring-2 ring-primary/40 shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--primary)_70%,transparent)]"
                  }>
                    <AgentIcon name={a.icon} size={isPM ? 28 : 24} />
                  </div>
                  {isPM && (
                    <div className="absolute -top-1 -right-1 size-6 rounded-full bg-amber-400 grid place-items-center text-amber-950 ring-2 ring-background shadow">
                      <Crown className="size-3.5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className={isPM ? "font-display font-semibold text-xl leading-tight" : "font-display font-semibold text-lg leading-tight"}>{p.hello}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.role}</p>
                  {isPM && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300">
                      <Crown className="size-3" /> Coordinatore del Team
                    </span>
                  )}
                </div>
              </div>
              {hasAccess ? (
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0 inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Agente operativo attivo
                </span>
              ) : a.course_phase ? (
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary/60 text-muted-foreground shrink-0">
                  {a.course_phase}
                </span>
              ) : null}
            </div>

            <p className="text-sm text-foreground/85 mb-3 leading-relaxed">
              {p.pitch}
            </p>

            {isPM && (
              <div className="mb-3 rounded-lg border border-primary/40 bg-background/40 px-4 py-3">
                <p className="text-sm sm:text-base font-display font-semibold bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Tu parli con me. Io coordino tutto il Team AI.
                </p>
              </div>
            )}

            {!hasAccess && (
              <div className="mt-2 mb-3 rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  <Users className="size-3.5 text-primary" /> Collabora con
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{p.collaboration}</p>
              </div>
            )}

            {hasAccess ? (
              <>
                {isPM && (
                  <div className="mb-4">
                    <Button variant="hero" size="lg" asChild>
                      <Link to="/agente-ai">
                        <MessageSquare className="size-4" /> Parla con il Project Manager <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                )}
                <dl className="space-y-2 text-sm">
              {a.when_to_use && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-3">Quando usarlo</dt>
                <dd>{a.when_to_use}</dd>
              </>)}
              {a.expected_output && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-3">Cosa produce</dt>
                <dd>{a.expected_output}</dd>
              </>)}
              {Array.isArray(a.recommended_tools) && a.recommended_tools.length > 0 && (<>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-3">Tool consigliati</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {(a.recommended_tools as string[]).map((t) => (
                    <ToolBadge key={t} name={t} size="sm" />
                  ))}
                </dd>
              </>)}
                </dl>
                {a.base_prompt && (
              <div className="mt-4 bg-secondary/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Prompt base</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(a.base_prompt!);
                      toast.success("Prompt copiato!");
                    }}
                  >
                    <ClipboardCopy className="size-3.5" /> Copia
                  </Button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-sans">{a.base_prompt}</pre>
              </div>
                )}
              </>
            ) : (
              <div
                className="mt-3 rounded-xl border border-primary/30 p-4"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklab, var(--primary) 12%, transparent), color-mix(in oklab, var(--accent) 8%, transparent))",
                }}
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary/90 font-semibold">
                  <Lock className="size-3.5" /> {p.lockedTitle ?? "Area operativa bloccata"}
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {p.locked}
                </p>
                <div className="mt-3">
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/prezzi">
                      <Sparkles className="size-3.5" /> Attiva Team AI - 29€ <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
*/
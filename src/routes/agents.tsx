import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot, ClipboardCopy, Lock, Sparkles, ArrowRight, CheckCircle2, Users, Crown, MessageSquare } from "lucide-react";
import { AgentIcon } from "@/components/AgentIcon";
import { ToolBadge } from "@/components/ToolBadge";
import { toast } from "sonner";
import { useAcademyAccess } from "@/components/AcademyLock";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "Libreria Agenti — Da Idea ad App" }] }),
  component: AgentsPage,
});

type AgentProfile = {
  hello: string;
  role: string;
  pitch: string;
  collaboration: string;
  locked: string;
  lockedTitle?: string;
};

const AGENT_PROFILES: Array<{ match: RegExp; profile: AgentProfile }> = [
  {
    match: /stratega|strateg/i,
    profile: {
      hello: "Ciao, sono il tuo Agente Stratega",
      role: "Definisco la direzione del progetto",
      pitch:
        "Ti aiuto a capire qual è la vera idea da costruire, cosa eliminare e quale direzione prendere. Prima di creare qualsiasi schermata, metto ordine nel progetto.",
      collaboration:
        "Collaboro con il Validatore per capire se l'idea ha senso e con il Product Manager per trasformarla in una roadmap concreta.",
      locked:
        "Dopo l'attivazione vedrai le domande strategiche, i prompt e la struttura che uso per definire la direzione della tua app.",
    },
  },
  {
    match: /product\s*manager|pm\b/i,
    profile: {
      hello: "Ciao, sono il tuo AI Project Manager",
      role: "Coordino il Team AI e trasformo le tue direttive in azioni",
      pitch:
        "Il mio compito è prendere la tua idea, capirla, ordinarla e trasformarla in un piano operativo. Non devi parlare con ogni agente separatamente: tu dai le direttive a me, io assegno i compiti al team, raccolgo i risultati e ti mostro cosa approvare.",
      collaboration:
        "Coordino lo Stratega per la direzione, il Validatore per controllare l'idea, il Ricercatore per cercare conferme, l'UX Agent per le schermate, il Database Planner per i dati, il Prompt Engineer per le istruzioni, il Build Agent per la costruzione, il Test Agent per i controlli e il Launch Agent per il lancio.",
      lockedTitle: "Cabina di regia bloccata",
      locked:
        "Dopo l'attivazione, questo agente diventerà il tuo punto di contatto principale. Tu gli darai le direttive e lui coordinerà il lavoro degli altri agenti sulla tua idea.",
    },
  },
  {
    match: /validator|validat/i,
    profile: {
      hello: "Ciao, sono il tuo Agente Validatore",
      role: "Controllo se l'idea regge davvero",
      pitch:
        "Il mio compito è mettere in discussione l'idea. Verifico se risolve un problema reale, se il target è chiaro e se vale la pena costruirla.",
      collaboration:
        "Collaboro con lo Stratega per rafforzare la direzione e con il Ricercatore per cercare segnali, dati e conferme dal mercato.",
      locked:
        "Dopo l'attivazione vedrai criteri di validazione, domande critiche e controlli per capire se la tua idea è abbastanza forte.",
    },
  },
  {
    match: /ricercatore|research/i,
    profile: {
      hello: "Ciao, sono il tuo Agente Ricercatore",
      role: "Cerco dati, esempi e segnali di mercato",
      pitch:
        "Ti aiuto a capire cosa esiste già, quali competitor ci sono, quali soluzioni simili funzionano e dove puoi differenziarti.",
      collaboration:
        "Collaboro con il Validatore per verificare la forza dell'idea e con il Product Manager per trasformare le informazioni raccolte in decisioni pratiche.",
      locked:
        "Dopo l'attivazione vedrai prompt di ricerca, analisi competitor e tracce per rendere il progetto più solido.",
    },
  },
  {
    match: /\bux\b|design|interfac/i,
    profile: {
      hello: "Ciao, sono il tuo UX Agent",
      role: "Disegno esperienza e schermate",
      pitch:
        "Trasformo funzioni e obiettivi in schermate semplici da capire. Il mio compito è rendere l'app chiara, ordinata e facile da usare.",
      collaboration:
        "Collaboro con il Product Manager per capire quali schermate servono e con il Build Agent per preparare una struttura costruibile.",
      locked:
        "Dopo l'attivazione vedrai struttura delle schermate, flussi utente e prompt per creare interfacce più chiare.",
    },
  },
  {
    match: /database|db\b|data\s*planner/i,
    profile: {
      hello: "Ciao, sono il tuo Database Planner",
      role: "Organizzo dati, tabelle e relazioni",
      pitch:
        "Ti aiuto a capire quali dati deve salvare la tua app, come organizzarli e quali tabelle servono per far funzionare il progetto.",
      collaboration:
        "Collaboro con il Product Manager per capire quali dati servono, con il Build Agent per prepararli alla costruzione e con il Supabase Assistant per renderli operativi.",
      locked:
        "Dopo l'attivazione vedrai struttura dati, tabelle consigliate, relazioni e istruzioni per organizzare il database della tua app.",
    },
  },
  {
    match: /prompt/i,
    profile: {
      hello: "Ciao, sono il tuo Prompt Engineer",
      role: "Scrivo istruzioni operative efficaci",
      pitch:
        "Trasformo le decisioni degli altri agenti in prompt chiari, ordinati e pronti da usare. Il mio compito è far lavorare meglio gli strumenti AI.",
      collaboration:
        "Collaboro con Stratega, Product Manager, UX Agent e Build Agent per trasformare idee, schermate e funzioni in istruzioni operative precise.",
      locked:
        "Dopo l'attivazione vedrai prompt pronti, istruzioni personalizzate e comandi da usare per far avanzare il progetto.",
    },
  },
  {
    match: /lovable|builder|build/i,
    profile: {
      hello: "Ciao, sono il tuo Lovable Builder",
      role: "Guido la costruzione dell'app",
      pitch:
        "Prendo struttura, schermate, funzioni e prompt e li trasformo in istruzioni operative per costruire la prima versione della tua app.",
      collaboration:
        "Collaboro con Product Manager, UX Agent, Database Planner, Prompt Engineer e Test Agent per costruire solo ciò che serve e ridurre errori inutili.",
      locked:
        "Dopo l'attivazione vedrai prompt di costruzione, istruzioni per il builder e passaggi per generare le prime parti operative dell'app.",
    },
  },
  {
    match: /supabase|backend|auth/i,
    profile: {
      hello: "Ciao, sono il tuo Supabase Assistant",
      role: "Gestisco database, login e salvataggio dati",
      pitch:
        "Ti aiuto a collegare la parte dati della tua app: utenti, autenticazione, tabelle, salvataggi e permessi.",
      collaboration:
        "Collaboro con il Database Planner per strutturare i dati, con il Build Agent per integrarli nell'app e con il Test Agent per controllare che tutto funzioni.",
      locked:
        "Dopo l'attivazione vedrai istruzioni operative per database, login, salvataggio dati e configurazioni principali.",
    },
  },
  {
    match: /test|qa\b|quality/i,
    profile: {
      hello: "Ciao, sono il tuo Test Agent",
      role: "Controllo errori e punti deboli",
      pitch:
        "Verifico se il progetto funziona, se ci sono passaggi confusi, bug logici, funzioni mancanti o problemi nell'esperienza utente.",
      collaboration:
        "Collaboro con il Build Agent per correggere la prima versione, con l'UX Agent per migliorare chiarezza e con il Supabase Assistant per controllare dati e accessi.",
      locked:
        "Dopo l'attivazione vedrai checklist di controllo, prompt di revisione e criteri per migliorare la tua app prima del lancio.",
    },
  },
  {
    match: /launch|lancio|go\s*live/i,
    profile: {
      hello: "Ciao, sono il tuo Launch Agent",
      role: "Preparo l'app per essere presentata o venduta",
      pitch:
        "Ti aiuto a trasformare il progetto in qualcosa che può essere mostrato, raccontato e proposto a utenti, clienti o investitori.",
      collaboration:
        "Collaboro con Product Manager e Stratega per creare messaggio, promessa, presentazione e primi passi di lancio.",
      locked:
        "Dopo l'attivazione vedrai prompt per naming, descrizione, landing, messaggio di vendita e strategia di lancio.",
    },
  },
];

function profileFor(name: string, role: string | null | undefined): AgentProfile {
  const found = AGENT_PROFILES.find((p) => p.match.test(name) || (role ? p.match.test(role) : false));
  if (found) return found.profile;
  const safeName = name || "Agente";
  return {
    hello: `Ciao, sono il tuo Agente ${safeName}`,
    role: role || "Parte operativa del tuo Team AI",
    pitch:
      "Sono parte della tua squadra AI e lavoro a fianco degli altri agenti per trasformare la tua idea in un progetto concreto.",
    collaboration:
      "Collaboro con lo Stratega e con il Product Manager per inserire il mio contributo nel flusso operativo del team.",
    locked: `Dopo l'attivazione vedrai istruzioni, prompt e strumenti che uso per lavorare sulla parte di "${safeName}" del tuo progetto.`,
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Bot className="size-3.5 text-primary" /> Libreria
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold">
          La tua squadra di <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">agenti AI</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Tu non devi parlare con tutti. Il tuo AI Project Manager coordina il team per te: ascolta le tue direttive, assegna i compiti agli agenti e ti mostra cosa approvare o correggere.
        </p>
        <p className="text-sm text-foreground/70 mt-2 max-w-3xl">
          Puoi conoscere il team. Per vedere tool, prompt e istruzioni operative devi attivare il Team AI.
        </p>
        {hasAccess ? (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
            <CheckCircle2 className="size-3.5" /> Il tuo Team AI è attivo. Ora puoi usare tool, prompt e agenti operativi.
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs text-primary">
            <Lock className="size-3.5" /> Puoi conoscere il team. Per metterlo al lavoro, attiva il Team AI.
          </div>
        )}
      </div>

      <div
        className="mb-6 rounded-2xl border border-primary/40 p-6 sm:p-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
          boxShadow: "0 0 40px -10px color-mix(in oklab, var(--primary) 40%, transparent)",
        }}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold mb-3">
          <Crown className="size-4" /> Parli con un solo agente. Lui coordina tutti gli altri.
        </div>
        <p className="text-sm sm:text-base text-foreground/90 leading-relaxed max-w-3xl">
          Il Team AI lavora come una squadra, ma tu non devi gestirlo manualmente. Il tuo AI Project Manager riceve le tue direttive, assegna i compiti agli agenti giusti e ti presenta il lavoro da approvare.
        </p>
        <p className="mt-4 text-base sm:text-lg font-display font-semibold bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Tu dai l'ok. Il Project Manager coordina. Gli agenti eseguono.
        </p>
      </div>

      <div
        className="mb-8 rounded-2xl border border-primary/25 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 10%, transparent), color-mix(in oklab, var(--accent) 6%, transparent))",
        }}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary/90 font-semibold mb-3">
          <Users className="size-4" /> Gli agenti lavorano insieme
        </div>
        <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
          Lo Stratega definisce la direzione. Il Validatore mette alla prova l'idea. Il Ricercatore cerca conferme. Il Product Manager organizza la roadmap. L'UX Agent disegna le schermate. Il Database Planner struttura dati e tabelle. Il Prompt Engineer prepara le istruzioni. Il Lovable Builder guida la costruzione. Il Supabase Assistant gestisce database e autenticazione. Il Test Agent controlla errori e punti deboli. Il Launch Agent prepara il lancio.
        </p>
        <p className="mt-4 text-base sm:text-lg font-display font-semibold bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Tu dai le direttive. Loro collaborano per preparare il lavoro.
        </p>
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {[...(data ?? [])]
          .sort((a, b) => {
            const ap = isProjectManager(a.name, a.role) ? 0 : 1;
            const bp = isProjectManager(b.name, b.role) ? 0 : 1;
            return ap - bp;
          })
          .map((a) => {
          const p = profileFor(a.name, a.role);
          const isPM = isProjectManager(a.name, a.role);
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
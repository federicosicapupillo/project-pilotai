import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot, ClipboardCopy, Lock, Sparkles, ArrowRight, CheckCircle2, Users } from "lucide-react";
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
      hello: "Ciao, sono il tuo Product Manager",
      role: "Decido cosa costruire e in che ordine",
      pitch:
        "Prendo la direzione definita dallo Stratega e la trasformo in un piano operativo. Scelgo le funzioni essenziali, elimino quelle inutili e organizzo la prima versione.",
      collaboration:
        "Collaboro con lo Stratega, con l'UX Agent per le schermate e con il Build Agent per preparare la costruzione.",
      locked:
        "Dopo l'attivazione vedrai roadmap, priorità, funzioni MVP e prompt operativi per costruire la prima versione.",
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
          Ogni agente ha un ruolo preciso, ma non lavora da solo. Stratega, Product Manager, Validatore, Ricercatore, UX, Database, Prompt, Build, Supabase, Test e Lancio collaborano tra loro per trasformare la tua idea in un progetto operativo.
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
        {data?.map((a) => {
          const p = profileFor(a.name, a.role);
          return (
          <div key={a.id} className="glass-card rounded-xl p-6 relative">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-md" aria-hidden />
                  <div className="relative size-14 rounded-full bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 grid place-items-center text-primary-foreground ring-2 ring-primary/40 shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--primary)_70%,transparent)]">
                    <AgentIcon name={a.icon} size={24} />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg leading-tight">{p.hello}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.role}</p>
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
                  <Lock className="size-3.5" /> Area operativa bloccata
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
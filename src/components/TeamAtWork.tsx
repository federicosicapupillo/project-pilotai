import { Loader2 } from "lucide-react";
import { AgentAvatar } from "@/components/AgentAvatar";
import { resolveAgentIdentity } from "@/lib/agent-identity";

type Mode = "thinking" | "validating" | "generating-prompt" | "schema";

type AgentActivity = { name: string; status: string };

// Map roadmap step → up to 2 supporting agents + status copy.
const STEP_AGENTS: Record<string, AgentActivity[]> = {
  "Progetto definito": [
    { name: "Stratega", status: "Sta definendo la direzione del progetto…" },
  ],
  "Punti di forza e criticità": [
    { name: "Validatore", status: "Sta verificando rischi, criticità e ipotesi…" },
    { name: "Ricercatore", status: "Sta cercando esempi e riferimenti utili…" },
  ],
  "MVP / prima versione": [
    { name: "MVP", status: "Sta definendo la prima versione dell'app…" },
  ],
  "Schermate principali": [
    { name: "UX", status: "Sta studiando flussi, schermate e percorso utente…" },
  ],
  "Dashboard e area utente": [
    { name: "UX", status: "Sta disegnando l'area utente e la dashboard…" },
    { name: "Costruttore", status: "Sta preparando la struttura della prima versione…" },
  ],
  "Backend e dati": [
    { name: "Architetto Dati", status: "Sta organizzando dati, tabelle e relazioni…" },
    { name: "Sicurezza", status: "Sta controllando permessi, accessi e dati sensibili…" },
  ],
  "Test e correzioni": [
    { name: "Controllo Qualità", status: "Sta verificando che tutto funzioni correttamente…" },
  ],
  "Prima versione pronta": [
    { name: "Lancio", status: "Sta preparando il piano di lancio…" },
  ],
};

function getPmStatus(mode: Mode): string {
  switch (mode) {
    case "validating":
      return "Sta validando la risposta dell'AI esterna…";
    case "generating-prompt":
      return "Sta coordinando l'Istruttore per il prompt operativo…";
    case "schema":
      return "Sta preparando lo schema dello step…";
    default:
      return "Sto coordinando il team…";
  }
}

export function TeamAtWork({
  stepTitle,
  mode = "thinking",
}: {
  stepTitle: string;
  mode?: Mode;
}) {
  const pm = resolveAgentIdentity("Project Manager");
  const support = (STEP_AGENTS[stepTitle] ?? []).slice(0, 2);
  // When generating an operational prompt, always involve the Instructor.
  const extra: AgentActivity[] =
    mode === "generating-prompt"
      ? [{ name: "Istruttore", status: "Sta trasformando il brief in prompt operativo…" }]
      : [];
  const lineup = [
    { identity: pm, status: getPmStatus(mode) },
    ...support.map((a) => ({ identity: resolveAgentIdentity(a.name), status: a.status })),
    ...extra.map((a) => ({ identity: resolveAgentIdentity(a.name), status: a.status })),
  ].slice(0, 3);

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.06] via-background/40 to-accent/[0.06] p-3 sm:p-4 shadow-[0_0_24px_-16px_oklch(0.7_0.18_280/0.6)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className="size-3.5 animate-spin text-primary" />
        <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-primary">
          Team AI al lavoro
        </span>
      </div>
      <ul className="space-y-2.5">
        {lineup.map((a, i) => (
          <li key={`${a.identity.id}-${i}`} className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <AgentAvatar agent={a.identity} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                {a.identity.name}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {a.status}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
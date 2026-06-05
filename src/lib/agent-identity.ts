import projectManagerImg from "@/assets/agents/project-manager.png";
import strategaImg from "@/assets/agents/stratega.png";
import validatoreImg from "@/assets/agents/validatore.png";
import ricercatoreImg from "@/assets/agents/ricercatore.png";
import mvpImg from "@/assets/agents/mvp.png";
import uxImg from "@/assets/agents/ux.png";
import architettoDatiImg from "@/assets/agents/architetto-dati.png";
import istruttoreImg from "@/assets/agents/istruttore.png";
import costruttoreImg from "@/assets/agents/costruttore.png";
import controlloQualitaImg from "@/assets/agents/controllo-qualita.png";
import sicurezzaImg from "@/assets/agents/sicurezza.png";
import lancioImg from "@/assets/agents/lancio.png";

export type AgentIdentity = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string; // tailwind class for ring/glow tint
  badge?: "crown" | "shield";
  collaborates: string;
  produces: string;
};

// Centralized identity. Same avatar reused across the whole project.
export const AGENT_IDENTITIES: AgentIdentity[] = [
  {
    id: "project-manager",
    name: "AI Project Manager",
    role: "Coordina tutto il Team AI.",
    avatar: projectManagerImg,
    color: "from-amber-400 to-fuchsia-500",
    badge: "crown",
    collaborates: "Tutti gli agenti del team",
    produces: "Piano operativo, priorità e coordinamento.",
  },
  {
    id: "stratega",
    name: "Agente Stratega",
    role: "Definisce la direzione del progetto.",
    avatar: strategaImg,
    color: "from-violet-500 to-fuchsia-500",
    collaborates: "Validatore + Project Manager",
    produces: "Visione, obiettivo e priorità.",
  },
  {
    id: "validatore",
    name: "Agente Validatore",
    role: "Mette alla prova l'idea.",
    avatar: validatoreImg,
    color: "from-fuchsia-500 to-pink-500",
    collaborates: "Stratega + Ricercatore",
    produces: "Criticità, conferme e punti deboli.",
  },
  {
    id: "ricercatore",
    name: "Agente Ricercatore",
    role: "Cerca esempi, competitor e segnali utili.",
    avatar: ricercatoreImg,
    color: "from-blue-500 to-cyan-400",
    collaborates: "Validatore + Project Manager",
    produces: "Dati, riferimenti e spunti di mercato.",
  },
  {
    id: "mvp",
    name: "Agente MVP",
    role: "Riduce l'idea alla prima versione.",
    avatar: mvpImg,
    color: "from-purple-500 to-fuchsia-500",
    collaborates: "Project Manager + Agente UX",
    produces: "Funzioni essenziali e roadmap iniziale.",
  },
  {
    id: "ux",
    name: "Agente UX",
    role: "Disegna l'esperienza dell'utente.",
    avatar: uxImg,
    color: "from-pink-500 to-violet-500",
    collaborates: "Agente MVP + Agente Costruttore",
    produces: "Schermate, flussi e struttura utente.",
  },
  {
    id: "architetto-dati",
    name: "Agente Architetto Dati",
    role: "Organizza dati e informazioni.",
    avatar: architettoDatiImg,
    color: "from-blue-500 to-violet-500",
    collaborates: "Agente Costruttore + Agente Sicurezza",
    produces: "Struttura dati, tabelle e relazioni.",
  },
  {
    id: "istruttore",
    name: "Agente Istruttore",
    role: "Prepara le istruzioni operative.",
    avatar: istruttoreImg,
    color: "from-violet-500 to-fuchsia-500",
    collaborates: "Project Manager + Agente Costruttore",
    produces: "Istruzioni, prompt e comandi operativi.",
  },
  {
    id: "costruttore",
    name: "Agente Costruttore",
    role: "Guida la costruzione della prima versione.",
    avatar: costruttoreImg,
    color: "from-violet-500 to-cyan-400",
    collaborates: "Agente UX + Architetto Dati + Istruttore",
    produces: "Struttura operativa della prima versione.",
  },
  {
    id: "controllo-qualita",
    name: "Agente Controllo Qualità",
    role: "Controlla errori, bug e punti deboli.",
    avatar: controlloQualitaImg,
    color: "from-fuchsia-500 to-purple-500",
    collaborates: "Agente Costruttore + Agente UX",
    produces: "Checklist, correzioni e miglioramenti.",
  },
  {
    id: "sicurezza",
    name: "Agente Sicurezza",
    role: "Controlla permessi, accessi e dati sensibili.",
    avatar: sicurezzaImg,
    color: "from-blue-500 to-violet-500",
    badge: "shield",
    collaborates: "Architetto Dati + Project Manager",
    produces: "Controlli su accessi, permessi e protezione dati.",
  },
  {
    id: "lancio",
    name: "Agente Lancio",
    role: "Prepara l'app per essere presentata o venduta.",
    avatar: lancioImg,
    color: "from-fuchsia-500 to-orange-400",
    collaborates: "Agente Stratega + Project Manager",
    produces: "Messaggio, landing e primi passi di lancio.",
  },
];

const MATCHERS: Array<{ id: string; re: RegExp }> = [
  { id: "project-manager", re: /product\s*manager|project\s*manager|\bpm\b/i },
  { id: "stratega", re: /stratega|strateg/i },
  { id: "validatore", re: /validator|validat|critic/i },
  { id: "ricercatore", re: /ricercatore|research|business\s*analyst/i },
  { id: "mvp", re: /mvp/i },
  { id: "ux", re: /\bux\b|design|interfac/i },
  { id: "architetto-dati", re: /database|db\b|data\s*planner|architetto/i },
  { id: "istruttore", re: /prompt|istrutt|instruct/i },
  { id: "costruttore", re: /lovable|builder|build|costruttor/i },
  { id: "controllo-qualita", re: /test|qa\b|quality|qualit/i },
  { id: "sicurezza", re: /security|sicurezza|supabase|backend|auth|rls/i },
  { id: "lancio", re: /launch|lancio|go\s*live/i },
];

export function resolveAgentIdentity(name: string, role?: string | null): AgentIdentity {
  const haystack = `${name ?? ""} ${role ?? ""}`;
  for (const m of MATCHERS) {
    if (m.re.test(haystack)) {
      const id = AGENT_IDENTITIES.find((a) => a.id === m.id);
      if (id) return id;
    }
  }
  // Fallback: synthetic identity with project-manager-style coordinator avatar removed.
  return {
    id: "generic",
    name: name || "Agente",
    role: role || "Parte operativa del Team AI.",
    avatar: istruttoreImg,
    color: "from-violet-500 to-fuchsia-500",
    collaborates: "Project Manager",
    produces: "Contributo specifico al flusso operativo.",
  };
}

export function isProjectManagerIdentity(name: string, role?: string | null) {
  return /product\s*manager|project\s*manager|\bpm\b/i.test(`${name ?? ""} ${role ?? ""}`);
}
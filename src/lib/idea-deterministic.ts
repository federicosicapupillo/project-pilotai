// Deterministic, idea-stable estimates.
// Same normalized idea text -> always the same tier, potential, cost, difficulty, hours.

export type IdeaTier = "semplice" | "media" | "avanzata" | "marketplace";

const STOP_WORDS = new Set([
  "il","lo","la","i","gli","le","un","uno","una","di","a","da","in","con","su",
  "per","tra","fra","e","ed","o","od","ma","che","chi","cui","mi","ti","si","ci","vi",
  "del","della","dei","degli","delle","dal","dalla","nel","nella","sul","sulla",
  "al","alla","all","dell","sull","nell","quest","questa","questo","mio","mia",
  "permetta","permette","vorrei","voglio","fare","fai","sia","essere","app","applicazione",
]);

export function normalizeIdea(raw: string): string {
  return (raw || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s]/g, " ")                     // strip punctuation
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .join(" ");
}

// FNV-1a 32-bit hash -> base36 string
export function hashIdea(raw: string): string {
  const s = normalizeIdea(raw);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
}

const MARKETPLACE_KW = [
  "marketplace","piattaforma","annunci","annuncio","candidatur",
  "due tipologie","due tipi di utent","venditori e compratori","venditor",
  "host e ospiti","recensioni","chat tra utent","admin","matching",
  "domanda e offerta","compratori",
];
const ADVANCED_KW = [
  "pagament","stripe","abbonament","notifich","whatsapp","telegram",
  "calendario","prenotazion","api ester","ruoli utent","ai integrat",
  "intelligenza artificiale","automazion","openai","machine learning",
  "gpt","chatbot","crm","erp","gestional","dashboard","saas","b2b",
];
const MEDIUM_KW = [
  "login","registrazion","account","utenti","area utente","area riservat",
  "database","storico","profilo","preferiti","salva","carrello",
  "filtri","ricerca avanzat","upload","report",
];

export function classifyIdeaTier(idea: string, target = ""): IdeaTier {
  const t = normalizeIdea(`${idea} ${target}`);
  if (MARKETPLACE_KW.some((k) => t.includes(k))) return "marketplace";
  if (ADVANCED_KW.some((k) => t.includes(k))) return "avanzata";
  if (MEDIUM_KW.some((k) => t.includes(k))) return "media";
  // Length-based fallback: very short / utility ideas stay semplice
  if (t.split(" ").length <= 6) return "semplice";
  return "media";
}

export function tierPotential(tier: IdeaTier): { amount: string } {
  switch (tier) {
    case "marketplace": return { amount: "Fino a 10.000€/mese" };
    case "avanzata":    return { amount: "Fino a 8.000€/mese" };
    case "media":       return { amount: "Fino a 3.000€/mese" };
    case "semplice":    return { amount: "Fino a 1.000€/mese" };
  }
}

export function tierCost(tier: IdeaTier): { amount: string } {
  switch (tier) {
    case "marketplace": return { amount: "Fino a 30.000€" };
    case "avanzata":    return { amount: "Fino a 15.000€" };
    case "media":       return { amount: "Fino a 8.000€" };
    case "semplice":    return { amount: "Fino a 3.000€" };
  }
}

export function tierHours(tier: IdeaTier): string {
  switch (tier) {
    case "marketplace": return "25 - 40 ore guidate";
    case "avanzata":    return "15 - 25 ore guidate";
    case "media":       return "8 - 14 ore guidate";
    case "semplice":    return "4 - 8 ore guidate";
  }
}

export function tierDifficultyLabel(tier: IdeaTier): "Facile" | "Medio" | "Avanzato" {
  switch (tier) {
    case "semplice": return "Facile";
    case "media":    return "Medio";
    case "avanzata":
    case "marketplace": return "Avanzato";
  }
}

export function tierDifficultyReason(tier: IdeaTier): string {
  switch (tier) {
    case "semplice":
      return "Poche schermate, nessun login complesso, nessun pagamento o integrazione esterna avanzata.";
    case "media":
      return "Richiede login, database, area utente e gestione di dati persistenti.";
    case "avanzata":
      return "Include funzioni come pagamenti, notifiche, AI o API esterne che alzano la complessità.";
    case "marketplace":
      return "Due o più tipologie di utenti, annunci, chat, recensioni e dashboard multiple.";
  }
}

// localStorage cache for AI summaries by normalized idea hash.
const SUMMARY_CACHE_PREFIX = "idea_summary_v1:";

export function loadCachedSummary<T>(ideaHash: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_PREFIX + ideaHash);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

export function saveCachedSummary<T>(ideaHash: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SUMMARY_CACHE_PREFIX + ideaHash, JSON.stringify(value));
  } catch { /* quota - ignore */ }
}
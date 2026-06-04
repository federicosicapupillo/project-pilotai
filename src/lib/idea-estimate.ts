export type Difficulty = "Semplice" | "Media" | "Avanzata" | "Complessa";

export type RevenueModel =
  | "Non lo so ancora"
  | "Abbonamento"
  | "Vendita una tantum"
  | "Commissione"
  | "Lead generation"
  | "Servizio premium"
  | "Uso interno per risparmiare tempo"
  | "Licenza B2B"
  | "Altro";

export type PriceBand =
  | "Non lo so"
  | "9€–29€"
  | "49€–97€"
  | "197€–497€"
  | "500€+"
  | "Abbonamento mensile";

export type BudgetBand =
  | ""
  | "0€ – 100€"
  | "100€ – 300€"
  | "300€ – 700€"
  | "700€ – 1.500€"
  | "1.500€ – 3.000€"
  | "3.000€+"
  | "Non lo so ancora";

export const BUDGET_OPTIONS: { label: Exclude<BudgetBand, "">; display: string; min: number; max: number }[] = [
  { label: "100€ – 300€",      display: "100–300 €",      min: 100,  max: 300 },
  { label: "300€ – 700€",      display: "300–700 €",      min: 300,  max: 700 },
  { label: "700€ – 1.500€",    display: "700–1.500 €",    min: 700,  max: 1500 },
  { label: "1.500€ – 3.000€",  display: "1.500–3.000 €",  min: 1500, max: 3000 },
  { label: "3.000€+",          display: "3.000 €+",       min: 3000, max: 6000 },
  { label: "Non lo so ancora", display: "Non lo so ancora", min: 0,    max: 0 },
];

export function getBudget(band: BudgetBand) {
  return BUDGET_OPTIONS.find((b) => b.label === band) ?? null;
}

export const fmt = (n: number) => n.toLocaleString("it-IT") + "€";

export type Estimate = {
  hoursLow: number;
  hoursHigh: number;
  difficulty: Difficulty;
  projectType: string;
  costAiLow: number;
  costAiHigh: number;
  costAgencyLow: number;
  costAgencyHigh: number;
  monthlyLow: number;
  monthlyHigh: number;
  tools: string[];
  monthlyCategories: string[];
  potentialLow: number;
  potentialHigh: number;
  potentialLabel: "Basso" | "Medio" | "Alto";
  revenueIdeas: string[];
  signals: { ai: boolean; payments: boolean; chat: boolean; notifications: boolean; media: boolean; marketplace: boolean };
  costMinLow: number; costMinHigh: number;
  costRecLow: number; costRecHigh: number;
  monthlyEssLow: number; monthlyEssHigh: number;
  monthlyFullLow: number; monthlyFullHigh: number;
  scenarios: {
    prudent:    { customers: number; price: number; revenue: number };
    realistic:  { customers: number; price: number; revenue: number };
    ambitious:  { customers: number; price: number; revenue: number };
  };
};

const COMPLEXITY_KEYWORDS = [
  "marketplace", "pagament", "stripe", "chat", "notific", "twilio", "login",
  "ruoli", "ruolo utent", "database", "dashboard", "ai", "intelligenza",
  "mappa", "geolocal", "calendar", "prenotaz", "recension", "abbonament",
  "area riservata", "upload", "automaz", "api", "multiutente", "admin",
];

export function classify(
  idea: string,
  target: string,
  revenue: RevenueModel,
  price: PriceBand,
): Estimate {
  const t = (idea + " " + target).toLowerCase();
  const has = (...kws: string[]) => kws.some((k) => t.includes(k));

  let projectType = "Web app";
  if (has("landing", "lancio", "waitlist", "pre-order")) projectType = "Landing page";
  else if (has("crm", "clienti", "lead", "pipeline")) projectType = "CRM";
  else if (has("gestionale", "magazzino", "fatture")) projectType = "Gestionale";
  else if (has("dashboard", "analytics", "kpi", "metric")) projectType = "Dashboard";
  else if (has("marketplace", "venditori", "annunci")) projectType = "Marketplace";
  else if (has("ai", "intelligenza", "gpt", "agente", "chatbot")) projectType = "App con AI";
  else if (has("interna", "team", "azienda")) projectType = "App interna";

  const signals = {
    ai: has("ai", "intelligenza", "gpt", "agente", "chatbot", "automaz"),
    payments: has("pagament", "stripe", "abbonament", "subscription", "vendi", "checkout"),
    chat: has("chat", "messaggi", "realtime"),
    notifications: has("notific", "twilio", "sms", "whatsapp", "email transactional"),
    media: has("video", "audio", "voce", "immagin", "midjourney", "elevenlabs", "canva"),
    marketplace: has("marketplace", "venditori"),
  };
  const heavyCount = COMPLEXITY_KEYWORDS.filter((k) => t.includes(k)).length;
  const length = t.trim().length;

  let difficulty: Difficulty = "Media";
  if (heavyCount >= 5 || length > 900) difficulty = "Complessa";
  else if (heavyCount >= 3 || length > 500) difficulty = "Avanzata";
  else if (heavyCount === 0 && length < 120) difficulty = "Semplice";

  type Range = [number, number];
  const profile: Record<string, { hours: Range; costAi: Range; monthly: Range }> = {
    "Landing page":   { hours: [6, 14],   costAi: [0, 150],     monthly: [10, 50] },
    "Web app":        { hours: [20, 36],  costAi: [150, 500],   monthly: [30, 150] },
    "CRM":            { hours: [24, 40],  costAi: [200, 800],   monthly: [50, 250] },
    "Dashboard":      { hours: [28, 48],  costAi: [250, 1000],  monthly: [50, 300] },
    "Gestionale":     { hours: [30, 50],  costAi: [250, 1000],  monthly: [50, 300] },
    "Marketplace":    { hours: [45, 90],  costAi: [500, 2000],  monthly: [100, 500] },
    "App interna":    { hours: [18, 32],  costAi: [150, 600],   monthly: [30, 150] },
    "App con AI":     { hours: [30, 55],  costAi: [400, 1500],  monthly: [100, 400] },
  };
  const base = profile[projectType] ?? profile["Web app"];

  const mult =
    difficulty === "Complessa" ? 1.7 :
    difficulty === "Avanzata"  ? 1.35 :
    difficulty === "Semplice"  ? 0.7 : 1;

  const hoursLow  = Math.max(4, Math.round((base.hours[0] * mult) / 2) * 2);
  const hoursHigh = Math.max(hoursLow + 4, Math.round((base.hours[1] * mult) / 2) * 2);

  let costAiLow  = Math.round(base.costAi[0] * mult);
  let costAiHigh = Math.round(base.costAi[1] * mult);
  let monthlyLow  = base.monthly[0];
  let monthlyHigh = base.monthly[1];

  if (signals.payments) { monthlyLow += 20; monthlyHigh += 80; }
  if (signals.notifications) { monthlyLow += 15; monthlyHigh += 100; }
  if (signals.ai) { monthlyLow += 20; monthlyHigh += 150; costAiHigh += 200; }
  if (signals.chat) { monthlyHigh += 80; }
  if (signals.media) { monthlyHigh += 120; }

  const costAgencyLow  = Math.max(1500, costAiLow * 8);
  const costAgencyHigh = Math.max(5000, costAiHigh * 15);

  const tools = new Set<string>(["ChatGPT", "Lovable", "Perplexity"]);
  if (projectType !== "Landing page") tools.add("Supabase");
  if (difficulty === "Avanzata" || difficulty === "Complessa") tools.add("Antigravity");
  tools.add("GitHub");
  if (signals.payments) tools.add("Stripe");
  if (signals.notifications) tools.add("Twilio");
  if (signals.media) { tools.add("Canva"); tools.add("ElevenLabs"); tools.add("Runway"); }

  const monthlyCategories = [
    "Piattaforma AI/no-code",
    projectType !== "Landing page" ? "Database/backend" : null,
    "Dominio",
    "Email / notifiche",
    signals.ai ? "API AI" : null,
    signals.payments ? "Pagamenti online" : null,
    signals.notifications ? "SMS / WhatsApp" : null,
    signals.media ? "Strumenti media" : null,
    "Traffico / promozione",
  ].filter(Boolean) as string[];

  let potentialLow = 200;
  let potentialHigh = 1500;
  if (projectType === "Marketplace") { potentialLow = 500; potentialHigh = 8000; }
  else if (projectType === "CRM" || projectType === "App con AI" || projectType === "Gestionale") { potentialLow = 500; potentialHigh = 5000; }
  else if (projectType === "Dashboard" || projectType === "Web app") { potentialLow = 300; potentialHigh = 3000; }
  else if (projectType === "Landing page") { potentialLow = 100; potentialHigh = 1000; }
  if (revenue === "Abbonamento" || price === "Abbonamento mensile") potentialHigh = Math.round(potentialHigh * 1.4);
  if (revenue === "Licenza B2B" || price === "500€+") { potentialLow = Math.round(potentialLow * 1.5); potentialHigh = Math.round(potentialHigh * 1.6); }
  if (revenue === "Uso interno per risparmiare tempo") { potentialLow = 0; potentialHigh = Math.max(500, potentialHigh / 3); }

  const potentialLabel: "Basso" | "Medio" | "Alto" =
    potentialHigh >= 4000 ? "Alto" : potentialHigh >= 1500 ? "Medio" : "Basso";

  const costMinLow  = Math.max(50,  Math.round(costAiLow * 0.5));
  const costMinHigh = Math.max(150, Math.round(costAiLow * 1.0));
  const costRecLow  = costAiLow;
  const costRecHigh = costAiHigh;

  const monthlyEssLow  = Math.max(15, Math.round(monthlyLow * 0.5));
  const monthlyEssHigh = Math.max(40, Math.round(monthlyHigh * 0.45));
  const monthlyFullLow  = monthlyLow;
  const monthlyFullHigh = monthlyHigh;

  let p1 = 29, p2 = 49, p3 = 97;
  if (price === "9€–29€") { p1 = 19; p2 = 29; p3 = 39; }
  else if (price === "49€–97€") { p1 = 39; p2 = 59; p3 = 97; }
  else if (price === "197€–497€") { p1 = 97; p2 = 197; p3 = 297; }
  else if (price === "500€+") { p1 = 197; p2 = 297; p3 = 497; }
  else if (price === "Abbonamento mensile") { p1 = 19; p2 = 29; p3 = 49; }

  let c1 = 10, c2 = 50, c3 = 150;
  if (projectType === "Marketplace") { c1 = 20; c2 = 100; c3 = 400; }
  else if (projectType === "App con AI") { c1 = 15; c2 = 70; c3 = 250; }
  else if (projectType === "Landing page") { c1 = 5; c2 = 25; c3 = 80; }
  else if (projectType === "App interna") { c1 = 1; c2 = 3; c3 = 8; }
  else if (projectType === "CRM" || projectType === "Gestionale" || projectType === "Dashboard") { c1 = 8; c2 = 30; c3 = 100; }

  const scenarios = {
    prudent:   { customers: c1, price: p1, revenue: c1 * p1 },
    realistic: { customers: c2, price: p2, revenue: c2 * p2 },
    ambitious: { customers: c3, price: p3, revenue: c3 * p3 },
  };

  const revenueIdeas: string[] = [];
  if (revenue !== "Non lo so ancora" && revenue !== "Altro") revenueIdeas.push(revenue);
  if (projectType === "Marketplace") revenueIdeas.push("Commissione su transazioni");
  if (projectType === "CRM" || projectType === "Gestionale" || projectType === "Dashboard") {
    revenueIdeas.push("Abbonamento mensile");
    revenueIdeas.push("Licenza B2B");
  }
  if (projectType === "Landing page") revenueIdeas.push("Lead generation");
  if (projectType === "App con AI") { revenueIdeas.push("Abbonamento mensile"); revenueIdeas.push("Servizio premium"); }
  if (projectType === "App interna") revenueIdeas.push("Uso interno per risparmiare tempo");
  if (revenueIdeas.length === 0) revenueIdeas.push("Abbonamento mensile", "Vendita una tantum");

  return {
    hoursLow, hoursHigh, difficulty, projectType,
    costAiLow, costAiHigh, costAgencyLow, costAgencyHigh,
    monthlyLow, monthlyHigh,
    tools: Array.from(tools),
    monthlyCategories,
    potentialLow, potentialHigh, potentialLabel,
    revenueIdeas: Array.from(new Set(revenueIdeas)).slice(0, 3),
    signals,
    costMinLow, costMinHigh, costRecLow, costRecHigh,
    monthlyEssLow, monthlyEssHigh, monthlyFullLow, monthlyFullHigh,
    scenarios,
  };
}

// ===== Persistence helpers for the free summary flow =====

export const IDEA_STORAGE_KEY = "draft_idea_description";
export const IDEA_PARAMS_KEY = "draft_idea_params";

export type IdeaParams = {
  idea: string;
  budget: BudgetBand;
  target: string;
  revenue: RevenueModel;
  price: PriceBand;
};

export function saveIdeaParams(p: IdeaParams) {
  if (typeof window === "undefined") return;
  localStorage.setItem(IDEA_STORAGE_KEY, p.idea.trim());
  localStorage.setItem(IDEA_PARAMS_KEY, JSON.stringify(p));
}

export function loadIdeaParams(): IdeaParams | null {
  if (typeof window === "undefined") return null;
  const idea = (localStorage.getItem(IDEA_STORAGE_KEY) || "").trim();
  if (!idea) return null;
  const raw = localStorage.getItem(IDEA_PARAMS_KEY);
  if (raw) {
    try {
      const p = JSON.parse(raw) as IdeaParams;
      return { ...p, idea: p.idea?.trim() || idea };
    } catch { /* ignore */ }
  }
  return { idea, budget: "", target: "", revenue: "Non lo so ancora", price: "Non lo so" };
}

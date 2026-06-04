import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  budget: z.string().max(60).optional().default(""),
  sector: z.string().max(100).optional().default(""),
  appType: z.string().max(100).optional().default(""),
  complexity: z.string().max(40).optional().default(""),
  goal: z.string().max(120).optional().default(""),
  interests: z.string().max(400).optional().default(""),
});

const textField = z.preprocess((value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}, z.string());

const stringList = z.preprocess((value) => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string") return value.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean);
  return [];
}, z.array(z.string()));

const IdeaSchema = z.object({
  name: textField,
  description: textField,
  target: textField,
  problem: textField,
  why_interesting: textField,
  mvp: textField,
  essential_features: stringList,
  do_not_build_yet: stringList,
  hours_estimate: textField,
  difficulty: textField,
  initial_cost: textField,
  monthly_cost: textField,
  budget_fit: textField,
  budget_note: textField,
  potential: textField,
  revenue_model: textField,
  suggested_price: textField,
  earning_range: textField,
  scenario_prudent: textField,
  scenario_realistic: textField,
  scenario_high: textField,
  break_even: textField,
  commercial_risk: textField,
  earning_explanation: textField,
  tools: stringList,
  agents: stringList,
  main_risk: textField,
  next_step: textField,
});

const OutputSchema = z.object({
  ideas: z.array(IdeaSchema).default([]),
});

export type GeneratedIdea = z.infer<typeof IdeaSchema>;

const SYSTEM_PROMPT = `Agisci come Product Manager, Business Strategist e Ideatore di prodotti digitali AI/no-code.
Devi generare idee di app realistiche, costruibili e potenzialmente vendibili.
Non generare idee troppo generiche.
Non generare "il nuovo Uber", "il nuovo Airbnb", "il social definitivo".
Non promettere guadagni garantiti.
Genera idee adatte a una prima versione funzionante costruibile con strumenti AI/no-code (Lovable, Supabase, ChatGPT, Stripe, ecc.).
Le idee devono essere: specifiche, semplici da capire, realizzabili, monetizzabili, adatte a un percorso guidato AI/no-code.
Rispondi sempre in italiano.`;

const FALLBACK_TOOLS = ["ChatGPT", "Lovable", "Supabase", "Perplexity", "Stripe"];
const FALLBACK_AGENTS = ["Agente Stratega", "Agente Product Manager", "Agente Prompt Engineer"];

function buildPrompt(d: z.infer<typeof InputSchema>) {
  return `Genera ESATTAMENTE 3 idee di app personalizzate per questo utente, COERENTI con il suo budget operativo.

IMPORTANTE — Budget: ${d.budget || "non specificato"}
Il budget indicato NON include il costo del corso. È solo budget operativo per costruire, testare e lanciare la prima versione funzionante (strumenti, dominio, database, API, contenuti, lancio).

Regole budget (rispettale rigorosamente):
- 0€–100€: solo landing page, form raccolta contatti, mini dashboard manuale, strumenti interni semplici, validazione idea senza backend complesso. EVITA marketplace, chat, pagamenti, AI avanzata, notifiche SMS, app multiutente complesse.
- 100€–300€: landing con form, dashboard base, archivio dati semplice, mini CRM, tool interno, prototipo con login semplice.
- 300€–700€: CRM verticale, gestionale semplice, dashboard con database, area riservata, raccolta richieste, workflow guidato.
- 700€–1.500€: marketplace leggero, app con ruoli utenti, database strutturato, dashboard amministrativa, integrazioni semplici, primo sistema di pagamento se davvero necessario.
- 1.500€–3.000€: app con login/ruoli/dashboard/pagamenti, CRM avanzato, marketplace prima versione, app B2B verticale, integrazioni Stripe/Twilio/API esterne se necessarie.
- 3.000€+: marketplace verticale, SaaS B2B, app con AI, automazioni, notifiche, pagamenti, pannello admin avanzato.
- "Non lo so ancora" o vuoto: assumi 300€–700€.

Se un'idea è naturalmente più ambiziosa del budget, NON eliminarla: proponi una versione SEMPLIFICATA compatibile (es. "Con questo budget meglio iniziare con landing + raccolta richieste + dashboard manuale, non marketplace completo").

Non promettere guadagni garantiti, idee originali garantite, business automatico.

Dati utente:
- Budget operativo: ${d.budget || "non specificato"}
- Settore: ${d.sector || "non specificato"}
- Tipo app desiderata: ${d.appType || "non specificato"}
- Livello complessità: ${d.complexity || "non specificato"}
- Obiettivo principale: ${d.goal || "non specificato"}
- Interessi/competenze: ${d.interests || "non specificati"}

Per ogni idea restituisci nello schema JSON:
- name: nome provvisorio dell'app, breve e memorabile
- description: descrizione semplice (1-2 frasi)
- target: a chi è rivolta
- problem: problema concreto che risolve
- why_interesting: perché potrebbe essere interessante (1 frase)
- mvp: prima versione funzionante (cosa contiene il primo rilascio)
- essential_features: 4-6 funzioni essenziali
- do_not_build_yet: 3-5 cose da NON costruire subito per restare nel budget
- hours_estimate: stima in ore (es. "40-80 ore")
- difficulty: "Semplice" | "Media" | "Avanzata" | "Complessa"
- initial_cost: costo indicativo iniziale con metodo AI/no-code (es. "500€-2.000€")
- monthly_cost: costi mensili possibili (es. "50€-250€/mese")
- budget_fit: ESATTAMENTE uno tra "Dentro il budget" | "Al limite del budget" | "Fuori budget, da semplificare"
- budget_note: 1 frase che spiega la scelta e, se fuori budget, come semplificare
- potential: potenziale economico indicativo (es. "Medio/alto se validato su nicchia locale")
- revenue_model: modello di ricavo consigliato (1-2 ipotesi)
- suggested_price: prezzo consigliato concreto (es. "29€/mese", "97€ una tantum", "commissione 8%", "lead a 25€")
- earning_range: range guadagno mensile indicativo, scegliere tra "0€ – 300€/mese", "300€ – 1.000€/mese", "1.000€ – 3.000€/mese", "3.000€ – 10.000€/mese", "10.000€+/mese". Per tool interni usa formula "Risparmio: X€/mese".
- scenario_prudente IGNORARE — usa scenario_prudent
- scenario_prudent: scenario prudente con formula concreta, es. "10 clienti x 29€/mese = 290€/mese"
- scenario_realistic: scenario realistico, es. "50 clienti x 29€/mese = 1.450€/mese"
- scenario_high: scenario alto (solo se progetto validato), es. "150 clienti x 29€/mese = 4.350€/mese"
- break_even: punto di pareggio calcolato come (costo iniziale / prezzo) = N clienti/mensilità. Es. "Con 700€ di costo iniziale e prezzo 29€/mese servono ~24 clienti per rientrare."
- commercial_risk: ESATTAMENTE "Basso" | "Medio" | "Alto"
- earning_explanation: 1-2 frasi che spiegano la stima e i fattori chiave (target, vendita, traffico necessario)
- tools: 3-6 strumenti consigliati tra: ChatGPT, Lovable, Supabase, Perplexity, Antigravity, GitHub, Stripe, Twilio, Canva, ElevenLabs, Runway
- agents: 3-5 agenti AI consigliati (es. "Agente Stratega", "Agente Product Manager", "Agente Prompt Engineer")
- main_risk: rischio principale da considerare
- next_step: prossimo step concreto per partire

Logica stima guadagno (rispettala):
- Landing page semplice: 0€ – 500€/mese (lead/servizi), rischio Basso/Medio.
- Tool interno: guadagno diretto basso, usa earning_range come "Risparmio: …€/mese", rischio Basso.
- CRM/dashboard per professionisti: 300€ – 3.000€/mese, rischio Medio.
- Gestionale verticale B2B: 1.000€ – 10.000€/mese, rischio Medio.
- Marketplace: 3.000€ – 20.000€+/mese, rischio Alto (serve massa critica).
- App consumer: variabile, rischio Alto.
- App con AI: medio/alto, rischio Medio (valuta costi API).
Stime SEMPRE prudenti, mai promesse. Non scrivere "guadagnerai", usa "potresti", "indicativamente".

Le 3 idee devono essere DIVERSE tra loro per angolo di attacco o modello di business.`;
}

function extractJsonObject(text: string) {
  const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function fallbackIdeas(d: z.infer<typeof InputSchema>): GeneratedIdea[] {
  const sector = d.sector && d.sector !== "Non lo so" ? d.sector : "servizi locali";
  const goal = d.goal && d.goal !== "Non lo so" ? d.goal : "validare un prodotto semplice";
  const appType = d.appType && d.appType !== "Non lo so" ? d.appType : "app operativa";

  return [
    {
      name: `Assistente ${sector}`,
      description: `Una ${appType.toLowerCase()} che aiuta professionisti nel settore ${sector} a gestire richieste, follow-up e contenuti con AI.`,
      target: `Freelance, piccoli team e attività nel settore ${sector}`,
      problem: "Molte attività ripetitive vengono ancora gestite manualmente e fanno perdere opportunità.",
      why_interesting: `È adatta a partire piccolo e misurare subito l'interesse del mercato.` ,
      mvp: "Landing, form raccolta richieste, dashboard semplice, generazione AI di bozze e archivio contatti.",
      essential_features: ["Raccolta richieste", "Dashboard contatti", "Generazione testi AI", "Stato opportunità", "Report base"],
      do_not_build_yet: ["Pagamenti online", "App mobile nativa", "Sistema multi-ruolo complesso", "Notifiche push avanzate"],
      hours_estimate: "35-70 ore",
      difficulty: "Media",
      initial_cost: "500€-2.000€",
      monthly_cost: "50€-250€/mese",
      budget_fit: "Dentro il budget",
      budget_note: "Versione semplificata pensata per restare nei costi operativi tipici di un MVP AI/no-code.",
      potential: "Medio se validato su una nicchia concreta",
      revenue_model: "Abbonamento mensile o setup iniziale + canone",
      suggested_price: "29€/mese",
      earning_range: "300€ – 1.000€/mese",
      scenario_prudent: "10 clienti x 29€/mese = 290€/mese",
      scenario_realistic: "30 clienti x 29€/mese = 870€/mese",
      scenario_high: "70 clienti x 29€/mese = 2.030€/mese (solo se validato)",
      break_even: "Con 1.000€ di costo iniziale e 29€/mese servono ~35 clienti per rientrare.",
      commercial_risk: "Medio",
      earning_explanation: "Stima basata su abbonamento venduto a una nicchia di professionisti. Il risultato dipende da acquisizione e retention dei primi clienti.",
      tools: FALLBACK_TOOLS,
      agents: FALLBACK_AGENTS,
      main_risk: "Partire con un target troppo largo invece di una nicchia precisa.",
      next_step: `Intervista 5 persone nel settore ${sector} e verifica se pagherebbero per risolvere questo problema.`,
    },
    {
      name: `MVP Validator ${sector}`,
      description: `Uno strumento che trasforma idee grezze in test di mercato rapidi per chi vuole ${goal.toLowerCase()}.`,
      target: "Creator, consulenti e founder non tecnici",
      problem: "Molte idee vengono costruite prima di essere validate con utenti reali.",
      why_interesting: "Riduce sprechi di tempo e rende il lancio più ordinato.",
      mvp: "Questionario guidato, generatore di landing, lista esperimenti e dashboard risultati.",
      essential_features: ["Questionario idea", "Generazione proposta", "Esperimenti suggeriti", "Metriche base", "Export report"],
      do_not_build_yet: ["Community interna", "Pagamenti ricorrenti complessi", "Integrazioni avanzate", "Mobile app"],
      hours_estimate: "45-90 ore",
      difficulty: "Media",
      initial_cost: "700€-2.500€",
      monthly_cost: "80€-300€/mese",
      budget_fit: "Al limite del budget",
      budget_note: "Se il budget è basso, partire solo con questionario + landing manuale, senza dashboard avanzata.",
      potential: "Buono se venduto come tool + servizio guidato",
      revenue_model: "Licenza mensile, pacchetto premium o consulenza abbinata",
      suggested_price: "49€/mese o 297€ pacchetto",
      earning_range: "300€ – 3.000€/mese",
      scenario_prudent: "15 clienti x 49€/mese = 735€/mese",
      scenario_realistic: "40 clienti x 49€/mese = 1.960€/mese",
      scenario_high: "100 clienti x 49€/mese = 4.900€/mese (solo se validato)",
      break_even: "Con 1.500€ di costo iniziale e 49€/mese servono ~31 clienti per rientrare.",
      commercial_risk: "Medio",
      earning_explanation: "Il guadagno dipende dalla capacità di posizionarlo come tool + servizio guidato, non come semplice software.",
      tools: ["ChatGPT", "Lovable", "Supabase", "Canva", "Stripe"],
      agents: ["Agente Stratega", "Agente Marketing", "Agente Product Manager"],
      main_risk: "Generare report utili ma non abbastanza specifici per convincere al pagamento.",
      next_step: "Definisci una nicchia e crea 3 test di validazione da proporre entro 7 giorni.",
    },
    {
      name: `Ops Pilot ${sector}`,
      description: `Una mini-dashboard interna per automatizzare un flusso operativo specifico in ambito ${sector}.`,
      target: "Piccole aziende e team operativi",
      problem: "I processi sono spesso sparsi tra chat, fogli di calcolo e note non sincronizzate.",
      why_interesting: "Ha valore immediato perché fa risparmiare tempo in un processo reale.",
      mvp: "Login, database attività, automazioni base, notifiche e vista avanzamento.",
      essential_features: ["Login", "Gestione attività", "Automazioni base", "Notifiche", "Vista calendario"],
      do_not_build_yet: ["Pannello admin avanzato", "Multi-tenant", "Integrazioni custom", "Reportistica BI"],
      hours_estimate: "50-100 ore",
      difficulty: "Avanzata",
      initial_cost: "1.000€-3.500€",
      monthly_cost: "100€-400€/mese",
      budget_fit: "Fuori budget, da semplificare",
      budget_note: "Con budget contenuto meglio partire da un solo processo automatizzato, senza ruoli e notifiche SMS.",
      potential: "Medio/alto se collegato a un problema costoso per aziende",
      revenue_model: "Setup B2B + canone mensile",
      suggested_price: "297€ setup + 97€/mese",
      earning_range: "1.000€ – 3.000€/mese",
      scenario_prudent: "8 clienti B2B x 97€/mese = 776€/mese",
      scenario_realistic: "20 clienti B2B x 97€/mese = 1.940€/mese",
      scenario_high: "50 clienti B2B x 97€/mese = 4.850€/mese (solo se validato)",
      break_even: "Con 2.000€ di costo iniziale e 97€/mese servono ~21 clienti per rientrare.",
      commercial_risk: "Medio",
      earning_explanation: "Vendita B2B con ciclo più lungo: pochi clienti possono già dare ricavi interessanti, ma serve attività commerciale costante.",
      tools: ["Lovable", "Supabase", "ChatGPT", "GitHub", "Twilio"],
      agents: ["Agente Product Manager", "Agente Backend", "Agente QA"],
      main_risk: "Sottovalutare permessi, dati e sicurezza nella versione B2B.",
      next_step: "Scegli un solo processo operativo da automatizzare e disegnane il flusso end-to-end.",
    },
  ];
}

function normalizeIdeas(value: unknown, data: z.infer<typeof InputSchema>) {
  const parsed = OutputSchema.safeParse(value);
  const baseIdeas = parsed.success ? parsed.data.ideas : [];
  const ideas = [...baseIdeas, ...fallbackIdeas(data)].slice(0, 3);

  return ideas.map((idea, index) => ({
    ...idea,
    name: idea.name || `Idea ${index + 1}`,
    description: idea.description || "Idea di app AI/no-code da validare con una prima versione funzionante.",
    target: idea.target || "Utenti di una nicchia specifica da validare",
    problem: idea.problem || "Problema operativo o commerciale da rendere più semplice.",
    why_interesting: idea.why_interesting || "Può partire come MVP leggero e crescere dopo la validazione.",
    mvp: idea.mvp || "Landing, flusso principale, database e dashboard base.",
    essential_features: idea.essential_features.length ? idea.essential_features : ["Landing", "Form", "Dashboard", "Database", "Report base"],
    do_not_build_yet: idea.do_not_build_yet.length ? idea.do_not_build_yet : ["Funzioni avanzate", "Integrazioni complesse", "App mobile nativa"],
    hours_estimate: idea.hours_estimate || "40-80 ore",
    difficulty: idea.difficulty || "Media",
    initial_cost: idea.initial_cost || "500€-2.000€",
    monthly_cost: idea.monthly_cost || "50€-250€/mese",
    budget_fit: idea.budget_fit || "Al limite del budget",
    budget_note: idea.budget_note || "Stima indicativa: adatta scope e strumenti al budget reale.",
    potential: idea.potential || "Medio se validata su una nicchia concreta",
    revenue_model: idea.revenue_model || "Abbonamento, setup o vendita una tantum",
    tools: idea.tools.length ? idea.tools : FALLBACK_TOOLS,
    agents: idea.agents.length ? idea.agents : FALLBACK_AGENTS,
    main_risk: idea.main_risk || "Costruire troppo prima di aver validato il problema.",
    next_step: idea.next_step || "Validare il problema con 5 potenziali utenti prima di costruire.",
  }));
}

export const generateAppIdeas = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY mancante");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    try {
      const { text } = await generateText({
        model,
        system: `${SYSTEM_PROMPT}\nRispondi solo con JSON valido. Nessun markdown, nessun testo fuori dal JSON.`,
        prompt: `${buildPrompt(data)}\n\nFormato obbligatorio: {"ideas":[{...},{...},{...}]}`,
      });

      return { ideas: normalizeIdeas(extractJsonObject(text), data) };
    } catch (error) {
      console.error("Idea generation failed", error);
      return { ideas: fallbackIdeas(data) };
    }
  });
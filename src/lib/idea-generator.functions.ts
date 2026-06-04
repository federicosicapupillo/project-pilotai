import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
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
  hours_estimate: textField,
  difficulty: textField,
  initial_cost: textField,
  monthly_cost: textField,
  potential: textField,
  revenue_model: textField,
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

function buildPrompt(d: z.infer<typeof InputSchema>) {
  return `Genera ESATTAMENTE 3 idee di app personalizzate per questo utente.

Dati utente:
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
- hours_estimate: stima in ore (es. "40-80 ore")
- difficulty: "Semplice" | "Media" | "Avanzata" | "Complessa"
- initial_cost: costo indicativo iniziale con metodo AI/no-code (es. "500€-2.000€")
- monthly_cost: costi mensili possibili (es. "50€-250€/mese")
- potential: potenziale economico indicativo (es. "Medio/alto se validato su nicchia locale")
- revenue_model: modello di ricavo consigliato (1-2 ipotesi)
- tools: 3-6 strumenti consigliati tra: ChatGPT, Lovable, Supabase, Perplexity, Antigravity, GitHub, Stripe, Twilio, Canva, ElevenLabs, Runway
- agents: 3-5 agenti AI consigliati (es. "Agente Stratega", "Agente Product Manager", "Agente Prompt Engineer")
- main_risk: rischio principale da considerare
- next_step: prossimo step concreto per partire

Le 3 idee devono essere DIVERSE tra loro per angolo di attacco o modello di business.`;
}

export const generateAppIdeas = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY mancante");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { object } = await generateObject({
      model,
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(data),
      schema: OutputSchema,
    });

    // Ensure we always return 3 ideas for the UI (pad or trim).
    const ideas = object.ideas.slice(0, 3);
    return { ideas };
  });
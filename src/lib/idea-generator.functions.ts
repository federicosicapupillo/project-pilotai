import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  sector: z.string().max(100).optional().default(""),
  appType: z.string().max(100).optional().default(""),
  complexity: z.string().max(40).optional().default(""),
  goal: z.string().max(120).optional().default(""),
  interests: z.string().max(400).optional().default(""),
});

const IdeaSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  target: z.string().default(""),
  problem: z.string().default(""),
  why_interesting: z.string().default(""),
  mvp: z.string().default(""),
  essential_features: z.array(z.string()).default([]),
  hours_estimate: z.string().default(""),
  difficulty: z.string().default(""),
  initial_cost: z.string().default(""),
  monthly_cost: z.string().default(""),
  potential: z.string().default(""),
  revenue_model: z.string().default(""),
  tools: z.array(z.string()).default([]),
  agents: z.array(z.string()).default([]),
  main_risk: z.string().default(""),
  next_step: z.string().default(""),
});

const OutputSchema = z.object({
  ideas: z.array(IdeaSchema).min(1).max(5),
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
      mode: "json",
    });

    // Ensure we always return 3 ideas for the UI (pad or trim).
    const ideas = object.ideas.slice(0, 3);
    return { ideas };
  });
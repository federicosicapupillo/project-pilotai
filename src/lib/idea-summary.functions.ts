import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  idea: z.string().min(8).max(4000),
  target: z.string().max(500).optional().default(""),
  projectType: z.string().max(60).optional().default(""),
});

const OutputSchema = z.object({
  title: z.string().describe("Titolo sintetico e accattivante dell'idea, massimo 90 caratteri."),
  short_description: z.string().describe("Riformulazione chiara e professionale dell'idea originale, 1-2 frasi."),
  project_type: z.string().describe("Tipo di progetto: es. Web app, Mobile app, Tool AI, Automazione, Marketplace, Gestionale, Landing page."),
  target: z.string().describe("Target specifico e coerente con l'idea. Elenca categorie reali di persone/professionisti che useranno l'app. Niente frasi generiche."),
  problem: z.string().describe("Problema reale risolto, concreto e specifico per questa idea. 2-3 frasi."),
  solution: z.string().describe("Come l'app risolve il problema in modo pratico. 2-3 frasi specifiche per questa idea."),
  first_version: z.string().describe("Cosa includere nella prima versione funzionante, evitando funzioni inutili. 2-3 frasi."),
  essential_features: z.array(z.string()).min(4).max(7).describe("4-7 funzioni essenziali e specifiche dell'idea."),
  screens: z.array(z.string()).min(3).max(7).describe("3-7 schermate principali coerenti con il flusso dell'idea."),
  difficulty: z.enum(["Facile", "Medio", "Avanzato"]).describe("Livello di complessità calcolato in base a funzioni, login, AI, integrazioni, pagamenti, calendario, WhatsApp, ecc."),
  difficulty_reason: z.string().describe("Una frase che spiega perché questa difficoltà."),
  estimated_hours: z.string().describe("Range realistico di ore guidate per la prima versione, es. '8 - 14 ore guidate'. Non promettere tempi impossibili."),
  integrations: z.array(z.string()).max(8).describe("Eventuali integrazioni richieste (es. Google Calendar, WhatsApp, Stripe, OpenAI). Vuoto se non servono."),
});

export type IdeaSummary = z.infer<typeof OutputSchema>;

const SYSTEM_PROMPT = `Sei un Product Manager esperto di app no-code, AI e MVP.
Ricevi un'idea di app scritta da un utente non tecnico e devi produrre un riepilogo CHIARO, SPECIFICO e PERSONALIZZATO.
REGOLE FONDAMENTALI:
- Mai testi generici tipo "target da definire", "problema poco chiaro", "app semplice e diretta".
- Se l'idea contiene elementi sufficienti, deduci sempre target reali, problema concreto e soluzione pratica.
- Usa italiano semplice, diretto, professionale.
- Parla sempre di "prima versione funzionante", mai di "app completa".
- Tempi realistici: prima versione tipicamente 6-25 ore guidate. Niente promesse impossibili.
- Le funzioni essenziali devono essere SPECIFICHE dell'idea, non liste standard.
- Il target deve essere un elenco concreto di categorie di persone/professionisti.
- Identifica integrazioni reali nominate o implicite (WhatsApp, Google Calendar, Stripe, ecc).`;

export const generateIdeaSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<IdeaSummary> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY mancante");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `Idea dell'utente:
"""${data.idea}"""

Target indicato dall'utente: ${data.target || "non specificato"}
Tipo progetto suggerito dal sistema: ${data.projectType || "non specificato"}

Genera un riepilogo strutturato, coerente, specifico per QUESTA idea.`;

    const { object } = await generateObject({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      schema: OutputSchema,
    });

    return object;
  });
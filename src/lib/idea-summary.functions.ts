import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  idea: z.string().min(8).max(4000),
  target: z.string().max(500).optional().default(""),
  projectType: z.string().max(60).optional().default(""),
});

const OutputSchema = z.object({
  title: z.string(),
  short_description: z.string(),
  project_type: z.string(),
  target: z.string(),
  problem: z.string(),
  solution: z.string(),
  first_version: z.string(),
  essential_features: z.array(z.string()),
  screens: z.array(z.string()),
  difficulty: z.string(),
  difficulty_reason: z.string(),
  estimated_hours: z.string(),
  integrations: z.array(z.string()),
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
- Identifica integrazioni reali nominate o implicite (WhatsApp, Google Calendar, Stripe, ecc).

FORMATO OUTPUT (JSON, tutti i campi obbligatori):
- title: string (max 90 char)
- short_description: string (1-2 frasi)
- project_type: string (es. "Web app", "Mobile app", "Tool AI", "Automazione", "Marketplace", "Gestionale", "Landing page")
- target: string (categorie reali di utenti)
- problem: string (2-3 frasi)
- solution: string (2-3 frasi)
- first_version: string (2-3 frasi)
- essential_features: array di 4-7 stringhe
- screens: array di 3-7 stringhe
- difficulty: string, uno tra "Facile", "Medio", "Avanzato"
- difficulty_reason: string (1 frase)
- estimated_hours: string (es. "8 - 14 ore guidate")
- integrations: array di stringhe (vuoto [] se non servono)`;

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
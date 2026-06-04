import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
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
  max_revenue: z.string(),
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
- integrations: array di stringhe (vuoto [] se non servono)
- max_revenue: string nel formato "Fino a X€/mese" (solo massimale, MAI un range). Stima realistica e credibile per una PRIMA VERSIONE funzionante, mai oltre 10.000€/mese.
  Linee guida:
  • Utility semplice per utenti privati: 300€ - 1.000€/mese
  • Tool per professionisti o piccole attività: 1.000€ - 3.000€/mese
  • App che risolve un problema operativo per aziende, ristoranti, consulenti, agenti immobiliari, artigiani o studi professionali: 2.000€ - 5.000€/mese
  • Gestionale, automazione AI o strumento B2B con abbonamento: 3.000€ - 8.000€/mese
  • Marketplace con domanda e offerta chiare: 5.000€ - 10.000€/mese
  Scegli UN singolo importo realistico nella fascia giusta e restituiscilo come "Fino a X€/mese" (es. "Fino a 2.500€/mese").`;

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

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT + "\n\nRispondi SOLO con JSON valido, senza testo extra né markdown.",
      prompt,
    });

    const parsed = extractJSON(text);
    return OutputSchema.parse(parsed);
  });

function extractJSON(raw: string): unknown {
  let cleaned = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/```\s*$/im, "")
    .trim();

  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const objStart = cleaned.indexOf("{");
    const objEnd = cleaned.lastIndexOf("}");
    if (objStart !== -1 && objEnd > objStart) {
      cleaned = cleaned.slice(objStart, objEnd + 1);
    } else {
      throw new Error("No valid JSON found in AI response");
    }
  }

  return JSON.parse(cleaned);
}
import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { APP_ROADMAP_PHASES, PHASE_WEIGHT, type AppRoadmapPhase } from "./app-roadmap";

const InputSchema = z.object({
  title: z.string().min(1).max(200),
  idea_description: z.string().min(1).max(4000),
  target: z.string().max(500).optional().default(""),
  problem: z.string().max(500).optional().default(""),
  solution: z.string().max(1000).optional().default(""),
  product_type: z.string().max(60).optional().default(""),
  experience_level: z.string().max(40).optional().default(""),
  existing_tools: z.string().max(500).optional().default(""),
  urgency: z.string().max(40).optional().default(""),
});

const PhaseEnum = z.enum(APP_ROADMAP_PHASES as unknown as [string, ...string[]]);

const StepSchema = z.object({
  title: z.string(),
  description: z.string(),
  phase: PhaseEnum,
  recommended_agent: z.string(),
  recommended_tool: z.string(),
  prompt_text: z.string(),
  expected_output: z.string(),
  checklist_items: z.array(z.string()),
});

const OutputSchema = z.object({
  steps: z.array(StepSchema),
});

const SYSTEM_PROMPT = `Sei un Product Manager esperto di app no-code, agenti AI, Lovable, Supabase e validazione MVP.
Devi creare una roadmap OPERATIVA personalizzata per costruire l'app dell'utente, passo passo.
Regole rigide:
- Niente teoria, niente promesse magiche.
- Ogni step è eseguibile dall'utente in autonomia, anche se non è tecnico.
- Ogni step indica agente, tool e prompt già personalizzato sull'idea.
- Distingui Academy (formazione) e costruzione concreta dell'app: questa è la roadmap di COSTRUZIONE.
- Italiano semplice, diretto, motivante.`;

function buildUserPrompt(d: z.infer<typeof InputSchema>) {
  return `Crea una roadmap operativa di costruzione dell'app, da 15 a 25 step, divisa nelle fasi:
1. Chiarezza idea
2. Validazione
3. MVP
4. Schermate e flussi
5. Database e dati
6. Costruzione con Lovable
7. Backend e sicurezza
8. Test e bug
9. Grafica e presentazione
10. Demo e lancio beta

Dati progetto:
Titolo: ${d.title}
Descrizione: ${d.idea_description}
Target: ${d.target || "non specificato"}
Problema: ${d.problem || "non specificato"}
Soluzione: ${d.solution || "non specificato"}
Tipo prodotto: ${d.product_type || "non specificato"}
Livello esperienza: ${d.experience_level || "non specificato"}
Strumenti indicati: ${d.existing_tools || "nessuno"}
Urgenza: ${d.urgency || "non specificata"}

Per ogni step produci:
- title (azione concreta, max 12 parole)
- description (cosa fare in pratica, 1–3 frasi)
- phase (uno dei valori dell'enum)
- recommended_agent (es. Agente Stratega, MVP Specialist, UX/UI Designer, Backend, QA…)
- recommended_tool (es. ChatGPT, Claude, Perplexity, Lovable, Supabase, Obsidian, Runway, Stripe…)
- prompt_text: prompt PRONTO da copiare, già personalizzato su QUESTO progetto, lungo abbastanza da guidare bene l'AI
- expected_output: cosa deve restare salvato (preferibilmente nel Workbook)
- checklist_items: 2–5 voci concrete e verificabili

Mantieni un ORDINE LOGICO: le fasi devono comparire in successione. La roadmap deve coprire tutte e 10 le fasi se possibile.`;
}

export const generateAppRoadmap = createServerFn({ method: "POST" })
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
      prompt: buildUserPrompt(data),
      schema: OutputSchema,
    });

    // Enrich each step with order_index + progress_weight (server-side, deterministic).
    return object.steps.map((s, i) => ({
      ...s,
      order_index: i,
      priority: i,
      status: "todo" as const,
      progress_weight: PHASE_WEIGHT[s.phase as AppRoadmapPhase] ?? 1,
    }));
  });
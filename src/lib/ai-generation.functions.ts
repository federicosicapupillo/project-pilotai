import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

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

const OutputSchema = z.object({
  project_analysis: z.object({
    target_users: z.string(),
    main_problem: z.string(),
    proposed_solution: z.string(),
    main_features: z.array(z.string()),
    required_screens: z.array(z.string()),
    data_to_save: z.array(z.string()),
    risks: z.array(z.string()),
    mvp_version: z.string(),
    not_to_build_now: z.array(z.string()),
  }),
  agents: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      when_to_use: z.string(),
      expected_output: z.string(),
      prompt_text: z.string(),
    }),
  ),
  prompts: z.array(
    z.object({
      category: z.string(),
      title: z.string(),
      prompt_text: z.string(),
      recommended_tool: z.string(),
    }),
  ),
  roadmap_items: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.number(),
    }),
  ),
});

export type GeneratedProjectContent = z.infer<typeof OutputSchema>;

const SYSTEM_PROMPT = `Agisci come Product Manager esperto di app no-code, AI agents, Lovable, Supabase e strumenti di prototipazione.
Devi trasformare l'idea dell'utente in un progetto digitale semplice, chiaro e realizzabile.
Non devi dare codice. Devi produrre una struttura operativa per costruire un MVP.
Devi essere concreto, onesto e pratico. Niente frasi generiche, niente promesse magiche.
Se l'idea è troppo grande, ridimensionala in un MVP realistico.
Distingui chiaramente tra MVP e funzioni future.
Suggerisci sempre cosa NON costruire subito.
Se mancano dettagli, fai assunzioni ragionevoli e segnalale come rischi.
L'utente non è tecnico: usa linguaggio semplice e chiaro, in italiano.
I prompt operativi che generi devono essere realmente copiabili e utilizzabili in ChatGPT, Claude, Lovable o strumenti simili.`;

function buildUserPrompt(d: z.infer<typeof InputSchema>) {
  return `Idea da trasformare in un progetto operativo.

Titolo: ${d.title}
Descrizione: ${d.idea_description}
Target dichiarato: ${d.target || "non specificato"}
Problema: ${d.problem || "non specificato"}
Risultato atteso: ${d.solution || "non specificato"}
Tipo prodotto: ${d.product_type || "non specificato"}
Livello esperienza utente: ${d.experience_level || "non specificato"}
Strumenti indicati: ${d.existing_tools || "nessuno"}
Urgenza: ${d.urgency || "non specificata"}

Genera contenuti COERENTI con questa idea specifica. Vietato dare risposte generiche valide per qualsiasi progetto.

Devi produrre:
1) project_analysis: scheda strutturata (target_users, main_problem, proposed_solution, main_features 5-7, required_screens 4-7, data_to_save 4-7, risks 3-5, mvp_version 1 paragrafo, not_to_build_now 4-6).
2) agents: ESATTAMENTE 7 agenti AI utili a costruire QUESTO progetto. Per ognuno: name, role, when_to_use, expected_output, prompt_text (prompt operativo lungo e specifico, in italiano, già personalizzato sull'idea, pronto da incollare).
3) prompts: ESATTAMENTE 7 prompt operativi pratici per QUESTO progetto. Per ognuno: category, title, prompt_text (operativo, specifico, non template), recommended_tool (es. ChatGPT, Claude, Lovable, Perplexity).
4) roadmap_items: ESATTAMENTE 10 step concreti per portare il progetto da idea a MVP lanciato. Per ognuno: title (breve), description (cosa significa "fatto"), priority (0..9, in ordine).

Output strettamente in JSON conforme allo schema richiesto.`;
}

export const generateProjectContent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY mancante");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { experimental_output } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(data),
      experimental_output: Output.object({ schema: OutputSchema }),
    });

    return experimental_output as GeneratedProjectContent;
  });
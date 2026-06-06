import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import {
  classifyIdeaTier,
  tierHours,
  tierDifficultyLabel,
  tierDifficultyReason,
  tierPotential,
} from "./idea-deterministic";

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
  degraded: z.boolean().optional(),
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
    let phase: string = "init";
    try {
      phase = "rate_limit";
      const { enforceIpRateLimit } = await import("./rate-limit.server");
      await enforceIpRateLimit({ endpoint: "generateIdeaSummary", maxRequests: 20, windowSeconds: 3600 });

      phase = "ai_key";
      const key = process.env.LOVABLE_API_KEY;
      if (!key) throw new Error("LOVABLE_API_KEY mancante");

      phase = "ai_call";
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

      phase = "parse";
      const parsed = extractJSON(text);
      const summary = OutputSchema.parse(parsed);
      summary.max_revenue = computeMaxRevenue(data.idea, data.target, summary.project_type);
      return summary;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Log + notify, but never throw — return a deterministic fallback so the user always sees a result.
      await safeLogAnalysisError({
        phase,
        message,
        stack: error instanceof Error ? error.stack : undefined,
        idea: data.idea,
        target: data.target,
        projectType: data.projectType,
      });
      return buildFallbackSummary(data.idea, data.target, data.projectType);
    }
  });

async function safeLogAnalysisError(input: {
  phase: string;
  message: string;
  stack?: string;
  idea: string;
  target: string;
  projectType: string;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sanitizedMessage = input.message
      .replace(/sk_live_[A-Za-z0-9]+/g, "sk_live_[redacted]")
      .replace(/sk_test_[A-Za-z0-9]+/g, "sk_test_[redacted]")
      .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
    await supabaseAdmin.from("app_error_logs").insert({
      action_name: "generate_idea_budget_analysis",
      error_type: "analysis_generation_failed",
      error_message: sanitizedMessage,
      error_stack: input.stack?.slice(0, 8000),
      severity: "high",
      metadata: {
        phase: input.phase,
        idea_preview: input.idea.slice(0, 240),
        target: input.target,
        project_type: input.projectType,
        ai_provider: "lovable-gateway/google/gemini-3-flash-preview",
      },
    });
    await sendAdminEmailSafe(sanitizedMessage, input.phase);
  } catch (e) {
    console.error("[idea-summary] safeLogAnalysisError failed", e);
  }
}

async function sendAdminEmailSafe(message: string, phase: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const from = process.env.ERROR_EMAIL_FROM || "IdeaPilot AI <onboarding@resend.dev>";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ["federico.sica@gmail.com"],
        subject: "[IdeaPilot AI] Errore generazione analisi idea (high)",
        html: `<p><strong>Azione:</strong> generate_idea_budget_analysis</p>
               <p><strong>Fase:</strong> ${escapeHtml(phase)}</p>
               <p><strong>Errore:</strong> ${escapeHtml(message)}</p>`,
      }),
    });
  } catch (e) {
    console.error("[idea-summary] resend email failed", e);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function buildFallbackSummary(idea: string, target: string, projectType: string): IdeaSummary {
  const tier = classifyIdeaTier(idea, target);
  const trimmed = idea.trim();
  const firstSentence = trimmed.split(/[.!?\n]/)[0]?.trim() || trimmed;
  const title = firstSentence.length > 80 ? firstSentence.slice(0, 77) + "…" : firstSentence || "La tua idea";
  const pt = projectType || (tier === "marketplace" ? "Marketplace" : tier === "avanzata" ? "Web app avanzata" : tier === "media" ? "Web app" : "Web app semplice");
  const targetText = target?.trim()
    ? target
    : "Utenti che oggi gestiscono manualmente questa attività e cercano uno strumento più semplice.";
  return {
    title,
    short_description: trimmed.length > 220 ? trimmed.slice(0, 217) + "…" : trimmed,
    project_type: pt,
    target: targetText,
    problem:
      "L'utente perde tempo o opportunità gestendo manualmente questa attività, senza un flusso operativo chiaro.",
    solution:
      "Una prima versione funzionante che automatizza i passaggi principali, raccoglie i dati essenziali e mostra subito un risultato utile.",
    first_version:
      "Parti da una versione minima con le 3-4 funzioni più importanti, un'unica area utente e un flusso semplice dall'inizio alla fine.",
    essential_features: [
      "Schermata principale con i dati o le azioni chiave",
      "Inserimento o raccolta delle informazioni essenziali",
      "Salvataggio sicuro su database",
      "Visualizzazione dei risultati o dello stato",
    ],
    screens: ["Home", "Inserimento dati", "Elenco / risultati", "Dettaglio singolo elemento"],
    difficulty: tierDifficultyLabel(tier),
    difficulty_reason: tierDifficultyReason(tier),
    estimated_hours: tierHours(tier),
    integrations: [],
    max_revenue: tierPotential(tier).amount.replace(/^Fino a /, "Fino a "),
    degraded: true,
  };
}

// Deterministic potenziale massimo: same idea → same value, sempre.
// Leggermente più alto del realistico (richiesta utente).
function computeMaxRevenue(idea: string, target: string, projectType: string): string {
  const seed = `${idea.trim().toLowerCase()}|${(target ?? "").trim().toLowerCase()}`;
  const h = hash32(seed);

  const type = (projectType || "").toLowerCase();
  // Fasce (min, max) leggermente più ottimistiche del reale
  let min = 2000, max = 5000;
  if (/marketplace/.test(type)) { min = 7000; max = 12000; }
  else if (/gestional|automazion|b2b|saas/.test(type)) { min = 5000; max = 9000; }
  else if (/tool|ai|mobile|web app/.test(type)) { min = 3000; max = 6500; }
  else if (/landing|utility|utilit/.test(type)) { min = 1500; max = 3500; }

  // Step di 500 per valori "puliti"
  const steps = Math.floor((max - min) / 500) + 1;
  const value = min + (h % steps) * 500;
  return `Fino a ${value.toLocaleString("it-IT")}€/mese`;
}

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

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
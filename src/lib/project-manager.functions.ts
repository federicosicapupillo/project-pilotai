import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import {
  PROJECT_MANAGER_SYSTEM_PROMPT,
  PROJECT_MANAGER_EXTRA_RULES,
} from "@/prompts/projectManagerSystemPrompt";

// Mask common secret-like patterns before persisting log content.
function redactSecrets(input: string | null | undefined): string | null {
  if (!input) return input ?? null;
  let s = String(input);
  // sk-..., pk_live_..., generic tokens, JWTs, bearer headers, long base64-ish keys
  s = s.replace(/\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{8,}\b/g, "[DATO SENSIBILE NASCOSTO]");
  s = s.replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[DATO SENSIBILE NASCOSTO]");
  s = s.replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, "[DATO SENSIBILE NASCOSTO]");
  s = s.replace(/\b(bearer|authorization|api[_-]?key|password|token|secret)\s*[:=]\s*["']?[^\s"'<>]+/gi, "$1: [DATO SENSIBILE NASCOSTO]");
  return s;
}

async function logPmAction(
  supabase: ReturnType<typeof createLovableAiGatewayProvider> extends never ? never : any,
  userId: string,
  row: {
    project_id?: string | null;
    action_type: string;
    step_title?: string | null;
    next_step_title?: string | null;
    user_message?: string | null;
    project_manager_prompt?: string | null;
    project_manager_response?: string | null;
    decision?: string | null;
    backlog_item_id?: string | null;
    operation_id?: string | null;
    metadata?: Record<string, unknown> | null;
  },
) {
  try {
    await supabase.from("project_manager_logs").insert({
      user_id: userId,
      project_id: row.project_id ?? null,
      action_type: row.action_type,
      step_title: row.step_title ?? null,
      next_step_title: row.next_step_title ?? null,
      user_message: redactSecrets(row.user_message ?? null),
      project_manager_prompt: redactSecrets(row.project_manager_prompt ?? null),
      project_manager_response: redactSecrets(row.project_manager_response ?? null),
      decision: row.decision ?? null,
      backlog_item_id: row.backlog_item_id ?? null,
      operation_id: row.operation_id ?? null,
      metadata: row.metadata ?? null,
    });
  } catch (err) {
    console.error("[pm logs] insert failed", err);
  }
}

function buildContext(p: {
  title?: string | null;
  idea?: string | null;
  product_type?: string | null;
  target?: string | null;
  problem?: string | null;
  solution?: string | null;
  features?: string[] | null;
  roadmap?: { title: string; status: string; phase?: string | null }[];
  prompts?: { title: string; category: string }[];
  agents?: { name: string; role: string }[];
  currentStep?: string | null;
  nextStep?: string | null;
  progressPct?: number | null;
  backlogCount?: number | null;
}) {
  const lines: string[] = ["CONTESTO PROGETTO ATTIVO:"];
  if (p.title) lines.push(`Titolo: ${p.title}`);
  if (p.idea) lines.push(`Idea: ${p.idea}`);
  if (p.product_type) lines.push(`Tipo prodotto: ${p.product_type}`);
  if (p.target) lines.push(`Target: ${p.target}`);
  if (p.problem) lines.push(`Problema: ${p.problem}`);
  if (p.solution) lines.push(`Soluzione: ${p.solution}`);
  if (p.features?.length) lines.push(`Funzioni principali: ${p.features.join(", ")}`);
  if (p.currentStep) lines.push(`Step in corso: ${p.currentStep}`);
  if (p.nextStep) lines.push(`Prossimo step: ${p.nextStep}`);
  if (typeof p.progressPct === "number") lines.push(`Avanzamento: ${p.progressPct}%`);
  if (typeof p.backlogCount === "number") lines.push(`Backlog migliorie future: ${p.backlogCount} idee parcheggiate`);
  lines.push("Vincolo: la roadmap attiva è BLOCCATA (db trigger). Non proporre modifiche, aggiunte, rimozioni o riordino di step. Migliorie → Backlog.");
  if (p.agents?.length) lines.push(`Agenti attivi: ${p.agents.map((a) => `${a.name} (${a.role})`).join("; ")}`);
  if (p.prompts?.length) lines.push(`Prompt generati: ${p.prompts.map((x) => `${x.category} - ${x.title}`).join("; ")}`);
  if (p.roadmap?.length) {
    lines.push("Roadmap:");
    for (const r of p.roadmap) lines.push(`- [${r.status}] ${r.title}${r.phase ? ` (${r.phase})` : ""}`);
  }
  return lines.join("\n");
}

export const getPmHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId?: string | null }) => ({
    projectId:
      typeof d.projectId === "string" && /^[0-9a-fA-F-]{36}$/.test(d.projectId)
        ? d.projectId
        : null,
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("pm_messages")
      .select("id, role, content, created_at, project_id")
      .order("created_at", { ascending: true })
      .limit(200);
    q = data.projectId ? q.eq("project_id", data.projectId) : q.is("project_id", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { messages: rows ?? [] };
  });

export const sendPmMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId?: string | null; message: string }) => {
    const message = String(d.message ?? "").trim();
    if (!message) throw new Error("Empty message");
    if (message.length > 4000) throw new Error("Message too long");
    return {
      projectId:
        typeof d.projectId === "string" && /^[0-9a-fA-F-]{36}$/.test(d.projectId)
          ? d.projectId
          : null,
      message,
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    // Load project context
    let ctx: Parameters<typeof buildContext>[0] = {};
    if (data.projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("id, title, idea_description, product_type")
        .eq("id", data.projectId)
        .maybeSingle();
      if (project) {
        ctx.title = project.title;
        ctx.idea = project.idea_description;
        ctx.product_type = project.product_type;
      }
      const { data: analysis } = await supabase
        .from("project_analysis")
        .select("target_users, main_problem, proposed_solution, main_features")
        .eq("project_id", data.projectId)
        .maybeSingle();
      if (analysis) {
        ctx.target = analysis.target_users;
        ctx.problem = analysis.main_problem;
        ctx.solution = analysis.proposed_solution;
        ctx.features = Array.isArray(analysis.main_features)
          ? (analysis.main_features as string[])
          : null;
      }
      const { data: roadmap } = await supabase
        .from("roadmap_items")
        .select("title, status, phase, order_index")
        .eq("project_id", data.projectId)
        .order("order_index", { ascending: true })
        .limit(20);
      ctx.roadmap = (roadmap ?? []).map((r) => ({
        title: r.title,
        status: r.status,
        phase: r.phase,
      }));
      const { data: prompts } = await supabase
        .from("prompts")
        .select("title, category")
        .eq("project_id", data.projectId)
        .limit(20);
      ctx.prompts = prompts ?? [];
      const { data: agents } = await supabase
        .from("agents")
        .select("name, role")
        .eq("project_id", data.projectId)
        .limit(20);
      ctx.agents = (agents ?? []).map((a) => ({ name: a.name, role: a.role ?? "" }));

      const { count: backlogCount } = await supabase
        .from("improvement_backlog")
        .select("id", { count: "exact", head: true })
        .eq("project_id", data.projectId);
      ctx.backlogCount = backlogCount ?? 0;

      // Derive current/next step from roadmap (first non-done = current, next = next non-done)
      if (roadmap && roadmap.length) {
        const firstOpen = roadmap.find((r) => r.status !== "done");
        if (firstOpen) {
          ctx.currentStep = firstOpen.title;
          const idx = roadmap.indexOf(firstOpen);
          ctx.nextStep = roadmap.slice(idx + 1).find((r) => r.status !== "done")?.title ?? null;
        }
        const done = roadmap.filter((r) => r.status === "done").length;
        ctx.progressPct = roadmap.length ? Math.round((done / roadmap.length) * 100) : 0;
      }
    }

    // Synthetic roadmap fallback (kept in sync with src/components/SyntheticRoadmap.tsx)
    const SYNTH = [
      "Progetto definito",
      "Punti di forza e criticità",
      "MVP / prima versione",
      "Schermate principali",
      "Dashboard e area utente",
      "Backend e dati",
      "Test e correzioni",
      "Prima versione pronta",
    ];
    if (!ctx.currentStep) {
      ctx.currentStep = SYNTH[1];
      ctx.nextStep = SYNTH[2];
      ctx.progressPct = 12;
    }

    // Load recent history (for memory)
    let histQ = supabase
      .from("pm_messages")
      .select("role, content, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    histQ = data.projectId ? histQ.eq("project_id", data.projectId) : histQ.is("project_id", null);
    const { data: histRows } = await histQ;
    const history = (histRows ?? []).reverse();

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const messages = [
      { role: "system" as const, content: PROJECT_MANAGER_SYSTEM_PROMPT },
      { role: "system" as const, content: PROJECT_MANAGER_EXTRA_RULES },
      { role: "system" as const, content: buildContext(ctx) },
      ...history.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: data.message },
    ];

    let assistantText = "";
    try {
      const result = await generateText({ model, messages });
      assistantText = result.text.trim();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      if (/429/.test(msg)) {
        assistantText = "Sono al limite richieste in questo momento. Riprova tra qualche secondo.";
      } else if (/402/.test(msg)) {
        assistantText = "I crediti AI dello spazio di lavoro sono esauriti. Aggiungili dalle impostazioni per continuare.";
      } else {
        throw err;
      }
    }
    if (!assistantText) assistantText = "Non sono riuscito a rispondere. Riprova.";

    const rows = [
      { user_id: userId, project_id: data.projectId, role: "user", content: data.message },
      { user_id: userId, project_id: data.projectId, role: "assistant", content: assistantText },
    ];
    const { error: insErr } = await supabase.from("pm_messages").insert(rows);
    if (insErr) console.error("pm_messages insert error", insErr);

    // Append-only logs (best-effort, never block the response).
    const opBase = `${userId}:${data.projectId ?? "none"}:${Date.now()}`;
    await logPmAction(supabase, userId, {
      project_id: data.projectId,
      action_type: "user_message_received",
      step_title: ctx.currentStep ?? null,
      next_step_title: ctx.nextStep ?? null,
      user_message: data.message,
      operation_id: `${opBase}:user`,
      metadata: { progress_pct: ctx.progressPct ?? null },
    });
    await logPmAction(supabase, userId, {
      project_id: data.projectId,
      action_type: "project_manager_response",
      step_title: ctx.currentStep ?? null,
      next_step_title: ctx.nextStep ?? null,
      project_manager_response: assistantText,
      project_manager_prompt: PROJECT_MANAGER_SYSTEM_PROMPT.slice(0, 500),
      operation_id: `${opBase}:reply`,
      metadata: { progress_pct: ctx.progressPct ?? null, model: "google/gemini-3-flash-preview" },
    });

    return { reply: assistantText };
  });

export const listBacklog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId?: string | null }) => ({
    projectId:
      typeof d.projectId === "string" && /^[0-9a-fA-F-]{36}$/.test(d.projectId)
        ? d.projectId
        : null,
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("improvement_backlog")
      .select("id, title, description, source, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    q = data.projectId ? q.eq("project_id", data.projectId) : q.is("project_id", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [] };
  });

export const addBacklogItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId?: string | null; title: string; description?: string }) => {
    const title = String(d.title ?? "").trim();
    if (!title) throw new Error("Titolo richiesto");
    if (title.length > 200) throw new Error("Titolo troppo lungo");
    const description = d.description ? String(d.description).slice(0, 2000) : null;
    return {
      projectId:
        typeof d.projectId === "string" && /^[0-9a-fA-F-]{36}$/.test(d.projectId)
          ? d.projectId
          : null,
      title,
      description,
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: inserted, error } = await supabase.from("improvement_backlog").insert({
      user_id: userId,
      project_id: data.projectId,
      title: data.title,
      description: data.description,
      source: "pm_chat",
    }).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    await logPmAction(supabase, userId, {
      project_id: data.projectId,
      action_type: "improvement_sent_to_backlog",
      decision: data.title,
      backlog_item_id: inserted?.id ?? null,
      metadata: { description: redactSecrets(data.description) },
      operation_id: `backlog:${userId}:${data.projectId ?? "none"}:${Date.now()}`,
    });
    return { ok: true };
  });

export const getPmLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId?: string | null; limit?: number }) => ({
    projectId:
      typeof d.projectId === "string" && /^[0-9a-fA-F-]{36}$/.test(d.projectId)
        ? d.projectId
        : null,
    limit: Math.min(Math.max(Number(d.limit ?? 50), 1), 200),
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("project_manager_logs")
      .select(
        "id, action_type, step_title, next_step_title, user_message, project_manager_response, decision, backlog_item_id, metadata, created_at, project_id",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit);
    q = data.projectId ? q.eq("project_id", data.projectId) : q.is("project_id", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { logs: rows ?? [] };
  });

// Step → competent agent + recommended tool + usage instructions.
const STEP_AGENT_MAP: Record<
  string,
  { agent: string; tool: string; instructions: string }
> = {
  "Progetto definito": {
    agent: "Agente Stratega",
    tool: "ChatGPT",
    instructions: "Copia questo prompt in ChatGPT per affinare il posizionamento e le priorità strategiche del progetto.",
  },
  "Punti di forza e criticità": {
    agent: "Agente Validatore",
    tool: "ChatGPT",
    instructions: "Copia questo prompt in ChatGPT per validare l'idea, individuare rischi, ipotesi da testare e priorità.",
  },
  "MVP / prima versione": {
    agent: "Agente MVP",
    tool: "Lovable",
    instructions: "Copia questo prompt e incollalo nella chat di Lovable del progetto attivo per trasformare l'idea nella prima versione MVP.",
  },
  "Schermate principali": {
    agent: "Agente UX",
    tool: "Lovable",
    instructions: "Copia questo prompt nella chat di Lovable del progetto attivo per generare le schermate principali, i flussi e le CTA.",
  },
  "Dashboard e area utente": {
    agent: "Agente Costruttore",
    tool: "Lovable",
    instructions: "Copia questo prompt nella chat di Lovable per costruire la dashboard e l'area utente.",
  },
  "Backend e dati": {
    agent: "Agente Architetto Dati",
    tool: "Lovable (Supabase)",
    instructions: "Copia questo prompt nella chat di Lovable per creare tabelle, relazioni e policy su Supabase in modo sicuro.",
  },
  "Test e correzioni": {
    agent: "Agente Controllo Qualità",
    tool: "Lovable",
    instructions: "Copia questo prompt nella chat di Lovable per eseguire test, controlli, checklist e regressioni.",
  },
  "Prima versione pronta": {
    agent: "Agente di Lancio",
    tool: "Lovable",
    instructions: "Copia questo prompt nella chat di Lovable per preparare la prima versione al lancio (beta o pubblico).",
  },
};

function resolveAgentForStep(stepTitle: string) {
  return (
    STEP_AGENT_MAP[stepTitle] ?? {
      agent: "Agente Istruttore",
      tool: "Lovable",
      instructions: "Copia questo prompt nella chat di Lovable per eseguire lo step previsto dalla roadmap.",
    }
  );
}

export const generateOperationalPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId?: string | null; stepTitle: string }) => {
    const stepTitle = String(d.stepTitle ?? "").trim();
    if (!stepTitle) throw new Error("Step richiesto");
    if (stepTitle.length > 200) throw new Error("Step troppo lungo");
    return {
      projectId:
        typeof d.projectId === "string" && /^[0-9a-fA-F-]{36}$/.test(d.projectId)
          ? d.projectId
          : null,
      stepTitle,
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    // Dedupe forte: per ogni (progetto, step) deve esistere UN SOLO prompt operativo
    // visibile. Se ne esiste già uno, lo restituiamo invece di rigenerarlo.
    // Questo previene duplicati da doppio click, retry React, refresh, render
    // multipli e chiamate concorrenti.
    let dq = supabase
      .from("operational_prompts")
      .select(
        "id, title, agent_name, recommended_tool, instructions, prompt_text, step_title, created_at, copied",
      )
      .eq("step_title", data.stepTitle)
      .order("created_at", { ascending: false })
      .limit(1);
    dq = data.projectId ? dq.eq("project_id", data.projectId) : dq.is("project_id", null);
    const { data: dupes } = await dq;
    if (dupes && dupes.length > 0) return { prompt: dupes[0], deduped: true };

    // Load light project context.
    let projectTitle: string | null = null;
    let projectIdea: string | null = null;
    if (data.projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("title, idea_description")
        .eq("id", data.projectId)
        .maybeSingle();
      if (project) {
        projectTitle = project.title;
        projectIdea = project.idea_description;
      }
    }

    const mapping = resolveAgentForStep(data.stepTitle);

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const systemPrompt = `Sei ${mapping.agent}, agente operativo del Team AI di "Da idea ad app".
Genera un PROMPT OPERATIVO completo, pronto da incollare in ${mapping.tool}, per eseguire lo step di roadmap: "${data.stepTitle}".

Il prompt deve essere strutturato in italiano con queste sezioni esatte (titoli in maiuscolo):
CONTESTO
OBIETTIVO
MODIFICA RICHIESTA / INTERVENTO RICHIESTO
REGOLE DA RISPETTARE
COSA NON MODIFICARE
CONTROLLO QUALITÀ FINALE
RISULTATO ATTESO

Vincoli:
- Non modificare la roadmap attiva.
- Non saltare step.
- Le migliorie extra vanno nel Backlog migliorie future.
- Lo strumento di destinazione è ${mapping.tool}: scrivi il prompt in modo coerente con quello strumento.
- Restituisci SOLO il prompt operativo finale, senza preamboli o note.`;

    const userPrompt = `Step roadmap attivo: ${data.stepTitle}
Progetto: ${projectTitle ?? "(non specificato)"}
Idea: ${projectIdea ?? "(non specificata)"}

Genera il prompt operativo finale per lo step.`;

    let promptText = "";
    try {
      const result = await generateText({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      promptText = result.text.trim();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      if (/429/.test(msg)) throw new Error("Sono al limite richieste. Riprova tra qualche secondo.");
      if (/402/.test(msg)) throw new Error("Crediti AI esauriti. Aggiungili dalle impostazioni per continuare.");
      throw err;
    }
    if (!promptText) throw new Error("Generazione fallita, riprova.");

    const title = `Prompt operativo — ${data.stepTitle}`;

    const { data: inserted, error: insErr } = await supabase
      .from("operational_prompts")
      .insert({
        user_id: userId,
        project_id: data.projectId,
        step_title: data.stepTitle,
        agent_name: mapping.agent,
        recommended_tool: mapping.tool,
        instructions: mapping.instructions,
        title,
        prompt_text: promptText,
      })
      .select("id, title, agent_name, recommended_tool, instructions, prompt_text, step_title, created_at, copied")
      .single();
    if (insErr) throw new Error(insErr.message);

    await logPmAction(supabase, userId, {
      project_id: data.projectId,
      action_type: "operational_prompt_generated",
      step_title: data.stepTitle,
      project_manager_prompt: promptText.slice(0, 4000),
      decision: `Prompt generato da ${mapping.agent} per ${mapping.tool}`,
      operation_id: `opprompt:${inserted.id}`,
      metadata: {
        operational_prompt_id: inserted.id,
        agent: mapping.agent,
        tool: mapping.tool,
      },
    });

    return { prompt: inserted, deduped: false };
  });

export const listOperationalPrompts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId?: string | null }) => ({
    projectId:
      typeof d.projectId === "string" && /^[0-9a-fA-F-]{36}$/.test(d.projectId)
        ? d.projectId
        : null,
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("operational_prompts")
      .select("id, title, agent_name, recommended_tool, instructions, prompt_text, step_title, created_at, copied")
      .order("created_at", { ascending: false })
      .limit(20);
    q = data.projectId ? q.eq("project_id", data.projectId) : q.is("project_id", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { prompts: rows ?? [] };
  });

export const markOperationalPromptCopied = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => {
    if (!/^[0-9a-fA-F-]{36}$/.test(String(d.id))) throw new Error("ID non valido");
    return { id: d.id };
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("operational_prompts")
      .update({ copied: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

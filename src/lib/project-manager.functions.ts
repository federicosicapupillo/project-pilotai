import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { PROJECT_MANAGER_SYSTEM_PROMPT } from "@/prompts/projectManagerSystemPrompt";

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
    const { error } = await supabase.from("improvement_backlog").insert({
      user_id: userId,
      project_id: data.projectId,
      title: data.title,
      description: data.description,
      source: "pm_chat",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

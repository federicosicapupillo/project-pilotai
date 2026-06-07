import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_EMAIL = "federico.sica@gmail.com";
const THROTTLE_MINUTES = 10;

const SEVERITY = z.enum(["low", "medium", "high", "critical"]);

const InputSchema = z.object({
  action_name: z.string().min(1).max(120),
  error_message: z.string().min(1).max(4000),
  error_type: z.string().max(120).optional(),
  error_stack: z.string().max(8000).optional(),
  severity: SEVERITY.default("medium"),
  user_id: z.string().uuid().nullable().optional(),
  user_email: z.string().email().max(255).nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  page_url: z.string().max(1000).optional(),
  route: z.string().max(255).optional(),
  browser: z.string().max(255).optional(),
  device: z.string().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LogAppErrorInput = z.input<typeof InputSchema>;

// Strip obvious secret-looking values from metadata before storing
function sanitizeMetadata(meta: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!meta) return {};
  const SECRET_KEYS = /(password|secret|token|api[_-]?key|authorization|whsec|sk_live|sk_test|bearer)/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SECRET_KEYS.test(k)) {
      out[k] = "[redacted]";
      continue;
    }
    if (typeof v === "string" && /sk_live|sk_test|whsec_|Bearer\s+/i.test(v)) {
      out[k] = "[redacted]";
      continue;
    }
    out[k] = v;
  }
  return out;
}

function sanitizeMessage(msg: string): string {
  return msg
    .replace(/sk_live_[A-Za-z0-9]+/g, "sk_live_[redacted]")
    .replace(/sk_test_[A-Za-z0-9]+/g, "sk_test_[redacted]")
    .replace(/whsec_[A-Za-z0-9]+/g, "whsec_[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
}

async function sendAdminEmail(subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[error-logging] RESEND_API_KEY missing; skipping admin email");
    return false;
  }
  const from = process.env.ERROR_EMAIL_FROM || "IdeaPilot AI <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: [ADMIN_EMAIL], subject, html }),
    });
    if (!res.ok) {
      console.error("[error-logging] resend send failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[error-logging] resend send threw", e);
    return false;
  }
}

function buildEmailHtml(data: z.infer<typeof InputSchema>, logId: string): string {
  const safeMeta = JSON.stringify(sanitizeMetadata(data.metadata), null, 2).slice(0, 4000);
  const rows: [string, string][] = [
    ["Data", new Date().toISOString()],
    ["Severity", data.severity],
    ["Action", data.action_name],
    ["Tipo errore", data.error_type ?? "—"],
    ["Utente", data.user_id ?? "—"],
    ["Email utente", data.user_email ?? "—"],
    ["Project ID", data.project_id ?? "—"],
    ["Pagina", data.page_url ?? "—"],
    ["Route", data.route ?? "—"],
    ["Browser", data.browser ?? "—"],
    ["Device", data.device ?? "—"],
    ["Log ID", logId],
  ];
  const rowsHtml = rows
    .map(([k, v]) => `<tr><td style="padding:4px 8px;color:#666"><b>${k}</b></td><td style="padding:4px 8px">${escapeHtml(String(v))}</td></tr>`)
    .join("");
  return `
    <div style="font-family:system-ui,sans-serif;max-width:640px">
      <h2 style="color:#b91c1c;margin:0 0 12px">Errore IdeaPilot AI — ${escapeHtml(data.severity)} — ${escapeHtml(data.action_name)}</h2>
      <p>Si è verificato un errore su IdeaPilot AI.</p>
      <h3>Messaggio</h3>
      <pre style="background:#f8f8f8;padding:12px;border-radius:8px;white-space:pre-wrap">${escapeHtml(sanitizeMessage(data.error_message))}</pre>
      <h3>Dettagli</h3>
      <table style="border-collapse:collapse;font-size:14px">${rowsHtml}</table>
      ${data.error_stack ? `<h3>Stack</h3><pre style="background:#f8f8f8;padding:12px;border-radius:8px;white-space:pre-wrap;font-size:12px">${escapeHtml(sanitizeMessage(data.error_stack)).slice(0, 4000)}</pre>` : ""}
      <h3>Metadata</h3>
      <pre style="background:#f8f8f8;padding:12px;border-radius:8px;white-space:pre-wrap;font-size:12px">${escapeHtml(safeMeta)}</pre>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/**
 * Centralized error logger.
 * - Saves the error to `app_error_logs` (best-effort, never throws to caller).
 * - For `high`/`critical` severity, sends an email to the admin with a
 *   per-(action+type+user) throttle of 10 minutes.
 */
export const logAppError = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: boolean; id?: string; emailed?: boolean }> => {
    try {
      // Public endpoint: enforce a per-IP rate limit to prevent log flooding
      // and admin-email spam from unauthenticated callers. Fail-open on infra
      // errors so a misbehaving rate-limit table never breaks logging.
      try {
        const { enforceIpRateLimit } = await import("./rate-limit.server");
        await enforceIpRateLimit({
          endpoint: "logAppError",
          maxRequests: 20,
          windowSeconds: 3600,
        });
      } catch (rlErr) {
        // Rate limit exceeded → silently drop the log entry.
        return { ok: false };
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const sanitizedMessage = sanitizeMessage(data.error_message);
      const sanitizedStack = data.error_stack ? sanitizeMessage(data.error_stack) : null;

      // Do NOT trust caller-supplied user_id / user_email — this endpoint is
      // unauthenticated. If a session token is attached, derive the identity
      // from it; otherwise drop these fields entirely so anon callers cannot
      // impersonate real users in the log table.
      let verifiedUserId: string | null = null;
      let verifiedUserEmail: string | null = null;
      try {
        const { getRequestHeader } = await import("@tanstack/react-start/server");
        const auth = getRequestHeader("authorization") || getRequestHeader("Authorization");
        if (auth?.toLowerCase().startsWith("bearer ")) {
          const token = auth.slice(7).trim();
          const { data: userRes } = await supabaseAdmin.auth.getUser(token);
          if (userRes?.user) {
            verifiedUserId = userRes.user.id;
            verifiedUserEmail = userRes.user.email ?? null;
          }
        }
      } catch {
        // Best-effort identity resolution; fall through to anon.
      }

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("app_error_logs")
        .insert({
          user_id: verifiedUserId,
          user_email: verifiedUserEmail,
          project_id: data.project_id ?? null,
          page_url: data.page_url ?? null,
          route: data.route ?? null,
          action_name: data.action_name,
          error_type: data.error_type ?? null,
          error_message: sanitizedMessage,
          error_stack: sanitizedStack,
          severity: data.severity,
          browser: data.browser ?? null,
          device: data.device ?? null,
          metadata: sanitizeMetadata(data.metadata) as never,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[error-logging] insert failed", insertError);
        return { ok: false };
      }
      const id = inserted!.id as string;

      const shouldEmail = data.severity === "high" || data.severity === "critical";
      if (!shouldEmail) return { ok: true, id, emailed: false };

      // throttle: same action + type + user within THROTTLE_MINUTES → no email
      const fingerprint = [data.action_name, data.error_type ?? "_", data.user_id ?? "_"].join("|");
      const cutoff = new Date(Date.now() - THROTTLE_MINUTES * 60_000).toISOString();

      const { data: throttleRow } = await supabaseAdmin
        .from("error_email_throttle")
        .select("id, last_sent_at, count")
        .eq("fingerprint", fingerprint)
        .maybeSingle();

      const within = throttleRow && throttleRow.last_sent_at > cutoff;
      if (within && data.severity !== "critical") {
        await supabaseAdmin
          .from("error_email_throttle")
          .update({ count: (throttleRow.count ?? 1) + 1 })
          .eq("id", throttleRow.id);
        return { ok: true, id, emailed: false };
      }

      const subject = `Errore IdeaPilot AI — ${data.severity} — ${data.action_name}`;
      const html = buildEmailHtml(data, id);
      const sent = await sendAdminEmail(subject, html);

      if (throttleRow) {
        await supabaseAdmin
          .from("error_email_throttle")
          .update({ last_sent_at: new Date().toISOString(), count: (throttleRow.count ?? 1) + 1 })
          .eq("id", throttleRow.id);
      } else {
        await supabaseAdmin
          .from("error_email_throttle")
          .insert({ fingerprint });
      }

      if (sent) {
        await supabaseAdmin.from("app_error_logs").update({ email_sent: true }).eq("id", id);
      }

      return { ok: true, id, emailed: sent };
    } catch (e) {
      // Logger must never throw to caller
      console.error("[error-logging] handler crashed", e);
      return { ok: false };
    }
  });
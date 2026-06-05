import { createHash } from "crypto";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";

function getClientIp(): string {
  try {
    const ip = getRequestIP({ xForwardedFor: true });
    if (ip) return ip;
  } catch {}
  const fwd = (() => { try { return getRequestHeader("x-forwarded-for"); } catch { return undefined; } })();
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = (() => { try { return getRequestHeader("x-real-ip"); } catch { return undefined; } })();
  return real || "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Enforces a sliding-window per-IP rate limit for a given endpoint.
 * Throws an Error with a user-friendly italian message when exceeded.
 */
export async function enforceIpRateLimit(opts: {
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
}): Promise<void> {
  const { endpoint, maxRequests, windowSeconds } = opts;
  const ip = getClientIp();
  const ipHash = hashIp(ip);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("ai_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("endpoint", endpoint)
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (error) {
    console.error("[rate-limit] count error", error);
    return; // fail-open to avoid blocking legitimate users on infra hiccups
  }

  if ((count ?? 0) >= maxRequests) {
    throw new Error(
      `Hai raggiunto il limite di richieste per questa funzione. Riprova tra qualche minuto.`,
    );
  }

  const { error: insertError } = await supabaseAdmin
    .from("ai_rate_limits")
    .insert({ endpoint, ip_hash: ipHash });
  if (insertError) console.error("[rate-limit] insert error", insertError);
}
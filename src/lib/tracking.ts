import { supabase } from "@/integrations/supabase/client";

const UTM_KEY = "utm_attribution";

export type UtmAttribution = {
  source?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_creator?: string;
  referrer?: string;
  captured_at?: string;
};

export function captureUtmFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const hasAny = ["utm_source", "utm_campaign", "utm_content", "utm_creator"].some((k) =>
      params.get(k),
    );
    if (!hasAny && localStorage.getItem(UTM_KEY)) return;
    if (!hasAny) return;
    const data: UtmAttribution = {
      source: params.get("utm_source") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
      utm_content: params.get("utm_content") ?? undefined,
      utm_creator: params.get("utm_creator") ?? undefined,
      referrer: document.referrer || undefined,
      captured_at: new Date().toISOString(),
    };
    localStorage.setItem(UTM_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getUtm(): UtmAttribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(UTM_KEY) || "{}");
  } catch {
    return {};
  }
}

export async function trackEvent(eventName: string, metadata?: Record<string, unknown>) {
  try {
    const utm = getUtm();
    const { data } = await supabase.auth.getUser();
    await supabase.from("conversion_events").insert({
      event_name: eventName,
      user_id: data.user?.id ?? null,
      source: utm.source ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_content: utm.utm_content ?? null,
      utm_creator: utm.utm_creator ?? null,
      metadata: (metadata ?? null) as never,
    });
  } catch {
    /* swallow tracking errors */
  }
}
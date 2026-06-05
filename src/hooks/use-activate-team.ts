import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getAgentAccess } from "@/lib/payments.functions";
import { trackEvent } from "@/lib/tracking";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for any "Attiva Team AI" CTA across the app.
 *
 * Flow:
 * - already paid → goes to /agents (the operative team page)
 * - not logged in → stores post_auth_redirect = /checkout-agente, sends to /auth
 * - logged in & not paid → sends straight to /checkout-agente (Stripe)
 */
export function useActivateTeam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchAccess = useServerFn(getAgentAccess);

  const { data: access } = useQuery({
    queryKey: ["agent-access"],
    queryFn: async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        if (!s.session?.access_token) {
          return { hasAccess: false, status: null, idea: null, paidAt: null };
        }
        return await fetchAccess();
      } catch {
        return { hasAccess: false, status: null, idea: null, paidAt: null };
      }
    },
    enabled: !!user,
    staleTime: 15_000,
    retry: false,
  });

  const hasAccess = !!access?.hasAccess;

  const activate = async (source?: string, projectId?: string) => {
    void trackEvent("activate_team_ai_click", { source: source ?? "unknown", projectId });
    if (typeof window !== "undefined" && projectId) {
      // Persist so the checkout page (and recovery flow) can pick the project back up
      try { localStorage.setItem("pending_project_id", projectId); } catch { /* noop */ }
    }
    if (hasAccess) {
      navigate({ to: "/agents" });
      return;
    }
    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("post_auth_redirect", "/checkout-agente");
      }
      navigate({ to: "/auth" });
      return;
    }
    navigate({ to: "/checkout-agente" });
  };

  return { activate, hasAccess, isAuthed: !!user };
}
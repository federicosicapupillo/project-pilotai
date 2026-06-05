import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getAgentAccess } from "@/lib/payments.functions";
import { trackEvent } from "@/lib/tracking";

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
    queryFn: () => fetchAccess(),
    enabled: !!user,
    staleTime: 15_000,
  });

  const hasAccess = !!access?.hasAccess;

  const activate = async (source?: string) => {
    void trackEvent("activate_team_ai_click", { source: source ?? "unknown" });
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
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type UserRegistrationStats = {
  totalUsers: number;
  usersToday: number;
  usersLast7Days: number;
  usersLast30Days: number;
};

/**
 * Returns aggregated registration counts.
 * - Only callable by signed-in admins (checked via public.has_role).
 * - Uses supabaseAdmin server-side; never exposes PII.
 */
export const getUserRegistrationStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UserRegistrationStats> => {
    const { supabase, userId } = context;

    // Admin gate via security-definer function
    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleErr) throw new Error("Role check failed");
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const countSince = async (sinceIso?: string) => {
      let q = supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });
      if (sinceIso) q = q.gte("created_at", sinceIso);
      const { count, error } = await q;
      if (error) throw new Error(error.message);
      return count ?? 0;
    };

    const [totalUsers, usersToday, usersLast7Days, usersLast30Days] = await Promise.all([
      countSince(),
      countSince(startOfToday),
      countSince(sevenDaysAgo),
      countSince(thirtyDaysAgo),
    ]);

    return { totalUsers, usersToday, usersLast7Days, usersLast30Days };
  });
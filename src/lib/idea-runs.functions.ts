import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";

const RunInput = z.object({
  ideaText: z.string().min(1).max(4000),
  normalizedIdeaText: z.string().max(4000),
  ideaHash: z.string().min(1).max(64),
  language: z.string().max(8).optional().default("it"),
  sessionId: z.string().max(128).optional().default(""),
  selectedBudgetRange: z.string().max(64).optional().default(""),
  targetUser: z.string().max(500).optional().default(""),
  revenueModel: z.string().max(80).optional().default(""),
  suggestedPrice: z.string().max(80).optional().default(""),
  estimatedHoursMin: z.number().int().min(0).max(2000).optional(),
  estimatedHoursMax: z.number().int().min(0).max(2000).optional(),
  estimatedDevCostMin: z.number().int().min(0).max(1_000_000).optional(),
  estimatedDevCostMax: z.number().int().min(0).max(1_000_000).optional(),
  estimatedPotentialRevenueMin: z.number().int().min(0).max(10_000_000).optional(),
  estimatedPotentialRevenueMax: z.number().int().min(0).max(10_000_000).optional(),
  traditionalCostEstimate: z.number().int().min(0).max(10_000_000).optional(),
  teamAiCost: z.number().int().min(0).max(1_000_000).optional(),
  estimatedSavings: z.number().int().min(0).max(10_000_000).optional(),
  featuresInScope: z.array(z.string().max(300)).max(40).optional().default([]),
  featuresOutOfScope: z.array(z.string().max(300)).max(40).optional().default([]),
  recommendedMvpScope: z.string().max(1000).optional().default(""),
  pricingVersion: z.string().max(16).optional().default("v1"),
  promptVersion: z.string().max(16).optional().default("v1"),
  optionalDetails: z.record(z.string(), z.any()).optional().default({}),
});

export type SaveIdeaRunInput = z.infer<typeof RunInput>;

export const saveIdeaRun = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RunInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Try to detect authenticated user from bearer token (optional).
      let userId: string | null = null;
      try {
        const request = getRequest();
        const auth = request?.headers?.get("authorization") ?? "";
        if (auth.startsWith("Bearer ")) {
          const token = auth.slice(7);
          const { data: claims } = await supabaseAdmin.auth.getUser(token);
          userId = claims?.user?.id ?? null;
        }
      } catch { /* anon */ }

      // Look for an existing matching run (same user/session + idea_hash + budget + pricing).
      const matchKey = userId
        ? { col: "user_id", val: userId }
        : data.sessionId
          ? { col: "session_id", val: data.sessionId }
          : null;

      if (matchKey) {
        const { data: existing } = await supabaseAdmin
          .from("idea_calculator_runs")
          .select("id")
          .eq("idea_hash", data.ideaHash)
          .eq("pricing_version", data.pricingVersion ?? "v1")
          .eq(matchKey.col, matchKey.val)
          .eq("selected_budget_range", data.selectedBudgetRange ?? "")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          // Touch updated_at so analytics show the most recent interaction.
          await supabaseAdmin
            .from("idea_calculator_runs")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", existing.id);
          return { id: existing.id, reused: true };
        }
      }

      const row = {
        user_id: userId,
        session_id: data.sessionId || null,
        idea_text: data.ideaText,
        normalized_idea_text: data.normalizedIdeaText,
        idea_hash: data.ideaHash,
        language: data.language,
        selected_budget_range: data.selectedBudgetRange || null,
        optional_details: data.optionalDetails ?? {},
        target_user: data.targetUser || null,
        revenue_model: data.revenueModel || null,
        suggested_price: data.suggestedPrice || null,
        estimated_hours_min: data.estimatedHoursMin ?? null,
        estimated_hours_max: data.estimatedHoursMax ?? null,
        estimated_dev_cost_min: data.estimatedDevCostMin ?? null,
        estimated_dev_cost_max: data.estimatedDevCostMax ?? null,
        estimated_potential_revenue_min: data.estimatedPotentialRevenueMin ?? null,
        estimated_potential_revenue_max: data.estimatedPotentialRevenueMax ?? null,
        traditional_cost_estimate: data.traditionalCostEstimate ?? null,
        team_ai_cost: data.teamAiCost ?? null,
        estimated_savings: data.estimatedSavings ?? null,
        features_in_scope: data.featuresInScope ?? [],
        features_out_of_scope: data.featuresOutOfScope ?? [],
        recommended_mvp_scope: data.recommendedMvpScope || null,
        pricing_version: data.pricingVersion ?? "v1",
        prompt_version: data.promptVersion ?? "v1",
      };

      const { data: inserted, error } = await supabaseAdmin
        .from("idea_calculator_runs")
        .insert(row)
        .select("id")
        .single();
      if (error) throw error;
      return { id: inserted.id, reused: false };
    } catch (error) {
      // Never break the calculator UX — log and swallow.
      console.error("[saveIdeaRun] failed", error);
      return { id: null as string | null, reused: false, error: "save_failed" };
    }
  });

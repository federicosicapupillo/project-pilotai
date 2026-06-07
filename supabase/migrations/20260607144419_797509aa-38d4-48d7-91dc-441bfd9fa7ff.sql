
CREATE TABLE public.idea_calculator_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  idea_text text NOT NULL,
  normalized_idea_text text NOT NULL,
  idea_hash text NOT NULL,
  language text DEFAULT 'it',
  selected_budget_range text,
  optional_details jsonb DEFAULT '{}'::jsonb,
  target_user text,
  revenue_model text,
  suggested_price text,
  estimated_hours_min integer,
  estimated_hours_max integer,
  estimated_dev_cost_min integer,
  estimated_dev_cost_max integer,
  estimated_potential_revenue_min integer,
  estimated_potential_revenue_max integer,
  traditional_cost_estimate integer,
  team_ai_cost integer,
  estimated_savings integer,
  features_in_scope jsonb DEFAULT '[]'::jsonb,
  features_out_of_scope jsonb DEFAULT '[]'::jsonb,
  recommended_mvp_scope text,
  pricing_version text NOT NULL DEFAULT 'v1',
  prompt_version text DEFAULT 'v1',
  ai_model_version text,
  result_summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idea_calc_runs_user_idx       ON public.idea_calculator_runs (user_id, created_at DESC);
CREATE INDEX idea_calc_runs_session_idx    ON public.idea_calculator_runs (session_id, created_at DESC);
CREATE INDEX idea_calc_runs_hash_idx       ON public.idea_calculator_runs (idea_hash, selected_budget_range, pricing_version);

GRANT SELECT, INSERT, UPDATE ON public.idea_calculator_runs TO authenticated;
GRANT ALL ON public.idea_calculator_runs TO service_role;

ALTER TABLE public.idea_calculator_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own runs"
  ON public.idea_calculator_runs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own runs"
  ON public.idea_calculator_runs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own runs"
  ON public.idea_calculator_runs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_idea_calc_runs_updated
  BEFORE UPDATE ON public.idea_calculator_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

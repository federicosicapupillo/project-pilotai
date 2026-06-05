CREATE TABLE public.operational_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  step_title TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  recommended_tool TEXT NOT NULL,
  instructions TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  copied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_op_prompts_user_created ON public.operational_prompts(user_id, created_at DESC);
CREATE INDEX idx_op_prompts_project_created ON public.operational_prompts(project_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.operational_prompts TO authenticated;
GRANT ALL ON public.operational_prompts TO service_role;

ALTER TABLE public.operational_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own operational prompts"
  ON public.operational_prompts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own operational prompts"
  ON public.operational_prompts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own operational prompts"
  ON public.operational_prompts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_operational_prompts_updated_at
  BEFORE UPDATE ON public.operational_prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.project_manager_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  roadmap_step_id UUID,
  step_title TEXT,
  next_step_title TEXT,
  action_type TEXT NOT NULL,
  user_message TEXT,
  project_manager_prompt TEXT,
  project_manager_response TEXT,
  decision TEXT,
  backlog_item_id UUID,
  operation_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pm_logs_user_created ON public.project_manager_logs(user_id, created_at DESC);
CREATE INDEX idx_pm_logs_project_created ON public.project_manager_logs(project_id, created_at DESC);
CREATE UNIQUE INDEX idx_pm_logs_operation_id ON public.project_manager_logs(user_id, operation_id) WHERE operation_id IS NOT NULL;

GRANT SELECT, INSERT ON public.project_manager_logs TO authenticated;
GRANT ALL ON public.project_manager_logs TO service_role;

ALTER TABLE public.project_manager_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pm logs"
  ON public.project_manager_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pm logs"
  ON public.project_manager_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Append-only: block updates and deletes for everyone except service_role
CREATE OR REPLACE FUNCTION public.block_pm_logs_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'project_manager_logs è append-only: aggiornamenti ed eliminazioni non sono permessi.';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.block_pm_logs_mutation() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER block_pm_logs_update
  BEFORE UPDATE ON public.project_manager_logs
  FOR EACH ROW EXECUTE FUNCTION public.block_pm_logs_mutation();

CREATE TRIGGER block_pm_logs_delete
  BEFORE DELETE ON public.project_manager_logs
  FOR EACH ROW EXECUTE FUNCTION public.block_pm_logs_mutation();
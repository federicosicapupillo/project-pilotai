
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS idea_run_id uuid REFERENCES public.idea_calculator_runs(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS projects_user_idea_run_unique
  ON public.projects (user_id, idea_run_id)
  WHERE idea_run_id IS NOT NULL AND deleted_at IS NULL;

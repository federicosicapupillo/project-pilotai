ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
CREATE INDEX IF NOT EXISTS idx_projects_user_active ON public.projects(user_id) WHERE deleted_at IS NULL;
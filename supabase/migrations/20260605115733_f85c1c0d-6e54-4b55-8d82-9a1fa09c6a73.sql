CREATE TABLE public.pm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pm_messages_user_project_idx ON public.pm_messages (user_id, project_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_messages TO authenticated;
GRANT ALL ON public.pm_messages TO service_role;
ALTER TABLE public.pm_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_messages_select_own" ON public.pm_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pm_messages_insert_own" ON public.pm_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pm_messages_delete_own" ON public.pm_messages FOR DELETE TO authenticated USING (user_id = auth.uid());
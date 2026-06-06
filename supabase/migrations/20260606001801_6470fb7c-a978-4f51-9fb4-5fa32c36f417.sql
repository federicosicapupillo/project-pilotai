
CREATE TABLE public.app_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  project_id uuid,
  page_url text,
  route text,
  action_name text NOT NULL,
  error_type text,
  error_message text NOT NULL,
  error_stack text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  browser text,
  device text,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','seen','resolved','ignored')),
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_app_error_logs_created_at ON public.app_error_logs (created_at DESC);
CREATE INDEX idx_app_error_logs_severity ON public.app_error_logs (severity);
CREATE INDEX idx_app_error_logs_user ON public.app_error_logs (user_id);

GRANT INSERT ON public.app_error_logs TO authenticated, anon;
GRANT ALL ON public.app_error_logs TO service_role;

ALTER TABLE public.app_error_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own error (or anonymous w/ NULL user)
CREATE POLICY "users can insert own error logs"
  ON public.app_error_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "anon can insert anonymous error logs"
  ON public.app_error_logs FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Throttle table to prevent email spam
CREATE TABLE public.error_email_throttle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL UNIQUE,
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 1
);

GRANT ALL ON public.error_email_throttle TO service_role;
ALTER TABLE public.error_email_throttle ENABLE ROW LEVEL SECURITY;
-- no policies → only service_role bypasses RLS

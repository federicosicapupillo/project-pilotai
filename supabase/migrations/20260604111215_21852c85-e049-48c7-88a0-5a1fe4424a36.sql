CREATE TABLE public.agent_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text,
  idea text,
  amount_cents integer,
  currency text DEFAULT 'eur',
  payment_status text DEFAULT 'pending',
  stripe_session_id text,
  accesso_agente_ai boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.agent_access TO authenticated;
GRANT ALL ON public.agent_access TO service_role;

ALTER TABLE public.agent_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own access" ON public.agent_access
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own access" ON public.agent_access
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages all" ON public.agent_access
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_agent_access_updated_at
  BEFORE UPDATE ON public.agent_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_agent_access_user_id ON public.agent_access(user_id);
CREATE INDEX idx_agent_access_session ON public.agent_access(stripe_session_id);
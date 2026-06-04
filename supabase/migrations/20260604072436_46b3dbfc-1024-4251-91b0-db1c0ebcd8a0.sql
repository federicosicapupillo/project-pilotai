
-- Add plan + utm fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_creator text,
  ADD COLUMN IF NOT EXISTS referrer text;

-- user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  price_paid numeric,
  currency text DEFAULT 'EUR',
  started_at timestamptz,
  expires_at timestamptz,
  source text,
  utm_campaign text,
  utm_content text,
  utm_creator text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscriptions select" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own subscriptions insert" ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- conversion_events
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  project_id uuid,
  source text,
  utm_campaign text,
  utm_content text,
  utm_creator text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.conversion_events TO anon, authenticated;
GRANT SELECT ON public.conversion_events TO authenticated;
GRANT ALL ON public.conversion_events TO service_role;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert events" ON public.conversion_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "own events select" ON public.conversion_events FOR SELECT TO authenticated USING (user_id = auth.uid());

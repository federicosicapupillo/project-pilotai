CREATE TABLE public.ai_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.ai_rate_limits TO service_role;

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ai_rate_limits_lookup
  ON public.ai_rate_limits (endpoint, ip_hash, created_at DESC);
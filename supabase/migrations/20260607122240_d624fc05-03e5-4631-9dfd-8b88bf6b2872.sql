-- Add explicit "no client access" policies for service-role-only tables.
-- service_role has BYPASSRLS so these policies do not affect webhook/admin code,
-- but they satisfy the Postgres linter "RLS enabled, no policy" warning and
-- make intent explicit: anon/authenticated must never read or write these.

-- ai_rate_limits: written only by edge/server code via supabaseAdmin (rate-limit.server.ts)
CREATE POLICY "Deny all client access to ai_rate_limits"
  ON public.ai_rate_limits
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- error_email_throttle: written only by error-logging.functions.ts via supabaseAdmin
CREATE POLICY "Deny all client access to error_email_throttle"
  ON public.error_email_throttle
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.ai_rate_limits IS
  'Service-role only: written via supabaseAdmin from rate-limit.server.ts. RLS denies all anon/authenticated access by design.';

COMMENT ON TABLE public.error_email_throttle IS
  'Service-role only: written via supabaseAdmin from error-logging.functions.ts. RLS denies all anon/authenticated access by design.';
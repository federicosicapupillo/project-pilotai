DROP POLICY IF EXISTS "own subscriptions insert" ON public.user_subscriptions;
REVOKE INSERT, UPDATE, DELETE ON public.user_subscriptions FROM authenticated;
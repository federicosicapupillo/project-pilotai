
DROP POLICY IF EXISTS "anyone can insert events" ON public.conversion_events;
CREATE POLICY "events insert anon" ON public.conversion_events
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
CREATE POLICY "events insert authenticated" ON public.conversion_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

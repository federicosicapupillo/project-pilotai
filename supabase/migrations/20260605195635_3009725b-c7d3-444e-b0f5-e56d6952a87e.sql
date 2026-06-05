CREATE POLICY "own operational_prompts delete"
ON public.operational_prompts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own prompts write" ON public.prompts;

CREATE POLICY "own prompts write"
ON public.prompts
FOR INSERT
TO authenticated
WITH CHECK (
  project_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = prompts.project_id
      AND p.user_id = auth.uid()
  )
);

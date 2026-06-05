
-- 1. Backlog table for future improvements
CREATE TABLE IF NOT EXISTS public.improvement_backlog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  source text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'parked',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.improvement_backlog TO authenticated;
GRANT ALL ON public.improvement_backlog TO service_role;

ALTER TABLE public.improvement_backlog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own backlog"
  ON public.improvement_backlog
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_improvement_backlog_updated_at
  BEFORE UPDATE ON public.improvement_backlog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_improvement_backlog_user
  ON public.improvement_backlog(user_id, created_at DESC);

-- 2. Lock initial roadmap. Once a project has any roadmap_items rows,
-- block further INSERTs from non-service roles. Block DELETEs always.
-- For UPDATEs, only allow status, user_notes, completed_at, updated_at to change.

CREATE OR REPLACE FUNCTION public.lock_roadmap_items_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing int;
BEGIN
  -- service_role bypasses (e.g. admin regeneration scripts)
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO existing FROM public.roadmap_items WHERE project_id = NEW.project_id;
  IF existing > 0 THEN
    RAISE EXCEPTION 'Roadmap già attiva per questo progetto: non puoi aggiungere step. Salva l''idea nel Backlog migliorie future.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_roadmap_items_insert ON public.roadmap_items;
CREATE TRIGGER trg_lock_roadmap_items_insert
  BEFORE INSERT ON public.roadmap_items
  FOR EACH ROW EXECUTE FUNCTION public.lock_roadmap_items_insert();

CREATE OR REPLACE FUNCTION public.lock_roadmap_items_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'La roadmap attiva non può essere eliminata. Salva le idee nel Backlog migliorie future.';
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_roadmap_items_delete ON public.roadmap_items;
CREATE TRIGGER trg_lock_roadmap_items_delete
  BEFORE DELETE ON public.roadmap_items
  FOR EACH ROW EXECUTE FUNCTION public.lock_roadmap_items_delete();

CREATE OR REPLACE FUNCTION public.lock_roadmap_items_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.phase IS DISTINCT FROM OLD.phase
     OR NEW.order_index IS DISTINCT FROM OLD.order_index
     OR NEW.priority IS DISTINCT FROM OLD.priority
     OR NEW.recommended_agent IS DISTINCT FROM OLD.recommended_agent
     OR NEW.recommended_tool IS DISTINCT FROM OLD.recommended_tool
     OR NEW.prompt_text IS DISTINCT FROM OLD.prompt_text
     OR NEW.expected_output IS DISTINCT FROM OLD.expected_output
     OR NEW.checklist_items IS DISTINCT FROM OLD.checklist_items
     OR NEW.progress_weight IS DISTINCT FROM OLD.progress_weight
     OR NEW.project_id IS DISTINCT FROM OLD.project_id
  THEN
    RAISE EXCEPTION 'La roadmap attiva non può essere modificata: puoi cambiare solo lo stato e le note personali. Salva le migliorie nel Backlog.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_roadmap_items_update ON public.roadmap_items;
CREATE TRIGGER trg_lock_roadmap_items_update
  BEFORE UPDATE ON public.roadmap_items
  FOR EACH ROW EXECUTE FUNCTION public.lock_roadmap_items_update();

-- Extend roadmap_items with fields for the App Construction Roadmap
ALTER TABLE public.roadmap_items
  ADD COLUMN IF NOT EXISTS phase text,
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recommended_agent text,
  ADD COLUMN IF NOT EXISTS recommended_tool text,
  ADD COLUMN IF NOT EXISTS prompt_text text,
  ADD COLUMN IF NOT EXISTS expected_output text,
  ADD COLUMN IF NOT EXISTS checklist_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS progress_weight integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS user_notes text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_roadmap_items_project_order
  ON public.roadmap_items(project_id, order_index);

DROP TRIGGER IF EXISTS update_roadmap_items_updated_at ON public.roadmap_items;
CREATE TRIGGER update_roadmap_items_updated_at
  BEFORE UPDATE ON public.roadmap_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
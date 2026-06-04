-- =========================
-- COURSE MODULES
-- =========================
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  objective TEXT,
  final_output TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_modules TO authenticated;
GRANT ALL ON public.course_modules TO service_role;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read modules" ON public.course_modules
  FOR SELECT TO authenticated USING (true);

-- =========================
-- COURSE LESSONS
-- =========================
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  objective TEXT,
  recommended_agent TEXT,
  recommended_tools JSONB DEFAULT '[]'::jsonb,
  prompt_text TEXT,
  exercise_text TEXT,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_lessons TO authenticated;
GRANT ALL ON public.course_lessons TO service_role;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read lessons" ON public.course_lessons
  FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_course_lessons_module ON public.course_lessons(module_id, order_index);

-- =========================
-- USER LESSON PROGRESS
-- =========================
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lesson_progress TO authenticated;
GRANT ALL ON public.user_lesson_progress TO service_role;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.user_lesson_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);

-- =========================
-- AGENT LIBRARY
-- =========================
CREATE TABLE public.agent_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  when_to_use TEXT,
  expected_output TEXT,
  base_prompt TEXT,
  recommended_tools JSONB DEFAULT '[]'::jsonb,
  course_phase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.agent_library TO authenticated;
GRANT ALL ON public.agent_library TO service_role;
ALTER TABLE public.agent_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read agent library" ON public.agent_library
  FOR SELECT TO authenticated USING (true);

-- =========================
-- TOOL LIBRARY
-- =========================
CREATE TABLE public.tool_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  use_case TEXT,
  difficulty_level TEXT,
  course_phase TEXT,
  example_use TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tool_library TO authenticated;
GRANT ALL ON public.tool_library TO service_role;
ALTER TABLE public.tool_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read tool library" ON public.tool_library
  FOR SELECT TO authenticated USING (true);

-- =========================
-- PROJECT WORKBOOK
-- =========================
CREATE TABLE public.project_workbook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  idea TEXT,
  target TEXT,
  problem TEXT,
  solution TEXT,
  mvp TEXT,
  screens JSONB DEFAULT '[]'::jsonb,
  data_to_save JSONB DEFAULT '[]'::jsonb,
  agents_used JSONB DEFAULT '[]'::jsonb,
  prompts_used JSONB DEFAULT '[]'::jsonb,
  bugs_found JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_workbook TO authenticated;
GRANT ALL ON public.project_workbook TO service_role;
ALTER TABLE public.project_workbook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workbook" ON public.project_workbook
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================
-- updated_at triggers
-- =========================
CREATE TRIGGER trg_course_modules_updated BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_course_lessons_updated BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_lesson_progress_updated BEFORE UPDATE ON public.user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_agent_library_updated BEFORE UPDATE ON public.agent_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tool_library_updated BEFORE UPDATE ON public.tool_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_project_workbook_updated BEFORE UPDATE ON public.project_workbook
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
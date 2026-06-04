
-- Tool library: brand & guidance fields
ALTER TABLE public.tool_library
  ADD COLUMN IF NOT EXISTS icon_slug text,
  ADD COLUMN IF NOT EXISTS icon_color text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS requirement text,
  ADD COLUMN IF NOT EXISTS pairs_with_agents jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS phase_note text,
  ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 100;

-- Agent library: visual + phase
ALTER TABLE public.agent_library
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 100;

-- Workbook: more operative fields
ALTER TABLE public.project_workbook
  ADD COLUMN IF NOT EXISTS tools_used jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS decisions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS best_prompts jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS errors_solved jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_tool text,
  ADD COLUMN IF NOT EXISTS next_agent text;

-- Two extra modules to complete the 12-module path
INSERT INTO public.course_modules (title, description, order_index, objective, final_output)
SELECT 'Integrazioni prodotto',
       'Aggiungi pagamenti, OTP e funzioni di prodotto solo quando servono davvero.',
       11,
       'Capire quando e come integrare Stripe, Twilio e servizi esterni nel tuo MVP.',
       'Un MVP con almeno una integrazione reale o un piano d''integrazione chiaro.'
WHERE NOT EXISTS (SELECT 1 FROM public.course_modules WHERE order_index = 11);

INSERT INTO public.course_modules (title, description, order_index, objective, final_output)
SELECT 'Organizzazione del progetto e secondo cervello',
       'Trasforma il tuo progetto in un sistema vivo con memoria, versioning e documentazione.',
       12,
       'Avere una struttura di lavoro replicabile per ogni nuovo progetto: memoria, versioning, documentazione.',
       'Un "secondo cervello" del progetto pronto per evolvere nel tempo.'
WHERE NOT EXISTS (SELECT 1 FROM public.course_modules WHERE order_index = 12);

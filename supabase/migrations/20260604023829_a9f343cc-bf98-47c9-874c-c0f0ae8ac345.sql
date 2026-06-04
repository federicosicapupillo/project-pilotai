
GRANT SELECT ON public.tool_library TO anon;
GRANT SELECT ON public.agent_library TO anon;
GRANT SELECT ON public.course_modules TO anon;
GRANT SELECT ON public.course_lessons TO anon;

CREATE POLICY "Public can read tool library" ON public.tool_library FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read agent library" ON public.agent_library FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read modules" ON public.course_modules FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read lessons" ON public.course_lessons FOR SELECT TO anon USING (true);

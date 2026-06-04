import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

const KEY = "active_project_id";

export type ActiveProject = {
  id: string;
  title: string;
  idea_description: string | null;
  target: string | null;
  problem: string | null;
  solution: string | null;
  product_type: string | null;
  experience_level: string | null;
  existing_tools: string | null;
};

export function useActiveProject() {
  const { user } = useAuth();
  const [activeId, setActiveIdState] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(KEY) : null
  );

  const { data: projects } = useQuery({
    queryKey: ["my-projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, idea_description, target, problem, solution, product_type, experience_level, existing_tools")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ActiveProject[];
    },
  });

  // Default to most recent project if none selected or selection is stale
  useEffect(() => {
    if (!projects || projects.length === 0) return;
    if (!activeId || !projects.find((p) => p.id === activeId)) {
      setActiveIdState(projects[0].id);
      localStorage.setItem(KEY, projects[0].id);
    }
  }, [projects, activeId]);

  const active = projects?.find((p) => p.id === activeId) ?? null;

  const setActiveId = (id: string) => {
    setActiveIdState(id);
    localStorage.setItem(KEY, id);
  };

  return { active, projects: projects ?? [], setActiveId, activeId };
}

/** Replace common Italian placeholders in lesson prompts with active project data. */
export function personalizePrompt(text: string, p: ActiveProject | null): string {
  if (!text) return text;
  if (!p) {
    return text
      .replace(/\[idea[^\]]*\]/gi, "[INSERISCI QUI LA TUA IDEA]")
      .replace(/\[descrizione[^\]]*\]/gi, "[INSERISCI QUI LA DESCRIZIONE DELLA TUA IDEA/MVP]")
      .replace(/\[target[^\]]*\]/gi, "[INSERISCI QUI IL TARGET]")
      .replace(/\[problema[^\]]*\]/gi, "[INSERISCI QUI IL PROBLEMA]")
      .replace(/\[soluzione[^\]]*\]/gi, "[INSERISCI QUI LA SOLUZIONE]")
      .replace(/\[mvp[^\]]*\]/gi, "[INSERISCI QUI IL TUO MVP]")
      .replace(/\[progetto[^\]]*\]/gi, "[INSERISCI QUI IL NOME DEL PROGETTO]");
  }
  const idea = p.idea_description || p.title;
  const desc = [p.title, p.idea_description].filter(Boolean).join(" — ");
  return text
    .replace(/\[idea[^\]]*\]/gi, idea)
    .replace(/\[descrizione[^\]]*\]/gi, desc || idea)
    .replace(/\[target[^\]]*\]/gi, p.target || "[target da definire]")
    .replace(/\[problema[^\]]*\]/gi, p.problem || "[problema da definire]")
    .replace(/\[soluzione[^\]]*\]/gi, p.solution || "[soluzione da definire]")
    .replace(/\[mvp[^\]]*\]/gi, p.solution || idea)
    .replace(/\[progetto[^\]]*\]/gi, p.title);
}
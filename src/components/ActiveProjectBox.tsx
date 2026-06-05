import { Link } from "@tanstack/react-router";
import { Folder, ArrowRight } from "lucide-react";
import { useActiveProject } from "@/hooks/use-active-project";
import { useAuth } from "@/hooks/use-auth";

export function ActiveProjectBox({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { active, projects, setActiveId } = useActiveProject();

  if (!user) {
    return (
      <div className="glass-card rounded-xl p-4 flex items-center justify-between gap-3 border-primary/20">
        <div className="text-sm text-muted-foreground">
          Accedi per personalizzare prompt e roadmap sul tuo progetto.
        </div>
        <Link to="/auth" className="text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0">
          Accedi <ArrowRight className="size-3" />
        </Link>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4 flex items-center justify-between gap-3 border-primary/20">
        <div className="text-sm">
          <span className="text-muted-foreground">Nessun progetto attivo.</span> Crea il primo per ricevere prompt e suggerimenti su misura.
        </div>
        <Link to="/new-project" className="text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0">
          Crea progetto <ArrowRight className="size-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 border-primary/30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-lg gradient-bg grid place-items-center glow-soft shrink-0">
          <Folder className="size-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stai lavorando sul progetto</p>
          <p className="font-display font-semibold leading-tight truncate">{active?.title ?? "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {projects.length > 1 && (
          <select
            value={active?.id ?? ""}
            onChange={(e) => setActiveId(e.target.value)}
            className="bg-secondary/60 border border-border/60 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        )}
        {active && !compact && (
          <Link
            to="/workbook/$projectId"
            params={{ projectId: active.id }}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Workbook <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
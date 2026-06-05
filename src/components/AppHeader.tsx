import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, LogOut, Check, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAgentAccess } from "@/lib/payments.functions";
import { loadIdeaParams } from "@/lib/idea-estimate";

const links: { to: string; label: string; auth?: boolean }[] = [
  { to: "/", label: "Home" },
  { to: "/academy", label: "Academy" },
  { to: "/tools", label: "Strumenti" },
  { to: "/agents", label: "Agenti" },
  { to: "/dashboard", label: "Dashboard", auth: true },
  { to: "/my-path", label: "Il mio percorso", auth: true },
];

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const fetchAccess = useServerFn(getAgentAccess);
  const { data: access } = useQuery({
    queryKey: ["agent-access"],
    queryFn: () => fetchAccess(),
    enabled: !!user,
    staleTime: 15_000,
  });
  const hasAccess = !!access?.hasAccess;

  const handleActivate = () => {
    const saved = loadIdeaParams();
    if (saved && saved.idea.trim().length >= 8) {
      navigate({ to: "/riepilogo-idea" });
    } else {
      navigate({ to: "/" });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-lg gradient-bg grid place-items-center glow-soft">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            Da Idea ad <span className="gradient-text">App</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links
            .filter((l) => !l.auth || user)
            .map((l) => {
              const active = path === l.to || (l.to !== "/" && path.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to as never}
                  className={
                    "px-3 py-2 rounded-md text-sm transition-colors " +
                    (active
                      ? "text-foreground bg-secondary/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {hasAccess ? (
                <Link to="/agente-ai" title="Accesso sbloccato">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-primary/50 bg-primary/10 text-primary glow-soft">
                    <Check className="size-3.5" /> Agente AI attivo
                  </span>
                </Link>
              ) : (
                <Button
                  variant="hero"
                  size="sm"
                  onClick={handleActivate}
                  title="Sblocca il tuo agente personale"
                  className="hidden sm:inline-flex"
                >
                  <Lock className="size-3.5" /> Attiva agente AI - 29€
                </Button>
              )}
              <span className="hidden sm:block text-xs text-muted-foreground max-w-[160px] truncate">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Accedi
                </Button>
              </Link>
              <Link to="/">
                <Button variant="hero" size="sm">
                  Inizia ora
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {user && !hasAccess && (
        <div className="sm:hidden border-t border-border/40 px-6 py-2 flex justify-center">
          <Button variant="hero" size="sm" onClick={handleActivate} className="w-full">
            <Lock className="size-3.5" /> Attiva agente AI - 29€
          </Button>
        </div>
      )}
    </header>
  );
}
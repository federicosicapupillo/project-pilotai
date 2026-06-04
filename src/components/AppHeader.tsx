import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const links: { to: string; label: string; auth?: boolean }[] = [
  { to: "/", label: "Home" },
  { to: "/method", label: "Metodo" },
  { to: "/dashboard", label: "Dashboard", auth: true },
  { to: "/library", label: "Libreria prompt", auth: true },
];

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

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
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  Inizia ora
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
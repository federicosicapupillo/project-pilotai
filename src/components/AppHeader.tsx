import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, LogOut, ShieldCheck, Lock, MessageSquare, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useActivateTeam } from "@/hooks/use-activate-team";

const links: { to: string; label: string; auth?: boolean }[] = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Strumenti" },
  { to: "/agents", label: "Agenti" },
  { to: "/prezzi", label: "Prezzi" },
  { to: "/dashboard", label: "Dashboard", auth: true },
];

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const { activate, hasAccess } = useActivateTeam();
  const handleActivate = () => void activate("navbar");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const [profileName, setProfileName] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setProfileName(null);
      return;
    }
    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfileName((data?.name ?? null) as string | null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const isEmailLike = (s: string) => !s || s.includes("@");
  const firstLast = [
    str(meta.first_name) || str(meta.nome),
    str(meta.last_name) || str(meta.cognome) || str(meta.surname),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const metaName =
    firstLast ||
    (!isEmailLike(str(meta.full_name)) && str(meta.full_name)) ||
    (!isEmailLike(str(meta.name)) && str(meta.name)) ||
    "";
  const cleanProfileName = profileName && !isEmailLike(profileName.trim()) ? profileName.trim() : "";
  const displayName = (metaName || cleanProfileName || "Utente").trim();
  const firstName = displayName.split(/\s+/)[0];

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
                <>
                  <Link
                    to="/project-manager"
                    title="Parla con il Project Manager"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <MessageSquare className="size-3.5" />
                    <span className="hidden md:inline">Parla con il Project Manager</span>
                    <span className="md:hidden">Project Manager</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    title="Il tuo Team AI è attivo"
                    aria-label="Accesso attivo"
                    className="inline-grid place-items-center size-7 rounded-full border border-primary/40 bg-primary/5 text-primary/90 hover:bg-primary/10 transition-colors"
                  >
                    <ShieldCheck className="size-3.5" />
                  </Link>
                </>
              ) : (
                <Button
                  variant="hero"
                  size="sm"
                  onClick={handleActivate}
                  title="Sblocca il tuo agente personale"
                  className="hidden sm:inline-flex"
                >
                   <Lock className="size-3.5" /> Attiva Team AI - 29€
                </Button>
              )}
              <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-border/50 bg-secondary/40 max-w-[220px]">
                <UserCircle2 className="size-4 text-primary shrink-0" aria-label="Account" />
                <span className="text-xs text-foreground/90 truncate" title={displayName}>
                  <span className="hidden sm:inline">{displayName}</span>
                  <span className="sm:hidden">{firstName}</span>
                </span>
              </div>
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
           <Lock className="size-3.5" /> Attiva Team AI - 29€
          </Button>
        </div>
      )}
    </header>
  );
}
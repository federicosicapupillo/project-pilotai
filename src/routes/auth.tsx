import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accedi — IdeaPilot AI" },
      { name: "description", content: "Entra o crea il tuo account per iniziare un progetto." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleOAuth = async (provider: "google" | "apple") => {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error("Accesso non riuscito. Riprova.");
      return;
    }
  };

  const consumeRedirect = (): string | null => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem("post_auth_redirect");
    if (v) localStorage.removeItem("post_auth_redirect");
    return v;
  };

  if (!loading && user) {
    const target = consumeRedirect();
    if (target === "/checkout-agente") return <Navigate to="/checkout-agente" replace />;
    if (target === "/new-project") return <Navigate to="/new-project" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Bentornato!");
    const target = consumeRedirect();
    if (target === "/checkout-agente") navigate({ to: "/checkout-agente" });
    else if (target === "/new-project") navigate({ to: "/new-project" });
    else navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Account creato!");
      const target = consumeRedirect();
      if (target === "/checkout-agente") navigate({ to: "/checkout-agente" });
      else if (target === "/new-project") navigate({ to: "/new-project" });
      else navigate({ to: "/dashboard" });
    } else {
      toast.success("Account creato! Controlla la tua email per confermare, poi accedi.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid place-items-center px-6 py-16 hero-bg">
        <div className="w-full max-w-md glass-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-11 rounded-xl gradient-bg grid place-items-center glow-soft">
              <BrandMark size={24} />
            </div>
            <div>
              <h1 className="font-display font-semibold text-xl">
                IdeaPilot <span className="gradient-text">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground">Dalla tua idea alla tua prima app</p>
            </div>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Accedi</TabsTrigger>
              <TabsTrigger value="signup">Crea account</TabsTrigger>
            </TabsList>

            <div className="space-y-2 mb-4">
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => handleOAuth("google")}>
                <svg className="size-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                Continua con Google
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => handleOAuth("apple")}>
                <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Continua con Apple
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">oppure con email</span></div>
              </div>
            </div>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">Email</Label>
                  <Input id="email-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd-in">Password</Label>
                  <Input id="pwd-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                  {busy ? "Attendere..." : "Accedi"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-up">Nome</Label>
                  <Input id="name-up" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">Email</Label>
                  <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd-up">Password</Label>
                  <Input id="pwd-up" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                  {busy ? "Attendere..." : "Crea il tuo account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
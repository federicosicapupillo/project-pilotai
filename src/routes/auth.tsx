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
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const PASSWORD_SPECIAL = /[!@#$%^&*?_\-.]/;

function checkPassword(pwd: string) {
  return {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: PASSWORD_SPECIAL.test(pwd),
  };
}

function isPasswordValid(pwd: string) {
  const c = checkPassword(pwd);
  return c.length && c.upper && c.lower && c.number && c.special;
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accedi — IdeaPilot AI" },
      { name: "description", content: "Entra o crea il tuo account per iniziare un progetto." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signup" || search.mode === "signin" ? search.mode : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();
  const search = Route.useSearch();
  const defaultTab = search.mode === "signup" ? "signup" : "signin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwdIn, setShowPwdIn] = useState(false);
  const [showPwdUp, setShowPwdUp] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

  const pwdChecks = checkPassword(password);
  const pwdValid = isPasswordValid(password);
  const pwdMatch = password.length > 0 && password === confirmPassword;
  const signupDisabled =
    busy ||
    !name.trim() ||
    !email.trim() ||
    !pwdValid ||
    !confirmPassword ||
    !pwdMatch;

  const handleOAuth = async (provider: "google" | "apple") => {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error(t("auth.toast.oauthFail"));
      return;
    }
  };

  const consumeRedirect = (): string | null => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem("post_auth_redirect");
    if (v) localStorage.removeItem("post_auth_redirect");
    return v;
  };

  // Whitelist internal redirect destinations to avoid open-redirect issues.
  const safeRedirect = (target: string | null): string | null => {
    if (!target) return null;
    if (
      target === "/checkout-agente" ||
      target === "/new-project" ||
      target === "/dashboard" ||
      /^\/account\/ideas\/[a-f0-9-]{10,}$/i.test(target)
    ) {
      return target;
    }
    return null;
  };

  if (!loading && user) {
    const target = safeRedirect(consumeRedirect());
    if (target === "/checkout-agente") return <Navigate to="/checkout-agente" replace />;
    if (target === "/new-project") return <Navigate to="/new-project" replace />;
    if (target && target.startsWith("/account/ideas/")) {
      return <Navigate to={target} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.toast.welcome"));
    const target = safeRedirect(consumeRedirect());
    if (target === "/checkout-agente") navigate({ to: "/checkout-agente" });
    else if (target === "/new-project") navigate({ to: "/new-project" });
    else if (target && target.startsWith("/account/ideas/")) navigate({ to: target });
    else navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(password)) {
      return toast.error(t("auth.err.pwdRules"));
    }
    if (password !== confirmPassword) {
      return toast.error(t("auth.err.pwdMatch"));
    }
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
      toast.success(t("auth.toast.created"));
      const target = safeRedirect(consumeRedirect());
      if (target === "/checkout-agente") navigate({ to: "/checkout-agente" });
      else if (target === "/new-project") navigate({ to: "/new-project" });
      else if (target && target.startsWith("/account/ideas/")) navigate({ to: target });
      else navigate({ to: "/dashboard" });
    } else {
      toast.success(t("auth.toast.createdConfirm"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid place-items-center px-6 py-16 hero-bg">
        <div className="w-full max-w-md glass-card rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <BrandMark size={48} className="drop-shadow-[0_0_14px_rgba(168,85,247,0.5)]" />
            <div>
              <h1 className="font-display font-semibold text-xl">
                IdeaPilot <span className="gradient-text">{t("brand.ai")}</span>
              </h1>
              <p className="text-xs text-muted-foreground">{t("brand.tagline")}</p>
            </div>
          </div>

          <Tabs defaultValue={defaultTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">{t("auth.signin")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>

            <div className="space-y-2 mb-4">
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => handleOAuth("google")}>
                <svg className="size-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                {t("auth.continueGoogle")}
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => handleOAuth("apple")}>
                <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                {t("auth.continueApple")}
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">{t("auth.orEmail")}</span></div>
              </div>
            </div>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">{t("auth.email")}</Label>
                  <Input id="email-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd-in">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="pwd-in"
                      type={showPwdIn ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdIn((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPwdIn ? t("auth.hide") : t("auth.show")}
                    >
                      {showPwdIn ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                  {busy ? t("auth.wait") : t("auth.signin")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-up">{t("auth.name")}</Label>
                  <Input id="name-up" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">{t("auth.email")}</Label>
                  <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd-up">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="pwd-up"
                      type={showPwdUp ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdUp((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPwdUp ? t("auth.hide") : t("auth.show")}
                    >
                      {showPwdUp ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <ul className="text-xs space-y-1 mt-2">
                    {[
                      { ok: pwdChecks.length, label: t("auth.pwd.length") },
                      { ok: pwdChecks.upper, label: t("auth.pwd.upper") },
                      { ok: pwdChecks.lower, label: t("auth.pwd.lower") },
                      { ok: pwdChecks.number, label: t("auth.pwd.number") },
                      { ok: pwdChecks.special, label: t("auth.pwd.special") },
                    ].map((r) => (
                      <li
                        key={r.label}
                        className={cn(
                          "flex items-center gap-2 transition-colors",
                          r.ok ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {r.ok ? <Check className="size-3.5" /> : <X className="size-3.5 opacity-60" />}
                        <span>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd-confirm">{t("auth.passwordConfirm")}</Label>
                  <div className="relative">
                    <Input
                      id="pwd-confirm"
                      type={showPwdConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdConfirm((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPwdConfirm ? t("auth.hide") : t("auth.show")}
                    >
                      {showPwdConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !pwdMatch && (
                    <p className="text-xs text-destructive">{t("auth.pwd.mismatch")}</p>
                  )}
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={signupDisabled}>
                  {busy ? t("auth.wait") : t("auth.signupCta")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
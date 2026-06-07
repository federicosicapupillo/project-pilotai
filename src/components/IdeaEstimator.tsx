import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToolIcon } from "@/components/ToolIcon";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { ReusableToolkitBox, getReuseBadge } from "@/components/ReusableToolkitBox";
import { IdeaAnalysisDialog } from "@/components/IdeaAnalysisDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ArrowRight, Wand2, Gauge, Clock, Activity, Layers, Wallet,
  TrendingUp, Calculator, Wrench, AlertCircle, Repeat, Target, Info,
  Euro, CheckCircle2, AlertTriangle, XCircle, Lightbulb, Eye,
  BarChart3, Rocket, Zap, Gem, HelpCircle, Check, FileText, LogIn,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { useT } from "@/lib/i18n";
import {
  classify, getBudget, fmt, BUDGET_OPTIONS,
  saveIdeaParams,
  type Difficulty, type RevenueModel, type PriceBand,
  type BudgetBand, type Estimate, type IdeaParams,
} from "@/lib/idea-estimate";
import { useServerFn } from "@tanstack/react-start";
import { saveIdeaRun } from "@/lib/idea-runs.functions";
import { hashIdea, normalizeIdea } from "@/lib/idea-deterministic";
import { getAnonSessionId } from "@/lib/anon-session";
import { useAuth } from "@/hooks/use-auth";
import {
  getBudgetScope, PRICING_VERSION, PROMPT_VERSION,
  type BudgetScope,
} from "@/lib/pricing-config";

const RECOMMENDED_BY_TYPE: Record<string, { label: string; min: number; max: number }> = {
  "Landing page":   { label: "100€ – 300€",     min: 100,  max: 300 },
  "Web app":        { label: "300€ – 700€",     min: 300,  max: 700 },
  "App interna":    { label: "300€ – 700€",     min: 300,  max: 700 },
  "CRM":            { label: "700€ – 1.500€",   min: 700,  max: 1500 },
  "Dashboard":      { label: "700€ – 1.500€",   min: 700,  max: 1500 },
  "Gestionale":     { label: "700€ – 1.500€",   min: 700,  max: 1500 },
  "Marketplace":    { label: "1.500€ – 3.000€", min: 1500, max: 3000 },
  "App con AI":     { label: "1.500€ – 3.000€", min: 1500, max: 3000 },
};

type BudgetFit = "Dentro il budget" | "Al limite del budget" | "Fuori budget, da semplificare";

function recommendedBudget(projectType: string, difficulty: Difficulty) {
  const base = RECOMMENDED_BY_TYPE[projectType] ?? RECOMMENDED_BY_TYPE["Web app"];
  // Bump for advanced/complex projects with heavy features
  if (difficulty === "Complessa") return { label: "3.000€+", min: 3000, max: 6000 };
  if (difficulty === "Avanzata" && base.max < 1500) {
    return { label: "700€ – 1.500€", min: 700, max: 1500 };
  }
  return base;
}

function budgetFit(insertedMax: number, rec: { min: number; max: number }): BudgetFit {
  if (insertedMax >= rec.min) return "Dentro il budget";
  if (insertedMax >= rec.min * 0.5) return "Al limite del budget";
  return "Fuori budget, da semplificare";
}

const REDIRECT_KEY = "post_auth_redirect";

type BudgetMeta = { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; sublabel: string; tone: "cyan" | "indigo" | "violet" | "magenta" };
const BUDGET_META: Record<string, BudgetMeta> = {
  "100€ – 300€":     { Icon: BarChart3,  sublabel: "Essenziale",  tone: "cyan" },
  "300€ – 700€":     { Icon: TrendingUp, sublabel: "Ideale",      tone: "indigo" },
  "700€ – 1.500€":   { Icon: Rocket,     sublabel: "Consigliato", tone: "magenta" },
  "1.500€ – 3.000€": { Icon: Zap,        sublabel: "Avanzato",    tone: "violet" },
  "3.000€+":         { Icon: Gem,        sublabel: "Premium",     tone: "violet" },
};

export type IdeaEstimatorProps = { embed?: boolean };

export function IdeaEstimator({ embed = false }: IdeaEstimatorProps) {
  const { t, locale } = useT();
  const { user } = useAuth();
  const [idea, setIdea] = useState("");
  const [budget, setBudget] = useState<BudgetBand>("");
  const [target, setTarget] = useState("");
  const [targetChoice, setTargetChoice] = useState<string>("Non lo so ancora");
  const [revenue, setRevenue] = useState<RevenueModel>("Non lo so ancora");
  const [price, setPrice] = useState<PriceBand>("Non lo so");
  const [result, setResult] = useState<Estimate | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisParams, setAnalysisParams] = useState<IdeaParams | null>(null);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [readyOpen, setReadyOpen] = useState(false);
  const [pendingRunId, setPendingRunId] = useState<string | null>(null);
  const justRevealed = useRef(false);
  const navigate = useNavigate();
  const persistRun = useServerFn(saveIdeaRun);

  const persistCalculatorRun = async (
    ideaText: string,
    r: Estimate,
    scope: BudgetScope,
    extra: { source: "manual" | "generated" },
  ): Promise<string | null> => {
    try {
      const traditional = r.costAgencyHigh;
      const teamAi = 29;
      const res = await persistRun({
        data: {
          ideaText,
          normalizedIdeaText: normalizeIdea(ideaText),
          ideaHash: hashIdea(ideaText),
          language: locale,
          sessionId: getAnonSessionId(),
          selectedBudgetRange: budget,
          targetUser: target || targetChoice,
          revenueModel: revenue,
          suggestedPrice: price,
          estimatedHoursMin: r.hoursLow,
          estimatedHoursMax: r.hoursHigh,
          estimatedDevCostMin: r.costRecLow,
          estimatedDevCostMax: r.costRecHigh,
          estimatedPotentialRevenueMin: r.potentialLow,
          estimatedPotentialRevenueMax: r.potentialHigh,
          traditionalCostEstimate: traditional,
          teamAiCost: teamAi,
          estimatedSavings: Math.max(0, traditional - teamAi),
          featuresInScope: scope.inScope,
          featuresOutOfScope: scope.outOfScope,
          recommendedMvpScope: scope.recommendedMvpScope,
          pricingVersion: PRICING_VERSION,
          promptVersion: PROMPT_VERSION,
          optionalDetails: {
            source: extra.source,
            projectType: r.projectType,
            difficulty: r.difficulty,
            tier: scope.tier,
          },
        },
      });
      return res?.id ?? null;
    } catch (err) {
      console.error("[persistCalculatorRun] failed", err);
      return null;
    }
  };

  const revealResults = () => {
    justRevealed.current = true;
    // Smooth scroll after the result has rendered.
    setTimeout(() => {
      if (typeof window === "undefined") return;
      const el = document.getElementById("estimator-result");
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }, 80);
  };

  const runAnalysis = (
    p: IdeaParams,
    r: Estimate,
    source: "manual" | "generated",
    extraTrack?: () => void,
  ) => {
    setResult(null); // reset so the reveal animation re-triggers
    setAnalysisParams(p);
    setLoadingError(null);
    setLoadingOpen(true);
    const scope = getBudgetScope(budget, r.signals);
    try {
      persistCalculatorRun(p.idea, r, scope, { source });
      extraTrack?.();
    } catch {
      /* never throw */
    }
    // Lightweight perceived-processing delay; results are already computed.
    window.setTimeout(() => {
      try {
        setResult(r);
        setLoadingOpen(false);
        revealResults();
      } catch (err) {
        console.error("[IdeaEstimator] reveal failed", err);
        setLoadingError("est.loader.error");
      }
    }, 1400);
  };

  const onCalc = () => {
    if (idea.trim().length < 8) return;
    const r = classify(idea, target, revenue, price);
    const p: IdeaParams = { idea: idea.trim(), budget, target: target || targetChoice, revenue, price };
    saveIdeaParams(p);
    const scope = getBudgetScope(budget, r.signals);
    runAnalysis(p, r, "manual", () => {
      void trackEvent("idea_estimate_calculated", {
      hoursLow: r.hoursLow, hoursHigh: r.hoursHigh,
      difficulty: r.difficulty, projectType: r.projectType,
      costAiLow: r.costAiLow, costAiHigh: r.costAiHigh,
      monthlyLow: r.monthlyLow, monthlyHigh: r.monthlyHigh,
      potentialLabel: r.potentialLabel,
      budget,
      tier: scope.tier,
      pricingVersion: PRICING_VERSION,
      });
    });
  };

  const handleGeneratedIdea = (description: string) => {
    setIdea(description);
    const r = classify(description, target, revenue, price);
    const p: IdeaParams = { idea: description.trim(), budget, target: target || targetChoice, revenue, price };
    saveIdeaParams(p);
    runAnalysis(p, r, "generated", () => {
      void trackEvent("idea_estimate_from_generator", {
        difficulty: r.difficulty, projectType: r.projectType,
      });
    });
  };

  const goToRoadmap = () => {
    if (typeof window !== "undefined" && idea.trim()) {
      saveIdeaParams({ idea: idea.trim(), budget, target: target || targetChoice, revenue, price });
      localStorage.setItem(REDIRECT_KEY, "/new-project");
      localStorage.setItem("pending_plan", "roadmap");
    }
    void trackEvent("cta_roadmap_29");
    navigate({ to: "/prezzi" });
  };

  const card = (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-primary/20 glow-soft">
      {!embed && (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/85">
            <Gauge className="size-3.5 text-primary" /> {t("est.eyebrow")}
          </div>
          <h2 className="font-display font-semibold text-[1.75rem] sm:text-4xl lg:text-[2.5rem] mt-4 leading-[1.12] tracking-tight text-balance max-w-3xl">
            <EstimatorTitle locale={locale} />
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-foreground/70 mt-4 max-w-2xl leading-relaxed text-balance">
            {t("est.desc")}
          </p>
        </>
      )}

      <div className={embed ? "space-y-3" : "mt-5 space-y-3"}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] uppercase tracking-[0.2em] font-semibold text-foreground/90">
              {t("est.label.idea")}
            </label>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {idea.length}/2000
            </span>
          </div>
          <div
            className="relative rounded-2xl overflow-hidden transition-all duration-300 focus-within:scale-[1.005]"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--primary) 6%, hsl(222 47% 7%)) 0%, hsl(222 47% 6%) 100%)",
              boxShadow:
                "0 0 0 1px color-mix(in oklab, var(--primary) 25%, transparent), 0 10px 40px -20px color-mix(in oklab, var(--primary) 40%, transparent), inset 0 1px 0 color-mix(in oklab, white 6%, transparent)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={t("est.placeholder.idea")}
              rows={6}
              maxLength={2000}
              className="text-base sm:text-[17px] leading-relaxed text-foreground placeholder:text-foreground/55 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]"
            />
          </div>
          <p className="text-xs text-muted-foreground/80 mt-2 pl-1">
            {t("est.hint.idea")}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1.5 pl-1">
            {t("est.hint.privacy")}
          </p>
        </div>

        {/* Budget operativo — campo evidenziato */}
        <div
          className="relative rounded-3xl p-5 sm:p-7 border border-primary/30 overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--primary) 8%, hsl(222 47% 6%)) 0%, hsl(222 47% 5%) 60%, color-mix(in oklab, var(--accent) 6%, hsl(222 47% 6%)) 100%)",
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--primary) 18%, transparent), 0 20px 60px -30px color-mix(in oklab, var(--primary) 60%, transparent), 0 8px 30px -20px color-mix(in oklab, var(--accent) 50%, transparent)",
          }}
        >
          {/* soft neon ambient blobs */}
          <div className="pointer-events-none absolute -top-24 -left-16 size-56 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-56 rounded-full bg-accent/15 blur-3xl" aria-hidden />

          <div className="relative flex items-start gap-4">
            <div
              className="relative size-12 rounded-2xl grid place-items-center shrink-0"
              style={{
                background: "linear-gradient(135deg, hsl(265 85% 60%), hsl(320 75% 60%))",
                boxShadow: "0 0 24px -4px hsl(265 85% 60% / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.18)",
              }}
            >
              <Euro className="size-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-lg sm:text-xl tracking-tight">{t("est.budget.title")}</div>
              <div className="mt-1.5 h-px w-12 bg-gradient-to-r from-primary/60 to-transparent" aria-hidden />
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {t("est.budget.desc")}
              </p>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {BUDGET_OPTIONS.filter((b) => b.label !== "Non lo so ancora").map((b) => {
              const active = budget === b.label;
              const meta = BUDGET_META[b.label] ?? { Icon: BarChart3, sublabel: "", tone: "indigo" as const };
              const recommended = b.label === "700€ – 1.500€";
              const Icon = meta.Icon;
              return (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setBudget(active ? "" : b.label)}
                  aria-pressed={active}
                  className={`group relative h-[124px] rounded-2xl border overflow-hidden text-left transition-all duration-200 will-change-transform ${
                    active
                      ? "-translate-y-0.5"
                      : "hover:-translate-y-0.5"
                  } ${
                    recommended
                      ? active
                        ? "border-fuchsia-400/70"
                        : "border-fuchsia-400/40 hover:border-fuchsia-300/70"
                      : active
                        ? "border-primary/70"
                        : "border-white/[0.07] hover:border-primary/40"
                  }`}
                  style={{
                    background: active
                      ? recommended
                        ? "linear-gradient(135deg, color-mix(in oklab, hsl(320 85% 60%) 22%, hsl(222 47% 6%)) 0%, color-mix(in oklab, var(--primary) 18%, hsl(222 47% 6%)) 100%)"
                        : "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, hsl(222 47% 6%)) 0%, color-mix(in oklab, var(--accent) 16%, hsl(222 47% 6%)) 100%)"
                      : recommended
                        ? "linear-gradient(135deg, color-mix(in oklab, hsl(320 85% 60%) 10%, hsl(222 47% 7%)) 0%, color-mix(in oklab, var(--primary) 8%, hsl(222 47% 7%)) 100%)"
                        : "linear-gradient(160deg, hsl(222 47% 7% / 0.85) 0%, hsl(222 47% 5% / 0.85) 100%)",
                    boxShadow: active
                      ? recommended
                        ? "0 0 0 1px hsl(320 85% 65% / 0.55), 0 14px 38px -16px hsl(320 85% 60% / 0.7), inset 0 1px 0 hsl(0 0% 100% / 0.06)"
                        : "0 0 0 1px hsl(var(--primary) / 0.55), 0 14px 34px -14px hsl(var(--primary) / 0.65), inset 0 1px 0 hsl(0 0% 100% / 0.06)"
                      : recommended
                        ? "0 10px 28px -18px hsl(320 85% 60% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.04)"
                        : "inset 0 1px 0 hsl(0 0% 100% / 0.03)",
                  }}
                >
                  {/* Recommended badge */}
                  {recommended && (
                    <span
                      className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-white"
                      style={{
                        background: "linear-gradient(135deg, hsl(265 85% 60%), hsl(320 85% 60%))",
                        boxShadow: "0 4px 14px -4px hsl(320 85% 60% / 0.7)",
                      }}
                    >
                      {active ? (<><Check className="size-2.5" strokeWidth={3} /> Scelto</>) : "Consigliato"}
                    </span>
                  )}
                  {/* Selected check (non-recommended) */}
                  {active && !recommended && (
                    <span
                      className="absolute top-2 right-2 z-10 inline-flex size-5 items-center justify-center rounded-full text-white"
                      style={{ background: "linear-gradient(135deg, hsl(220 90% 60%), hsl(265 85% 60%))" }}
                      aria-hidden
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}

                  {/* Hover sheen */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--primary) 14%, transparent) 0%, transparent 60%)",
                    }}
                    aria-hidden
                  />

                  <div className="relative flex h-full flex-col items-center justify-center gap-2 px-3 py-3">
                    <span
                      className="grid size-9 place-items-center rounded-xl"
                      style={{
                        background: recommended
                          ? "linear-gradient(135deg, hsl(265 85% 60%), hsl(320 85% 60%))"
                          : meta.tone === "cyan"
                            ? "linear-gradient(135deg, hsl(195 90% 55%), hsl(220 90% 60%))"
                            : meta.tone === "violet"
                              ? "linear-gradient(135deg, hsl(250 85% 62%), hsl(280 80% 60%))"
                              : "linear-gradient(135deg, hsl(220 90% 60%), hsl(250 85% 60%))",
                        boxShadow: "0 6px 18px -6px hsl(220 90% 60% / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
                      }}
                    >
                      <Icon className="size-4 text-white" strokeWidth={2.4} />
                    </span>
                    <span className={`font-display font-semibold text-[15px] tracking-tight whitespace-nowrap ${active ? "text-white" : "text-foreground/95"}`}>
                      {b.display}
                    </span>
                    <span
                      className={`text-[11px] font-medium uppercase tracking-[0.08em] ${
                        recommended
                          ? "text-fuchsia-200/90"
                          : active
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                      }`}
                    >
                      {meta.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Non lo so ancora — full width, dashed elegant */}
          {(() => {
            const b = BUDGET_OPTIONS.find((o) => o.label === "Non lo so ancora")!;
            const active = budget === b.label;
            return (
              <button
                type="button"
                onClick={() => setBudget(active ? "" : b.label)}
                aria-pressed={active}
                className={`group relative mt-3 w-full h-14 rounded-2xl border border-dashed transition-all duration-200 flex items-center justify-center gap-2.5 ${
                  active
                    ? "border-primary/70 text-white"
                    : "border-white/15 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  background: active
                    ? "linear-gradient(135deg, color-mix(in oklab, var(--primary) 16%, hsl(222 47% 6%)), color-mix(in oklab, var(--accent) 12%, hsl(222 47% 6%)))"
                    : "linear-gradient(160deg, hsl(222 47% 7% / 0.6) 0%, hsl(222 47% 5% / 0.6) 100%)",
                  boxShadow: active
                    ? "0 0 0 1px hsl(var(--primary) / 0.5), 0 10px 26px -14px hsl(var(--primary) / 0.55)"
                    : undefined,
                }}
              >
                <HelpCircle className={`size-4 transition-colors ${active ? "text-white" : "text-muted-foreground group-hover:text-primary"}`} />
                <span className="text-sm font-medium">{b.display}</span>
              </button>
            );
          })()}
        </div>

        {/* Domande facoltative */}
        <details className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-colors [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer text-sm px-4 py-3 text-muted-foreground hover:text-foreground flex items-center gap-2 list-none">
            <span
              className="inline-grid place-items-center size-5 rounded-md border border-white/10 bg-white/[0.03] text-primary transition-transform group-open:rotate-90"
              aria-hidden
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 1.5L6.5 5L3 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span>{t("est.optional.toggle")}</span>
          </summary>
          <div className="grid sm:grid-cols-3 gap-3 p-3 pt-1">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("est.optional.target")}</label>
              <select
                value={targetChoice}
                onChange={(e) => {
                  const v = e.target.value;
                  setTargetChoice(v);
                  if (v === "Altro") setTarget("");
                  else if (v === "Non lo so ancora") setTarget("");
                  else setTarget(v);
                }}
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {[
                  "Non lo so ancora",
                  "Freelance",
                  "Aziende / B2B",
                  "Negozi / Retail",
                  "Palestre / Fitness",
                  "Creator / Influencer",
                  "Professionisti",
                  "Hotel / Turismo",
                  "Scuole / Formazione",
                  "Eventi",
                  "Medici / Studi professionali",
                  "Artigiani",
                  "Privati / Consumer",
                  "Altro",
                ].map((o) => (
                  <option key={o} value={o} className="bg-background">{o}</option>
                ))}
              </select>
              {targetChoice === "Altro" && (
                <div className="mt-2">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Specifica il target</label>
                  <Input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Scrivi il target a cui vuoi vendere l'app"
                    className="mt-1"
                    maxLength={200}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("est.optional.revenue")}</label>
              <select
                value={revenue}
                onChange={(e) => setRevenue(e.target.value as RevenueModel)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {["Non lo so ancora", "Abbonamento", "Vendita una tantum", "Commissione", "Lead generation", "Servizio premium", "Uso interno per risparmiare tempo", "Licenza B2B", "Altro"].map((o) => (
                  <option key={o} value={o} className="bg-background">{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("est.optional.price")}</label>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value as PriceBand)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {["Non lo so", "9€–29€", "49€–97€", "197€–497€", "500€+", "Abbonamento mensile"].map((o) => (
                  <option key={o} value={o} className="bg-background">{o}</option>
                ))}
              </select>
            </div>
          </div>
        </details>

        {/* Primary CTA */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="hero"
              size="xl"
              onClick={onCalc}
              disabled={idea.trim().length < 8 || loadingOpen}
              className="shadow-lg shadow-primary/20"
            >
              <Wand2 className="size-4" />
              {loadingOpen ? t("est.btn.calcInProgress") : t("est.btn.calc")}
            </Button>
            {analysisParams && !loadingOpen && result && (
              <Button
                variant="glass"
                size="lg"
                onClick={() => setAnalysisOpen(true)}
              >
                <Eye className="size-4" /> {t("est.btn.review")}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("est.btn.note")}
          </p>
        </div>

        {/* Divider before secondary path */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background/80 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              oppure
            </span>
          </div>
        </div>

        {/* Secondary path: idea generator */}
        <IdeaGenerator
          onSelect={handleGeneratedIdea}
          presetBudget={budget}
          presetTarget={target || targetChoice}
          presetRevenue={revenue}
          presetPrice={price}
          triggerLabel="Genera 3 idee per me"
        />
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <ResultCard result={result} budget={budget} onRoadmap={goToRoadmap} />
        </div>
      )}
      <AnalysisLoadingDialog
        open={loadingOpen}
        error={loadingError}
        onRetry={() => {
          setLoadingError(null);
          onCalc();
        }}
        onClose={() => setLoadingOpen(false)}
      />
      <IdeaAnalysisDialog
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
        params={analysisParams}
      />
    </div>
  );

  if (embed) return card;

  return (
    <section className="relative">
      <div className="max-w-3xl mx-auto px-6 -mt-10 pb-10">{card}</div>
    </section>
  );
}

function AnalysisLoadingDialog({
  open,
  error,
  onRetry,
  onClose,
}: {
  open: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const steps = [
    t("est.loader.step1"),
    t("est.loader.step2"),
    t("est.loader.step3"),
    t("est.loader.step4"),
  ];
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!open) {
      setStepIdx(0);
      setProgress(8);
      return;
    }
    const stepTimer = window.setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    }, 350);
    const progTimer = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + 7));
    }, 120);
    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(progTimer);
    };
  }, [open, steps.length]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && error) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md border-primary/30"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--primary) 10%, hsl(222 47% 6%)) 0%, hsl(222 47% 5%) 100%)",
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--primary) 25%, transparent), 0 30px 80px -40px color-mix(in oklab, var(--primary) 70%, transparent)",
        }}
      >
        {error ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-400" />
                  Ops…
                </span>
              </DialogTitle>
              <DialogDescription>{t(error)}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={onClose}>
                Chiudi
              </Button>
              <Button variant="hero" size="sm" onClick={onRetry}>
                Riprova
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl tracking-tight">
                <span className="inline-flex items-center gap-2.5">
                  <span
                    className="grid size-9 place-items-center rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(220 90% 60%), hsl(280 80% 60%))",
                      boxShadow:
                        "0 0 20px -4px hsl(265 85% 60% / 0.6), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
                    }}
                  >
                    <Sparkles className="size-4 text-white animate-pulse" />
                  </span>
                  {t("est.loader.title")}
                </span>
              </DialogTitle>
              <DialogDescription className="pt-1">
                {t("est.loader.desc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Progress value={progress} className="h-1.5" />
              <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <span key={stepIdx} className="animate-in fade-in duration-300">
                  {steps[stepIdx]}…
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultCard({ result, budget, onRoadmap }: { result: Estimate; budget: BudgetBand; onRoadmap: () => void }) {
  const baseCost = Math.round((result.costRecLow + result.costRecHigh) / 2);
  const inserted = getBudget(budget);
  const highBudget = !!inserted && inserted.max >= 1500;
  const breakEvenPrices = highBudget ? [97, 297, 497] : [29, 97, 297];

  const hasBudget = !!inserted && budget !== "Non lo so ancora" && inserted.max > 0;
  const scope = getBudgetScope(budget, result.signals);

  let consiglio = "Puoi costruire una prima versione funzionante con database, dashboard base e flusso utente principale.";
  if (hasBudget && inserted!.max <= 300) {
    consiglio = "Parti con una versione più semplice: landing + raccolta richieste + dashboard manuale. Evita subito login complessi, pagamenti, chat e notifiche.";
  } else if (hasBudget && inserted!.max >= 1500) {
    consiglio = "Puoi valutare una prima versione più completa con login, ruoli, dashboard, pagamenti o notifiche, solo se servono davvero.";
  }

  return (
    <div
      id="estimator-result"
      className="mt-6 rounded-2xl p-5 sm:p-6 border border-primary/30 relative overflow-hidden space-y-5"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
      }}
    >
      {/* Top metrics */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Metric icon={Clock} label="Prima versione stimata" value={`${result.hoursLow}–${result.hoursHigh} ore`} accent />
        <Metric icon={Activity} label="Difficoltà" value={result.difficulty} />
        <Metric icon={Layers} label="Tipo progetto" value={result.projectType} />
      </div>

      {/* Difficulty bar */}
      <DifficultyBar level={result.difficulty} />

      {/* Costi mensili */}
      <Block icon={Repeat} title="Costi mensili degli strumenti">
        <div className="grid sm:grid-cols-2 gap-3">
          <CostBox
            label="Costi mensili essenziali"
            value={`${fmt(result.monthlyEssLow)} – ${fmt(result.monthlyEssHigh)}/mese`}
            highlight
          />
          <CostBox
            label="Con stack completo"
            value={`${fmt(result.monthlyFullLow)} – ${fmt(result.monthlyFullHigh)}/mese`}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.monthlyCategories.map((c) => (
            <span key={c} className="text-xs px-2 py-1 rounded-full bg-background/40 border border-border/60">
              {c}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Gli strumenti possono essere riutilizzati anche per altre app e progetti, quindi il costo non va attribuito solo a una singola idea.
        </p>
        <div className="mt-3">
          <ReusableToolkitBox variant="inline" />
        </div>
      </Block>

      {/* Tool consigliati */}
      <Block icon={Wrench} title="Strumenti consigliati">
        <div className="flex flex-wrap gap-2">
          {result.tools.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-border/60 text-sm"
              title={getReuseBadge(t)}
            >
              <ToolIcon name={t} size={16} />
              <span>{t}</span>
              <span className="text-[10px] uppercase tracking-wider text-primary/90 border border-primary/30 bg-primary/10 rounded-full px-1.5 py-0.5">
                {getReuseBadge(t)}
              </span>
            </span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          Nota importante: alcuni strumenti hanno abbonamenti mensili. Questi costi possono sembrare legati a una singola app, ma in realtà ti permettono di lavorare anche su altri progetti. Più idee sviluppi, più il costo degli strumenti si distribuisce.
        </p>
      </Block>

      {/* Risultati economici: hero + supporto */}
      <EconomicsHero result={result} />

      {/* Dettaglio scenari (supporto) */}
      <Block icon={BarChart3} title="Scenari di mercato">
        <div className="grid sm:grid-cols-3 gap-3">
          <ScenarioBox
            tone="prudent"
            label="Scenario prudente"
            customers={result.scenarios.prudent.customers}
            price={result.scenarios.prudent.price}
            revenue={result.scenarios.prudent.revenue}
          />
          <ScenarioBox
            tone="realistic"
            label="Scenario realistico"
            customers={result.scenarios.realistic.customers}
            price={result.scenarios.realistic.price}
            revenue={result.scenarios.realistic.revenue}
          />
          <ScenarioBox
            tone="ambitious"
            label="Scenario ambizioso, non garantito"
            customers={result.scenarios.ambitious.customers}
            price={result.scenarios.ambitious.price}
            revenue={result.scenarios.ambitious.revenue}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Stima orientativa basata su prezzo, target, modello di ricavo e capacità di acquisire clienti. Non è una promessa di guadagno.
        </p>
      </Block>

      {/* Modello di ricavo */}
      <Block icon={Target} title="Modello di ricavo consigliato">
        <ul className="space-y-1 text-sm">
          {result.revenueIdeas.map((r) => (
            <li key={r} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" /> {r}
            </li>
          ))}
        </ul>
      </Block>

      {/* Punto di pareggio */}
      <Block icon={Calculator} title="Quante vendite servono per rientrare?">
        <p className="text-xs text-muted-foreground mb-2">
          Se parti con un costo iniziale di <strong className="text-foreground">{fmt(baseCost)}</strong>, ti servirebbero circa:
        </p>
        <div className="grid sm:grid-cols-3 gap-2">
          {breakEvenPrices.map((p) => {
            const n = Math.max(1, Math.ceil(baseCost / p));
            return (
              <div key={p} className="rounded-xl bg-background/40 border border-border/60 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Prezzo {p}€</div>
                <div className="font-display font-semibold text-base mt-1">
                  ~{n} vendite
                </div>
              </div>
            );
          })}
        </div>
        {highBudget && (
          <p className="text-xs text-foreground/85 mt-3">
            Con un'offerta da <strong>497€</strong>, bastano poche vendite per recuperare il costo iniziale.
          </p>
        )}
        <p className="text-[11px] text-muted-foreground mt-2">
          Formula: costo iniziale stimato / prezzo ipotizzato = vendite per break-even.
        </p>
      </Block>

      {/* Messaggio chiave sotto i risultati */}
      <div className="relative overflow-hidden rounded-xl border border-primary/25 p-4"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 12%, transparent), color-mix(in oklab, var(--accent) 10%, transparent))",
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/90 leading-relaxed">
            Prima di spendere migliaia di euro per sviluppare tutto da zero, puoi <strong className="text-foreground">validare la tua idea</strong> e costruire una prima versione con un approccio più <strong className="text-foreground">guidato, sostenibile e realistico</strong>.
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 pl-7">
          Le stime mostrate sono orientative. I risultati reali dipendono da mercato, prezzo, offerta ed esecuzione.
        </p>
      </div>

      {/* Consiglio operativo */}
      <Block icon={Lightbulb} title="Consiglio operativo">
        <p className="text-sm text-foreground/90">{consiglio}</p>
      </Block>

      {/* Scope budget-driven: cosa puoi costruire / cosa rimandare */}
      {hasBudget && (
        <Block icon={Target} title={`Cosa puoi costruire con ${budget}`}>
          <p className="text-sm text-foreground/90 mb-3">{scope.recommendedMvpScope}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-emerald-300 mb-2">
                <CheckCircle2 className="size-3.5" /> In scope ora
              </div>
              <ul className="space-y-1.5">
                {scope.inScope.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-amber-300 mb-2">
                <AlertTriangle className="size-3.5" /> Da rimandare alla fase successiva
              </div>
              <ul className="space-y-1.5">
                {scope.outOfScope.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                    <XCircle className="size-3.5 text-amber-400/80 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong className="text-foreground/85">Prossimo step consigliato:</strong> {scope.nextStep}
          </p>
        </Block>
      )}

      {/* Cassetta degli attrezzi AI */}
      <ReusableToolkitBox showExample />

      {/* CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <Link to="/method">
          <Button variant="glass" size="lg">Voglio prima vedere il metodo</Button>
        </Link>
        <Button variant="hero" size="lg" onClick={onRoadmap}>
          Crea la roadmap completa a 29€ <ArrowRight className="size-4" />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-start gap-1">
        <Info className="size-3 mt-0.5 shrink-0" />
        La roadmap completa ti mostra step, agenti, strumenti, prompt e avanzamento percentuale per costruire la prima versione funzionante della tua app.
      </p>
    </div>
  );
}

function Metric({
  icon: Icon, label, value, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-background/40 border border-border/60 p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3 text-primary" /> {label}
      </div>
      <div className={`mt-1 font-display font-semibold text-lg ${accent ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}

function Block({
  icon: Icon, title, children,
}: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-background/30 border border-border/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
        <Icon className="size-3.5 text-primary" /> {title}
      </div>
      {children}
    </div>
  );
}

function CostBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? "border-primary/40 bg-primary/10" : "border-border/60 bg-background/40"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-base ${highlight ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}

function EconomicsHero({ result }: { result: Estimate }) {
  const potentialHigh = result.potentialHigh;
  const potentialLow = result.potentialLow;
  const tradHigh = result.costAgencyHigh;
  const aiMid = Math.round((result.costRecLow + result.costRecHigh) / 2);
  const savings = Math.max(0, tradHigh - aiMid);

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {/* HERO — Potenziale economico */}
      <div
        className="lg:col-span-3 relative overflow-hidden rounded-2xl border border-primary/40 p-5 sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, transparent), color-mix(in oklab, var(--accent) 22%, transparent))",
          boxShadow:
            "0 10px 40px -10px color-mix(in oklab, var(--primary) 45%, transparent)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full blur-3xl opacity-40"
          style={{ background: "color-mix(in oklab, var(--primary) 60%, transparent)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/90 bg-primary/30 border border-primary/40 rounded-full px-2.5 py-1">
              <TrendingUp className="size-3" /> Potenziale economico stimato
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 rounded-full px-2 py-0.5">
              Scenario realistico
            </span>
          </div>
          <div className="font-display font-bold leading-[1.02] text-4xl sm:text-5xl lg:text-[3.5rem] gradient-text">
            Fino a {fmt(potentialHigh)}
            <span className="text-2xl sm:text-3xl lg:text-4xl text-foreground/80 font-semibold">/mese</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Fascia indicativa: {fmt(potentialLow)} – {fmt(potentialHigh)} al mese
          </div>
          <p className="mt-3 text-sm text-foreground/90 leading-relaxed max-w-md">
            Se validata e proposta al pubblico giusto, questa app potrebbe generare entrate ricorrenti.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Stima orientativa, non garantita, basata su una prima ipotesi di mercato.
          </p>
        </div>
      </div>

      {/* Supporto — Costo tradizionale + Risparmio */}
      <div className="lg:col-span-2 grid gap-3">
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            <Wallet className="size-3.5 text-primary" /> Costo sviluppo tradizionale
          </div>
          <div className="font-display font-semibold text-2xl sm:text-3xl text-foreground/95">
            Fino a {fmt(tradHigh)}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Quanto avresti potuto spendere affidando analisi, progettazione e prima versione a freelance o agenzie esterne.
          </p>
        </div>
        <div
          className="rounded-2xl border border-emerald-500/30 p-4 sm:p-5"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, #10b981 14%, transparent), color-mix(in oklab, var(--primary) 10%, transparent))",
          }}
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-emerald-300 mb-2">
            <Sparkles className="size-3.5" /> Risparmio stimato con Team IA
          </div>
          <div className="font-display font-semibold text-2xl sm:text-3xl text-emerald-300">
            {fmt(savings)} risparmiati
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Confronto orientativo tra sviluppo tradizionale esterno e accesso guidato al Team IA.
          </p>
        </div>
      </div>
    </div>
  );
}

function ScenarioBox({
  tone, label, customers, price, revenue,
}: {
  tone: "prudent" | "realistic" | "ambitious";
  label: string;
  customers: number;
  price: number;
  revenue: number;
}) {
  const cls =
    tone === "ambitious"
      ? "border-primary/45 bg-primary/10"
      : tone === "realistic"
      ? "border-emerald-500/30 bg-emerald-500/[0.06]"
      : "border-border/60 bg-background/40";
  const valueCls =
    tone === "ambitious" ? "gradient-text" :
    tone === "realistic" ? "text-emerald-300" : "text-foreground";
  return (
    <div className={`rounded-xl p-3 border ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-lg ${valueCls}`}>
        {fmt(revenue)}/mese
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">
        {customers} clienti × {price}€
      </div>
    </div>
  );
}

function DifficultyBar({ level }: { level: Difficulty }) {
  const levels: Difficulty[] = ["Semplice", "Media", "Avanzata", "Complessa"];
  const idx = levels.indexOf(level);
  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {levels.map((l, i) => (
          <span key={l} className={i === idx ? "text-primary font-semibold" : ""}>{l}</span>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
        <div
          className="h-full rounded-full gradient-bg transition-all"
          style={{ width: `${((idx + 1) / levels.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function BudgetFitBadge({ fit }: { fit: BudgetFit }) {
  let cls = "border-amber-500/40 bg-amber-500/15 text-amber-300";
  let Icon = AlertTriangle;
  if (fit === "Dentro il budget") {
    cls = "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
    Icon = CheckCircle2;
  } else if (fit === "Fuori budget, da semplificare") {
    cls = "border-rose-500/40 bg-rose-500/15 text-rose-300";
    Icon = XCircle;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${cls}`}>
      <Icon className="size-3.5" /> {fit}
    </span>
  );
}

function EstHL({
  tone,
  children,
}: {
  tone: "indigo" | "cyan" | "violet" | "rainbow";
  children: React.ReactNode;
}) {
  return <span className={`hero-hl hero-hl-${tone}`}>{children}</span>;
}

function EstimatorTitle({ locale }: { locale: "it" | "en" }) {
  if (locale === "it") {
    return (
      <>
        Scopri se la tua <EstHL tone="indigo">idea</EstHL>
        <br className="hidden sm:inline" />{" "}
        può diventare un’<EstHL tone="rainbow">app vera</EstHL>.
      </>
    );
  }
  return (
    <>
      Find out if your <EstHL tone="indigo">idea</EstHL>
      <br className="hidden sm:inline" />{" "}
      can become a <EstHL tone="rainbow">real app</EstHL>.
    </>
  );
}
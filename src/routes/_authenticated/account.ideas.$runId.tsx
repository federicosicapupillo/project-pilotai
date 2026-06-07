import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { claimAnonIdeaRuns, getIdeaRun } from "@/lib/idea-runs.functions";
import { getAnonSessionId } from "@/lib/anon-session";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { TeamAiEarlyAccessMicro, TeamAiEarlyAccessBox } from "@/components/TeamAiEarlyAccess";
import {
  singleMonthlyPotential,
  singleTraditionalCost,
  singleSavings,
} from "@/lib/idea-report-format";
import {
  Loader2, Clock, Activity, Layers, Wallet, TrendingUp, Calculator,
  CheckCircle2, AlertTriangle, Sparkles, ArrowRight, FileText, ArrowUpRight, PiggyBank,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/ideas/$runId")({
  head: () => ({ meta: [{ title: "Report idea — IdeaPilot AI" }] }),
  component: ReportPage,
  errorComponent: ({ error }) => (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <h1 className="font-display text-2xl mb-2">Errore</h1>
      <p className="text-muted-foreground text-sm">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <h1 className="font-display text-2xl mb-2">Report non trovato</h1>
    </div>
  ),
});

function fmtEur(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function ReportPage() {
  const { runId } = Route.useParams();
  const { t } = useT();
  const navigate = useNavigate();
  const claim = useServerFn(claimAnonIdeaRuns);
  const fetchRun = useServerFn(getIdeaRun);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["idea-run", runId],
    queryFn: async () => {
      // Claim any anon runs from this browser session first, so RLS read can succeed.
      const sessionId = getAnonSessionId();
      if (sessionId) {
        try {
          await claim({ data: { sessionId, preferredRunId: runId } });
        } catch (err) {
          console.error("[ReportPage] claim failed", err);
        }
      }
      const res = await fetchRun({ data: { id: runId } });
      // Clean up the pending hint once the user has reached their report.
      if (typeof window !== "undefined") {
        try { localStorage.removeItem("pending_idea_run_id"); } catch { /* ignore */ }
      }
      return res;
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> {t("report.loading")}
      </div>
    );
  }

  const run = data?.run;
  if (isError || !run) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-amber-400">
          <AlertTriangle className="size-5" />
          <span className="font-display text-lg">{t("report.notFound")}</span>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="glass" size="sm" onClick={() => refetch()}>Riprova</Button>
          <Button asChild variant="hero" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const inScope = Array.isArray(run.features_in_scope) ? (run.features_in_scope as string[]) : [];
  const outOfScope = Array.isArray(run.features_out_of_scope) ? (run.features_out_of_scope as string[]) : [];

  const singlePotential = singleMonthlyPotential(
    run.estimated_potential_revenue_min,
    run.estimated_potential_revenue_max,
    run.idea_hash,
  );
  const singleTraditional = singleTraditionalCost(run.traditional_cost_estimate, run.idea_hash);
  const teamAiPrice = run.team_ai_cost ?? 29;
  const computedSavings = singleSavings(singleTraditional, teamAiPrice);
  const potentialDisplay = singlePotential != null ? fmtEur(singlePotential) : "—";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/85">
          <FileText className="size-3.5 text-primary" /> {t("report.title")}
        </div>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl mt-3 tracking-tight">
          {run.optional_details && typeof run.optional_details === "object" && "projectType" in (run.optional_details as Record<string, unknown>)
            ? String((run.optional_details as Record<string, unknown>).projectType)
            : "Il tuo progetto"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{t("report.subtitle")}</p>
      </div>

      <section className="glass-card rounded-2xl p-6 border border-primary/20">
        <h2 className="font-display text-lg mb-3">{t("report.idea")}</h2>
        <p className="text-foreground/85 whitespace-pre-wrap leading-relaxed">{run.idea_text}</p>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric icon={Clock} label={t("report.hours")} value={`${run.estimated_hours_min ?? "—"}–${run.estimated_hours_max ?? "—"} h`} />
        <Metric icon={Activity} label={t("report.difficulty")} value={String((run.optional_details as Record<string, unknown> | null)?.difficulty ?? "—")} />
        <Metric icon={Layers} label={t("report.projectType")} value={String((run.optional_details as Record<string, unknown> | null)?.projectType ?? "—")} />
        <Metric icon={Wallet} label={t("report.budget")} value={run.selected_budget_range ?? "—"} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-primary/90">
            <Sparkles className="size-3.5" /> {t("report.eco.kicker")}
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* HERO — Potential */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-primary/50 glass-card shadow-[0_0_80px_-20px_oklch(0.7_0.2_280/0.55)]">
            {/* Layered glow */}
            <div
              aria-hidden
              className="absolute -top-32 -right-24 size-[28rem] rounded-full opacity-70 blur-3xl"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-40 -left-20 size-80 rounded-full opacity-40 blur-3xl"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 border border-primary/30 text-[11px] uppercase tracking-[0.2em] font-semibold text-foreground/90">
                  <ArrowUpRight className="size-3.5 text-primary" /> {t("report.eco.heroTitle")}
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/50 bg-primary/15 text-[10px] uppercase tracking-[0.18em] font-bold text-primary">
                  <Sparkles className="size-3" /> {t("report.eco.heroBadge")}
                </span>
              </div>

              <p className="text-sm text-foreground/70 mt-6 max-w-md">
                {t("report.eco.heroEmotional")}
              </p>

              <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                <div
                  className="font-display font-bold tracking-tighter gradient-text leading-[0.95] drop-shadow-[0_0_40px_oklch(0.7_0.2_280/0.4)]"
                  style={{ fontSize: "clamp(3.5rem, 11vw, 7.5rem)" }}
                >
                  {potentialDisplay}
                </div>
                <span className="text-foreground/70 text-2xl sm:text-3xl font-display font-medium">
                  {t("report.perMonth")}
                </span>
              </div>

              <p className="text-foreground/90 mt-5 max-w-md leading-relaxed text-base">
                {t("report.eco.heroDesc")}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-4 italic">
                {t("report.eco.heroDisclaimer")}
              </p>
            </div>
          </div>

          {/* Supporting cards stack */}
          <div className="lg:col-span-2 grid gap-4">
            <div className="rounded-2xl p-6 border border-border/50 bg-background/40 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                <Calculator className="size-3.5 text-foreground/70" /> {t("report.traditional")}
              </div>
              <div className="font-display font-semibold tracking-tight text-3xl sm:text-4xl mt-3">
                <span className="text-foreground">{fmtEur(singleTraditional)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t("report.eco.tradDesc")}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl p-6 border border-teal/30 bg-background/40 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
                <PiggyBank className="size-3.5 text-teal" /> {t("report.savings")}
              </div>
              <div className="font-display font-semibold tracking-tight text-3xl sm:text-4xl mt-3">
                <span style={{ color: "var(--teal)" }}>{fmtEur(computedSavings)}</span>
                <span className="text-base text-muted-foreground font-normal ml-2">{t("report.eco.savingsLabel")}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t("report.eco.savingsDesc")}</p>
            </div>
          </div>
        </div>

        {/* Context box */}
        <div className="rounded-2xl p-5 border border-border/40 bg-background/30 flex gap-3 items-start">
          <div className="size-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <TrendingUp className="size-4 text-primary" />
          </div>
          <div>
            <div className="font-display text-sm mb-1">{t("report.eco.contextTitle")}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("report.eco.contextBody")}</p>
          </div>
        </div>

        {/* Bridge to CTA — converts the wow moment into a next step */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-primary/40 bg-gradient-to-br from-primary/10 via-background/40 to-accent/10 glow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div className="max-w-xl">
              <div className="font-display text-lg sm:text-xl mb-1.5">{t("report.eco.bridgeTitle")}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("report.eco.bridgeBody")}</p>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0">
              <Button variant="hero" size="lg" onClick={() => navigate({ to: "/prezzi" })}>
                <Sparkles className="size-4" /> {t("report.cta.activate")} <ArrowRight className="size-4" />
              </Button>
              <TeamAiEarlyAccessMicro align="right" className="max-w-xs" />
            </div>
          </div>
          <div className="mt-5">
            <TeamAiEarlyAccessBox />
          </div>
        </div>
      </section>

      {inScope.length > 0 && (
        <section className="glass-card rounded-2xl p-6 border border-primary/20">
          <h2 className="font-display text-lg mb-3">{t("report.section.scope")}</h2>
          <ul className="space-y-2">
            {inScope.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" /> <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outOfScope.length > 0 && (
        <section className="glass-card rounded-2xl p-6 border border-border/40">
          <h2 className="font-display text-lg mb-3">{t("report.section.outOfScope")}</h2>
          <ul className="space-y-2">
            {outOfScope.map((f) => (
              <li key={f} className="text-sm text-muted-foreground">• {f}</li>
            ))}
          </ul>
        </section>
      )}

      {run.recommended_mvp_scope && (
        <section className="glass-card rounded-2xl p-6 border border-primary/20">
          <h2 className="font-display text-lg mb-2">{t("report.section.nextStep")}</h2>
          <p className="text-foreground/85 leading-relaxed">{run.recommended_mvp_scope}</p>
        </section>
      )}

      <div className="pt-2 space-y-3">
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" size="lg" onClick={() => navigate({ to: "/prezzi" })}>
            <Sparkles className="size-4" /> {t("report.cta.activate")} <ArrowRight className="size-4" />
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
        <TeamAiEarlyAccessMicro />
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${accent ? "border-primary/40" : "border-border/40"} bg-background/40`}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5 text-primary" /> {label}
      </div>
      <div className="font-display text-lg mt-1 tracking-tight">{value}</div>
    </div>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { claimAnonIdeaRuns, getIdeaRun } from "@/lib/idea-runs.functions";
import { getAnonSessionId } from "@/lib/anon-session";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Loader2, Clock, Activity, Layers, Wallet, TrendingUp, Calculator,
  CheckCircle2, AlertTriangle, Sparkles, ArrowRight, FileText,
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

      <section className="glass-card rounded-2xl p-6 border border-primary/20 space-y-4">
        <h2 className="font-display text-lg">{t("report.section.economics")}</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Metric icon={TrendingUp} label={t("report.potential")} value={`${fmtEur(run.estimated_potential_revenue_min)} – ${fmtEur(run.estimated_potential_revenue_max)}`} />
          <Metric icon={Calculator} label={t("report.traditional")} value={fmtEur(run.traditional_cost_estimate)} />
          <Metric icon={Sparkles} label={t("report.savings")} value={fmtEur(run.estimated_savings)} accent />
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

      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="hero" size="lg" onClick={() => navigate({ to: "/prezzi" })}>
          <Sparkles className="size-4" /> {t("report.cta.activate")} <ArrowRight className="size-4" />
        </Button>
        <Button asChild variant="glass" size="lg">
          <Link to="/dashboard">Dashboard</Link>
        </Button>
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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Check, ArrowRight, Sparkles, Lock, ShieldCheck,
  Compass, ClipboardList, LayoutGrid, GitBranch, Wand2,
  Hammer, ShieldAlert, Rocket, LineChart, GraduationCap, Zap,
  type LucideIcon,
} from "lucide-react";
import { useActivateTeam } from "@/hooks/use-activate-team";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/prezzi")({
  head: () => ({
    meta: [
      { title: "Prezzi — Attiva il tuo Team AI operativo" },
      { name: "description", content: "Pacchetto Team AI Operativo a 29€. Tu dai le direttive, gli agenti AI preparano struttura, schermate, funzioni e prompt per la prima versione della tua app." },
      { property: "og:title", content: "Prezzi — Attiva il tuo Team AI operativo" },
      { property: "og:description", content: "29€ per attivare il pacchetto Team AI: 8 agenti, percorso personale e metodo operativo guidato al lavoro sulla tua idea." },
      { property: "og:url", content: "https://ideapilots.app/prezzi" },
    ],
    links: [
      { rel: "canonical", href: "https://ideapilots.app/prezzi" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Team AI Operativo — IdeaPilot AI",
          description: "Pacchetto operativo IdeaPilot: 8 agenti AI, percorso personale e metodo guidato per costruire la prima versione della tua app.",
          brand: { "@type": "Brand", name: "IdeaPilot AI" },
          offers: {
            "@type": "Offer",
            price: "29.00",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: "https://ideapilots.app/prezzi",
          },
        }),
      },
    ],
  }),
  component: PrezziPage,
});

const TEAM_KEYS: { roleKey: string; lineKey: string; Icon: LucideIcon }[] = [
  { roleKey: "team.strategist.role", lineKey: "team.strategist.line", Icon: Compass },
  { roleKey: "team.product.role", lineKey: "team.product.line", Icon: ClipboardList },
  { roleKey: "team.ux.role", lineKey: "team.ux.line", Icon: LayoutGrid },
  { roleKey: "team.logic.role", lineKey: "team.logic.line", Icon: GitBranch },
  { roleKey: "team.prompt.role", lineKey: "team.prompt.line", Icon: Wand2 },
  { roleKey: "team.build.role", lineKey: "team.build.line", Icon: Hammer },
  { roleKey: "team.test.role", lineKey: "team.test.line", Icon: ShieldAlert },
  { roleKey: "team.launch.role", lineKey: "team.launch.line", Icon: Rocket },
  { roleKey: "team.path.role", lineKey: "team.path.line", Icon: LineChart },
  { roleKey: "team.method.role", lineKey: "team.method.line", Icon: GraduationCap },
];

const ALONE_KEYS = ["pricing.alone.1", "pricing.alone.2", "pricing.alone.3", "pricing.alone.4"];
const WITH_KEYS = ["pricing.with.1", "pricing.with.2", "pricing.with.3", "pricing.with.4"];

function PrezziPage() {
  const navigate = useNavigate();
  const { activate, hasAccess } = useActivateTeam();
  const { t } = useT();
  const handleActivate = () => void activate("prezzi");

  const goToDashboard = () => navigate({ to: "/dashboard" });

  const PrimaryCta = ({ label }: { label?: string }) =>
    hasAccess ? (
      <Button variant="hero" size="lg" className="w-full" onClick={goToDashboard}>
        {t("pricing.cta.dashboard")} <ArrowRight className="size-4" />
      </Button>
    ) : (
      <Button variant="hero" size="lg" className="w-full" onClick={handleActivate}>
        <Lock className="size-4" /> {label ?? t("pricing.cta.primary")}
      </Button>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-6xl mx-auto px-6 py-16 w-full">
        {/* HERO */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
            <Sparkles className="size-3 text-primary" /> {t("pricing.badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold mt-4">
            {t("pricing.title")}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
            {t("pricing.subtitle")}
          </p>
          <p className="text-base sm:text-lg gradient-text font-semibold mt-6 max-w-2xl mx-auto">
            {t("pricing.leadHint")}
          </p>
        </section>

        {/* PACCHETTO TEAM AI — card principale */}
        <section className="mt-14 flex justify-center">
          <div className="relative w-full max-w-3xl">
            {/* glow alone */}
            <div aria-hidden className="absolute -inset-px rounded-[2rem] gradient-bg opacity-30 blur-2xl" />
            <div className="relative glass-card rounded-[2rem] p-8 sm:p-12 border-primary/70 ring-2 ring-primary/40 glow-soft">
              {hasAccess && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold gradient-bg text-primary-foreground glow-soft inline-flex items-center gap-1.5">
                  <Check className="size-3" /> {t("pricing.activeBadge")}
                </div>
              )}

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gradient-bg text-primary-foreground text-[11px] font-semibold uppercase tracking-wider glow-soft">
                  <Sparkles className="size-3" /> {t("pricing.opPackBadge")}
                </div>
                <h2 className="font-display font-semibold text-3xl sm:text-4xl mt-4">
                  {t("pricing.cardTitle.a")}<span className="gradient-text">{t("pricing.cardTitle.b")}</span>
                </h2>
                <p className="mt-3 text-sm sm:text-base gradient-text font-semibold">
                  {t("pricing.launchHook")}
                </p>
                <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                  {t("pricing.cardDesc")}
                </p>

                <div className="mt-7 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full gradient-bg text-primary-foreground text-[11px] font-bold uppercase tracking-[0.14em] glow-soft">
                  <Sparkles className="size-3" /> {t("pricing.launch")}
                </div>
                <div className="mt-4 flex items-baseline justify-center gap-2">
                  <div className="font-display font-semibold text-7xl sm:text-8xl gradient-text leading-none">29€</div>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/50 bg-primary/10 text-sm font-semibold text-foreground">
                  {t("pricing.oneTime")}
                </div>
                <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">
                  {t("pricing.accessNote")}
                </p>
                <div className="relative mt-5 max-w-md mx-auto">
                  <div aria-hidden className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/60 via-fuchsia-500/50 to-primary/60 blur-md opacity-70" />
                  <div className="relative rounded-2xl border-2 border-primary/70 bg-background/80 backdrop-blur px-4 py-3.5 flex items-start gap-3 text-left glow-soft">
                    <div className="shrink-0 size-9 rounded-xl gradient-bg grid place-items-center glow-soft">
                      <Zap className="size-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/50 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {t("pricing.early")}
                      </div>
                      <div className="mt-1.5 text-sm sm:text-[15px] font-semibold text-foreground leading-snug">
                        {t("pricing.earlyTitle")}
                      </div>
                      <p className="mt-1.5 text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                        {t("pricing.earlyBody")}
                      </p>
                      <p className="mt-2 text-xs sm:text-[13px] text-foreground/90 leading-relaxed border-l-2 border-primary/60 pl-3">
                        {t("pricing.valueLine")}
                      </p>
                      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {["pricing.bullets.1","pricing.bullets.2","pricing.bullets.3","pricing.bullets.4"].map((k) => (
                          <li key={k} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-foreground/85">
                            <Check className="size-3.5 text-primary mt-0.5 shrink-0" /> {t(k)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-7 max-w-2xl mx-auto text-center">
                {t("pricing.longDesc")}
              </p>

              {/* AGENT GRID */}
              <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                {TEAM_KEYS.map(({ roleKey, lineKey, Icon }) => (
                  <li
                    key={roleKey}
                    className="glass-card rounded-xl px-4 py-4 flex items-start gap-3 text-sm border border-border/60 hover:border-primary/50 transition-colors"
                  >
                    <div className="size-9 rounded-lg gradient-bg grid place-items-center shrink-0 glow-soft">
                      <Icon className="size-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{t(roleKey)}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{t(lineKey)}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* FRASE FORTE */}
              <div className="mt-8 rounded-2xl border border-primary/40 ring-1 ring-primary/20 p-5 text-center">
                <p className="font-display font-semibold text-lg sm:text-xl">
                  {t("pricing.slogan.a")} <span className="gradient-text">{t("pricing.slogan.b")}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("pricing.slogan.sub")}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-7 max-w-sm mx-auto">
                <PrimaryCta />
                <p className="text-xs text-foreground/80 text-center mt-3">
                  {t("pricing.cta.note")}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2 inline-flex items-center justify-center gap-1.5 w-full">
                  <ShieldCheck className="size-3.5" /> {t("pricing.cta.secure")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COSA SIGNIFICA DAVVERO */}
        <section className="mt-20 max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border-primary/40 ring-1 ring-primary/20 text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-semibold">
              {t("pricing.os.title.a")}<span className="gradient-text">{t("pricing.os.title.b")}</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t("pricing.os.desc.a")} <span className="text-foreground font-medium">{t("pricing.os.desc.b")}</span>
            </p>
          </div>
        </section>

        {/* CONFRONTO */}
        <section className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-center">
            {t("pricing.compare.title.a")}<span className="gradient-text">{t("pricing.compare.title.b")}</span>?
          </h2>
          <div className="grid md:grid-cols-2 gap-5 mt-8 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-6 border border-border/60">
              <h3 className="font-display font-semibold text-lg text-muted-foreground">{t("pricing.compare.alone")}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {ALONE_KEYS.map((k) => (
                  <li key={k} className="flex items-start gap-2 text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 mt-2 shrink-0" /> {t(k)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-6 border-primary/60 ring-1 ring-primary/30 glow-soft">
              <h3 className="font-display font-semibold text-lg gradient-text">{t("pricing.compare.with")}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {WITH_KEYS.map((k) => (
                  <li key={k} className="flex items-start gap-2">
                    <Check className="size-4 text-primary mt-0.5 shrink-0" /> {t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="mt-20">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto border-primary/40 ring-1 ring-primary/20">
            <h2 className="text-2xl sm:text-3xl font-display font-semibold">
              {t("pricing.final.title.a")}<span className="gradient-text">{t("pricing.final.title.b")}</span>{t("pricing.final.title.c")}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              {t("pricing.final.desc")}
            </p>
            <div className="mt-6 max-w-sm mx-auto">
              <PrimaryCta />
              <p className="text-xs text-muted-foreground mt-3">
                {hasAccess ? t("pricing.final.active") : t("pricing.final.access")}
              </p>
            </div>
            <div className="text-center mt-6">
              <Link to="/method" className="text-sm text-primary hover:underline">
                {t("pricing.final.method")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

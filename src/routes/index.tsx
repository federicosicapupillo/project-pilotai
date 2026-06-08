import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { IdeaEstimator } from "@/components/IdeaEstimator";
import { ReusableToolkitBox } from "@/components/ReusableToolkitBox";
import { SocialProofStats } from "@/components/SocialProofStats";
import { useT } from "@/lib/i18n";
import {
  Sparkles, ArrowRight, Users, Wand2, ListChecks, BookOpen,
  Lightbulb, Rocket, Target, ShieldCheck, Layers, Zap, PenLine, FileText, Hammer,
  Boxes, TrendingDown, GraduationCap, Recycle,
  Gauge, Clock, Wallet, TrendingUp, CheckCircle2, XCircle, Sparkle, Activity,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IdeaPilot AI — Trasforma la tua idea in app con agenti AI" },
      { name: "description", content: "Il metodo guidato per imprenditori e creator senza competenze tecniche: descrivi l'idea, ricevi una scheda progetto chiara, un team di agenti AI con prompt operativi pronti e una roadmap passo passo per costruire la prima versione." },
      { property: "og:title", content: "IdeaPilot AI — Trasforma la tua idea in app con agenti AI" },
      { property: "og:description", content: "Descrivi l'idea, ottieni scheda progetto, agenti AI consigliati, prompt pronti e roadmap operativa per arrivare alla prima versione della tua app." },
      { property: "og:url", content: "https://ideapilots.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://ideapilots.app/" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, locale } = useT();
  return (
    <div className="min-h-screen flex flex-col">
      <main>
        {/* HERO */}
        <section className="relative hero-bg overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          {/* Soft halo behind hero title */}
          <div className="hero-halo pointer-events-none" aria-hidden="true" />
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
              <Sparkles className="size-3 text-primary" /> {t("home.hero.eyebrow")}
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight leading-[1.05]">
              <HeroTitle locale={locale} />
            </h1>
            <p className="mt-6 text-lg text-foreground/80 max-w-2xl mx-auto">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#calcolatore">
                <Button variant="hero" size="xl" className="glow-primary hover:glow-primary">{t("home.cta.primary")} <ArrowRight className="size-4" /></Button>
              </a>
              <a href="#report-esempio">
                <Button variant="glass" size="xl">{t("home.cta.secondary")}</Button>
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              {t("home.hero.note")}
            </p>
          </div>
        </section>

        {/* IDEA → ORE / COSTI / POTENZIALE — calcolatore interattivo subito sotto la hero */}
        <div id="calcolatore" />
        <IdeaEstimator />

        {/* SOCIAL PROOF — early access stats */}
        <SocialProofStats />

        {/* STEPS — 4 card subito sotto la hero */}
        <Section title={t("home.steps.title")} eyebrow={t("home.steps.eyebrow")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: PenLine, title: t("home.steps.1.title"), desc: t("home.steps.1.desc") },
              { icon: FileText, title: t("home.steps.2.title"), desc: t("home.steps.2.desc") },
              { icon: Wand2, title: t("home.steps.3.title"), desc: t("home.steps.3.desc") },
              { icon: Hammer, title: t("home.steps.4.title"), desc: t("home.steps.4.desc") },
            ].map((s) => (
              <div key={s.title} className="glass-card rounded-xl p-6">
                <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                  <s.icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mt-4">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* METODO */}
        <Section title={t("home.method.title")} eyebrow={t("home.method.eyebrow")}>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Lightbulb, title: t("home.method.1.title"), desc: t("home.method.1.desc") },
              { icon: Layers, title: t("home.method.2.title"), desc: t("home.method.2.desc") },
              { icon: Wand2, title: t("home.method.3.title"), desc: t("home.method.3.desc") },
            ].map((s) => (
              <div key={s.title} className="glass-card rounded-xl p-6">
                <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                  <s.icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mt-4">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* VANTAGGI */}
        <Section title={t("home.adv.title")} eyebrow={t("home.adv.eyebrow")}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Target, title: t("home.adv.1.title"), desc: t("home.adv.1.desc") },
              { icon: Zap, title: t("home.adv.2.title"), desc: t("home.adv.2.desc") },
              { icon: ShieldCheck, title: t("home.adv.3.title"), desc: t("home.adv.3.desc") },
              { icon: Rocket, title: t("home.adv.4.title"), desc: t("home.adv.4.desc") },
            ].map((v) => (
              <div key={v.title} className="glass-card rounded-xl p-5">
                <v.icon className="size-5 text-primary" />
                <h3 className="font-display font-semibold mt-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ESEMPI */}
        <Section title={t("home.ex.title")} eyebrow={t("home.ex.eyebrow")}>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { t: t("home.ex.1.t"), d: t("home.ex.1.d") },
              { t: t("home.ex.2.t"), d: t("home.ex.2.d") },
              { t: t("home.ex.3.t"), d: t("home.ex.3.d") },
              { t: t("home.ex.4.t"), d: t("home.ex.4.d") },
              { t: t("home.ex.5.t"), d: t("home.ex.5.d") },
              { t: t("home.ex.6.t"), d: t("home.ex.6.d") },
            ].map((e) => (
              <div key={e.t} className="glass-card rounded-xl p-5">
                <h3 className="font-display font-semibold">{e.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{e.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* PER CHI */}
        <Section title={t("home.target.title")} eyebrow={t("home.target.eyebrow")}>
          <div className="glass-card rounded-2xl p-8 grid md:grid-cols-2 gap-6">
            <div>
              <Users className="size-6 text-primary" />
              <h3 className="font-display font-semibold text-xl mt-3">{t("home.target.role")}</h3>
              <p className="text-muted-foreground mt-2">
                {t("home.target.desc")}
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              {[t("home.target.list.1"), t("home.target.list.2"), t("home.target.list.3"), t("home.target.list.4"), t("home.target.list.5")].map((x) => (
                <li key={x} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /> {x}</li>
              ))}
            </ul>
          </div>
        </Section>

        {/* COSA RICEVI NEL REPORT — 6 card */}
        <Section title={t("home.receive.title")} eyebrow={t("home.receive.eyebrow")}>
          <p className="text-muted-foreground -mt-4 mb-8 max-w-2xl">{t("home.receive.subtitle")}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Lightbulb, t: t("home.receive.1.t"), d: t("home.receive.1.d") },
              { icon: Clock, t: t("home.receive.2.t"), d: t("home.receive.2.d") },
              { icon: Wallet, t: t("home.receive.3.t"), d: t("home.receive.3.d") },
              { icon: TrendingUp, t: t("home.receive.4.t"), d: t("home.receive.4.d") },
              { icon: ListChecks, t: t("home.receive.5.t"), d: t("home.receive.5.d") },
              { icon: Rocket, t: t("home.receive.6.t"), d: t("home.receive.6.d") },
            ].map((c) => (
              <div key={c.t} className="glass-card rounded-xl p-5">
                <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                  <c.icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold mt-3">{c.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* REPORT ESEMPIO — preview demo */}
        <section id="report-esempio" className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">{t("home.demo.eyebrow")}</p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold mt-2 mb-3">{t("home.demo.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mb-8">{t("home.demo.subtitle")}</p>

          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-primary/20 glow-soft">
            <div className="rounded-xl p-5 mb-6 border border-primary/15 bg-card/60">
              <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">{t("home.demo.idea.label")}</div>
              <p className="text-base sm:text-lg text-foreground mt-2">{t("home.demo.idea.text")}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <DemoStat icon={Clock} label={t("home.demo.hours")} value="80 – 120" />
              <DemoStat icon={Activity} label={t("home.demo.difficulty")} value="Media" />
              <DemoStat icon={Wallet} label={t("home.demo.budget")} value="700€ – 1.500€" />
              <DemoStat icon={TrendingUp} label={t("home.demo.potential")} value="≈ 1.870€/mese" tone="gradient" />
              <DemoStat icon={Sparkle} label={t("home.demo.traditional")} value="≈ 6.300€" />
              <DemoStat icon={Gauge} label={t("home.demo.savings")} value="≈ 6.270€" tone="gradient" />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="rounded-xl p-5 border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="size-4" /> {t("home.demo.inScope")}
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
                  <li>• Registrazione e profilo utente</li>
                  <li>• Schede cliente e attività</li>
                  <li>• Calendario scadenze</li>
                  <li>• Dashboard riepilogativa</li>
                </ul>
              </div>
              <div className="rounded-xl p-5 border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                  <XCircle className="size-4" /> {t("home.demo.outScope")}
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
                  <li>• Fatturazione automatica</li>
                  <li>• App mobile nativa</li>
                  <li>• Integrazioni avanzate CRM</li>
                  <li>• Reportistica complessa</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl p-5 mt-6 border border-primary/25 bg-primary/5">
              <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">{t("home.demo.nextStep")}</div>
              <p className="text-sm text-foreground/90 mt-2">{t("home.demo.nextStep.text")}</p>
            </div>

            <p className="text-xs text-muted-foreground mt-5 italic">{t("home.demo.note")}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#calcolatore">
                <Button variant="hero" size="lg">{t("home.cta.primary")} <ArrowRight className="size-4" /></Button>
              </a>
            </div>
          </div>
        </section>

        {/* DA IDEA CONFUSA A PROGETTO OPERATIVO */}
        <Section title={t("home.flow.title")} eyebrow={t("home.flow.eyebrow")}>
          <p className="text-muted-foreground -mt-4 mb-8 max-w-3xl">{t("home.flow.intro")}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: "1", t: t("home.flow.1.t"), d: t("home.flow.1.d"), icon: PenLine },
              { n: "2", t: t("home.flow.2.t"), d: t("home.flow.2.d"), icon: FileText },
              { n: "3", t: t("home.flow.3.t"), d: t("home.flow.3.d"), icon: Rocket },
            ].map((s) => (
              <div key={s.n} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                    <s.icon className="size-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-primary font-semibold">Step {s.n}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mt-4">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* FIDUCIA */}
        <Section title={t("home.trust.title")} eyebrow={t("home.trust.eyebrow")}>
          <div className="glass-card rounded-2xl p-8 grid md:grid-cols-2 gap-8">
            <div>
              <ShieldCheck className="size-6 text-primary" />
              <p className="text-foreground/85 mt-3 leading-relaxed">{t("home.trust.body")}</p>
            </div>
            <ul className="space-y-2.5 text-sm">
              {[t("home.trust.b1"), t("home.trust.b2"), t("home.trust.b3"), t("home.trust.b4"), t("home.trust.b5")].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">{t("home.kit.eyebrow")}</p>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold mt-2 mb-3">
              {t("home.kit.title.a")}<span className="gradient-text">{t("home.kit.title.b")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-8">
              {t("home.kit.desc")}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Boxes, t: t("home.kit.1.t"), d: t("home.kit.1.d") },
                { icon: TrendingDown, t: t("home.kit.2.t"), d: t("home.kit.2.d") },
                { icon: GraduationCap, t: t("home.kit.3.t"), d: t("home.kit.3.d") },
                { icon: Recycle, t: t("home.kit.4.t"), d: t("home.kit.4.d") },
              ].map((c) => (
                <div key={c.t} className="glass-card rounded-xl p-5">
                  <div className="size-9 rounded-lg gradient-bg grid place-items-center glow-soft">
                    <c.icon className="size-4 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold mt-3">{c.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-foreground/85 mt-6 italic">
              {t("home.kit.note")}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 hero-bg opacity-60 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-display font-semibold">
                {t("home.final.title.a")}<span className="gradient-text">{t("home.final.title.b")}</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                {t("home.final.desc")}
              </p>
              <Link to="/prezzi" className="inline-block mt-8">
                <Button variant="hero" size="xl">{t("home.final.cta")} <ArrowRight className="size-4" /></Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-4">{t("home.final.micro")}</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} IdeaPilot {t("brand.ai")} {t("footer.copy")}
        </footer>
      </main>
    </div>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-primary font-semibold">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-display font-semibold mt-2 mb-8">{title}</h2>
      {children}
    </section>
  );
}

function HeroTitle({ locale }: { locale: "it" | "en" }) {
  if (locale === "it") {
    return (
      <>
        Hai un'<HL tone="indigo">idea</HL> per un'app?{" "}
        Scopri se può diventare un{" "}
        <HL tone="rainbow">progetto reale</HL>.
      </>
    );
  }
  return (
    <>
      Have an app <HL tone="indigo">idea</HL>? Find out if it can become a{" "}
      <HL tone="rainbow">real project</HL>.
    </>
  );
}

function DemoStat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "default" | "gradient";
}) {
  return (
    <div className="rounded-xl p-4 border border-white/[0.06] bg-card/40">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Icon className="size-3.5 text-primary" /> {label}
      </div>
      <div className={`mt-2 font-display font-semibold text-xl ${tone === "gradient" ? "gradient-text" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

function HL({
  tone,
  children,
}: {
  tone: "indigo" | "cyan" | "violet" | "rainbow";
  children: React.ReactNode;
}) {
  return <span className={`hero-hl hero-hl-${tone}`}>{children}</span>;
}

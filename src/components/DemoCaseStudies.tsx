import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import {
  ArrowRight, Users, ListChecks, Clock, Wallet, TrendingUp, Quote,
} from "lucide-react";

type Metric = { icon: typeof Users; value: string; labelKey: string };
type CaseStudy = {
  name: string;
  category: { it: string; en: string };
  description: { it: string; en: string };
  potential: string; // monthly EUR
  metrics: Metric[];
  revenue: { it: string; en: string };
  quote: { it: string; en: string };
};

const cases: CaseStudy[] = [
  {
    name: "FitChef Planner",
    category: { it: "Food / Wellness", en: "Food / Wellness" },
    description: {
      it: "Un'app per creare piani alimentari settimanali personalizzati per chi vuole mangiare meglio senza perdere tempo.",
      en: "An app to build personalized weekly meal plans for people who want to eat better without wasting time.",
    },
    potential: "1.850€",
    metrics: [
      { icon: Users, value: "320", labelKey: "home.cases.metric.users" },
      { icon: ListChecks, value: "3", labelKey: "home.cases.metric.features" },
      { icon: Clock, value: "42", labelKey: "home.cases.metric.hours" },
    ],
    revenue: { it: "Abbonamento mensile", en: "Monthly subscription" },
    quote: {
      it: "Da un'idea confusa siamo arrivati a una roadmap chiara: funzioni, budget, pubblico e primo modello di ricavo.",
      en: "From a fuzzy idea to a clear roadmap: features, budget, audience and first revenue model.",
    },
  },
  {
    name: "CasaMatch Local",
    category: { it: "Real Estate / Servizi locali", en: "Real Estate / Local services" },
    description: {
      it: "Una web app per aiutare agenzie immobiliari locali a raccogliere richieste qualificate da chi cerca casa in zone specifiche.",
      en: "A web app helping local real estate agencies collect qualified requests from buyers searching specific areas.",
    },
    potential: "2.420€",
    metrics: [
      { icon: Users, value: "180", labelKey: "home.cases.metric.leads" },
      { icon: ListChecks, value: "4", labelKey: "home.cases.metric.features" },
      { icon: Clock, value: "58", labelKey: "home.cases.metric.hours" },
    ],
    revenue: { it: "Lead generation / abbonamento B2B", en: "Lead generation / B2B subscription" },
    quote: {
      it: "Il report ha trasformato una semplice idea in un progetto vendibile, con target, funzioni e prossimi step.",
      en: "The report turned a simple idea into a sellable project with target, features and next steps.",
    },
  },
  {
    name: "ShiftBuddy",
    category: { it: "Lavoro / Organizzazione turni", en: "Work / Shift management" },
    description: {
      it: "Una piattaforma per aiutare piccoli locali e team operativi a organizzare disponibilità, turni e sostituzioni in modo rapido.",
      en: "A platform helping small venues and operational teams organize availability, shifts and replacements quickly.",
    },
    potential: "3.150€",
    metrics: [
      { icon: Users, value: "75", labelKey: "home.cases.metric.business" },
      { icon: ListChecks, value: "5", labelKey: "home.cases.metric.features" },
      { icon: Clock, value: "72", labelKey: "home.cases.metric.hours" },
    ],
    revenue: { it: "Abbonamento SaaS", en: "SaaS subscription" },
    quote: {
      it: "L'idea è stata divisa in ciò che si può costruire subito e ciò che conviene rimandare.",
      en: "The idea was split into what to build right away and what to postpone.",
    },
  },
  {
    name: "CreatorBrief AI",
    category: { it: "Creator / Marketing", en: "Creator / Marketing" },
    description: {
      it: "Uno strumento per creator e freelance che genera brief, piani contenuto e checklist operative per gestire clienti e campagne.",
      en: "A tool for creators and freelancers that generates briefs, content plans and operational checklists for clients and campaigns.",
    },
    potential: "1.620€",
    metrics: [
      { icon: Users, value: "240", labelKey: "home.cases.metric.users" },
      { icon: ListChecks, value: "3", labelKey: "home.cases.metric.features" },
      { icon: Clock, value: "39", labelKey: "home.cases.metric.hours" },
    ],
    revenue: { it: "Freemium + premium", en: "Freemium + premium" },
    quote: {
      it: "Il valore non è stato solo stimare i costi, ma capire cosa costruire prima per testare davvero il mercato.",
      en: "The value wasn't just estimating costs — it was knowing what to build first to truly test the market.",
    },
  },
];

export function DemoCaseStudies() {
  const { t, locale } = useT();
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-primary font-semibold">{t("home.cases.eyebrow")}</p>
      <h2 className="text-3xl sm:text-4xl font-display font-semibold mt-2 mb-3">{t("home.cases.title")}</h2>
      <p className="text-muted-foreground max-w-2xl">{t("home.cases.subtitle")}</p>
      <p className="text-xs text-muted-foreground italic mt-2 mb-8">{t("home.cases.micro")}</p>

      <div className="grid md:grid-cols-2 gap-5">
        {cases.map((c) => (
          <article
            key={c.name}
            className="glass-card rounded-2xl p-6 border border-primary/15 glow-soft flex flex-col"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display font-semibold text-xl">{c.name}</h3>
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary font-semibold">
                {c.category[locale]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{c.description[locale]}</p>

            <div className="mt-5 rounded-xl p-4 border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary font-semibold">
                <TrendingUp className="size-3.5" /> {t("home.cases.potential")}
              </div>
              <div className="mt-1 font-display font-semibold text-2xl gradient-text">
                {c.potential} <span className="text-base text-foreground/70">/ {locale === "it" ? "mese" : "month"}</span>
              </div>
            </div>

            <ul className="mt-4 grid sm:grid-cols-3 gap-2">
              {c.metrics.map((m, i) => (
                <li key={i} className="rounded-lg p-3 border border-white/[0.06] bg-card/40">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <m.icon className="size-3 text-primary" />
                  </div>
                  <div className="font-display font-semibold text-lg mt-0.5">{m.value}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{t(m.labelKey)}</div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <Wallet className="size-3.5 text-primary" />
              <span className="text-muted-foreground">{t("home.cases.metric.revenue")}:</span>
              <span className="text-foreground/90">{c.revenue[locale]}</span>
            </div>

            <blockquote className="mt-4 rounded-xl p-4 border border-white/[0.06] bg-card/40 text-sm text-foreground/85 italic relative">
              <Quote className="size-4 text-primary/60 absolute top-3 left-3" />
              <p className="pl-6">{c.quote[locale]}</p>
            </blockquote>

            <div className="mt-5 pt-2 flex-1 flex items-end">
              <a href="#report-esempio" className="w-full">
                <Button variant="glass" size="sm" className="w-full">
                  {t("home.cases.cta")} <ArrowRight className="size-4" />
                </Button>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 glass-card rounded-2xl p-8 text-center border border-primary/20">
        <h3 className="text-2xl sm:text-3xl font-display font-semibold">
          {t("home.cases.outro.title")}
        </h3>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("home.cases.outro.text")}</p>
        <Link to="/" hash="calcolatore" className="inline-block mt-6">
          <Button variant="hero" size="lg">
            {t("home.cases.outro.cta")} <ArrowRight className="size-4" />
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-3">{t("home.cases.outro.micro")}</p>
      </div>
    </section>
  );
}
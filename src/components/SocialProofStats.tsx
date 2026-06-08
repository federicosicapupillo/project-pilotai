import { Users, Lightbulb, FileText, FolderKanban, type LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n";
import { marketingStats, marketingStatsEn, type MarketingStat } from "@/lib/marketing-stats";

const ICONS: Record<MarketingStat["key"], LucideIcon> = {
  earlyUsers: Users,
  ideasAnalyzed: Lightbulb,
  reportsGenerated: FileText,
  projectsSaved: FolderKanban,
};

export function SocialProofStats() {
  const { t, locale } = useT();
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-wider text-primary font-semibold">
          {t("home.proof.eyebrow")}
        </p>
        <h2 className="text-3xl sm:text-4xl font-display font-semibold mt-2">
          {t("home.proof.title")}
        </h2>
        <p className="text-muted-foreground mt-3">{t("home.proof.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingStats.map((s) => {
          const Icon = ICONS[s.key];
          const value = locale === "en" ? marketingStatsEn[s.key] : s.value;
          return (
            <div
              key={s.key}
              className="glass-card rounded-2xl p-6 text-center border border-primary/15 glow-soft"
            >
              <div className="mx-auto size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                <Icon className="size-5 text-primary-foreground" />
              </div>
              <div className="mt-4 font-display font-semibold text-4xl sm:text-5xl gradient-text leading-none">
                {value}
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">
                {t(`home.proof.${s.key}.label`)}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t(`home.proof.${s.key}.desc`)}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground italic text-center mt-6 max-w-2xl mx-auto">
        {t("home.proof.micro")}
      </p>
    </section>
  );
}
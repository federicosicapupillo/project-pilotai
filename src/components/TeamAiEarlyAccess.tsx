import { Check, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Small commercial microcopy line to render directly under any
 * "Attiva Team IA - 29€" CTA. Keeps the launch-price framing consistent.
 */
export function TeamAiEarlyAccessMicro({
  className,
  align = "left",
}: {
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const { t } = useT();
  const alignCls =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return (
    <p
      className={
        "text-[11px] leading-snug text-muted-foreground/90 " +
        alignCls +
        (className ? " " + className : "")
      }
    >
      {t("cta.early.micro")}
    </p>
  );
}

/**
 * Small reinforcement box (title + 3 bullets + note) to render near the
 * most important "Attiva Team IA" CTAs (report page, pricing page, etc.).
 */
export function TeamAiEarlyAccessBox({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <div
      className={
        "rounded-xl border border-primary/30 bg-gradient-to-br from-primary/8 via-background/40 to-accent/8 p-4 sm:p-5 " +
        (className ?? "")
      }
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary/90 font-semibold">
        <Sparkles className="size-3.5" /> {t("cta.early.boxTitle")}
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed mt-2">
        {t("cta.early.boxBody")}
      </p>
      <ul className="mt-3 grid sm:grid-cols-3 gap-2">
        {(["cta.early.b1", "cta.early.b2", "cta.early.b3"] as const).map((k) => (
          <li
            key={k}
            className="flex items-start gap-2 text-xs text-foreground/85 rounded-lg border border-border/40 bg-background/40 px-2.5 py-2"
          >
            <Check className="size-3.5 text-primary mt-0.5 shrink-0" />
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
        {t("cta.early.note")}
      </p>
    </div>
  );
}

/**
 * Compact badge for tight spaces (e.g. desktop navbar) — sits next to the
 * "Attiva Team IA - 29€" button without breaking header height.
 */
export function TeamAiEarlyAccessBadge({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <span
      className={
        "hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-primary/40 bg-primary/10 text-primary/90 font-semibold " +
        (className ?? "")
      }
    >
      <Sparkles className="size-3" /> {t("cta.early.badge")}
    </span>
  );
}
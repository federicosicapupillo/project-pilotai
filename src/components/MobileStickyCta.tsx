import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Mobile-only sticky CTA shown on the homepage before the calculator enters
 * the viewport. Scrolls to #calcolatore on tap. Hidden once the user reaches
 * the calculator so it never covers form fields or buttons.
 */
export function MobileStickyCta({ targetId = "calcolatore" }: { targetId?: string }) {
  const { t } = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(targetId);
    if (!target) return;

    // Show only after the user starts scrolling, and hide when calculator is in view.
    let calcInView = false;
    let scrolled = false;

    const update = () => setVisible(scrolled && !calcInView);

    const onScroll = () => {
      scrolled = window.scrollY > 120;
      update();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        calcInView = entry.isIntersecting;
        update();
      },
      { rootMargin: "0px 0px -40% 0px", threshold: 0.01 },
    );
    io.observe(target);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [targetId]);

  const onClick = () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 pointer-events-none transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div
        className="pointer-events-none absolute inset-0 -top-6 bg-gradient-to-t from-background via-background/85 to-transparent"
        aria-hidden
      />
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto relative w-full h-14 rounded-2xl font-semibold text-base text-primary-foreground flex items-center justify-center gap-2 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.7)]"
        style={{
          background: "linear-gradient(135deg, hsl(220 90% 60%), hsl(265 85% 60%), hsl(320 80% 60%))",
        }}
      >
        {t("home.cta.primary")}
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
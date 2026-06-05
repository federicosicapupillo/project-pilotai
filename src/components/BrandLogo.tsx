import { Link } from "@tanstack/react-router";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; text: string; sub: string }> = {
  sm: { box: "size-7", text: "text-sm", sub: "text-[10px]" },
  md: { box: "size-9", text: "text-lg", sub: "text-xs" },
  lg: { box: "size-12", text: "text-2xl", sub: "text-sm" },
};

export function BrandMark({ className = "", size = 20 }: { className?: string; size?: number }) {
  // Icona: cornice arrotondata (window) + lampadina + sparkle/freccia
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ip-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="55%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* window frame */}
      <rect x="4" y="4" width="56" height="56" rx="14" ry="14" fill="none" stroke="url(#ip-grad)" strokeWidth="3" />
      <circle cx="12" cy="12" r="1.4" fill="url(#ip-grad)" />
      <circle cx="17" cy="12" r="1.4" fill="url(#ip-grad)" />
      <circle cx="22" cy="12" r="1.4" fill="url(#ip-grad)" />
      {/* lampadina */}
      <path
        d="M32 20c-6 0-10 4.4-10 10 0 3.5 1.8 5.7 3.5 7.4 1 1 1.5 1.8 1.5 3v1.6h10v-1.6c0-1.2.5-2 1.5-3C40.2 35.7 42 33.5 42 30c0-5.6-4-10-10-10z"
        fill="none"
        stroke="url(#ip-grad)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M28 46h8M29 49h6" stroke="url(#ip-grad)" strokeWidth="2.2" strokeLinecap="round" />
      {/* sparkle/freccia interno */}
      <path
        d="M32 25.5l1.6 3.4 3.4 1.6-3.4 1.6L32 35.5l-1.6-3.4L27 30.5l3.4-1.6z"
        fill="url(#ip-grad)"
      />
    </svg>
  );
}

export function BrandLockup({
  size = "md",
  showTagline = false,
  className = "",
  asLink = true,
}: {
  size?: Size;
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}) {
  const s = sizeMap[size];
  const iconPx = size === "lg" ? 28 : size === "sm" ? 16 : 20;
  const inner = (
    <div className={"flex items-center gap-2 group " + className}>
      <div className={`${s.box} rounded-lg gradient-bg grid place-items-center glow-soft shrink-0`}>
        <BrandMark size={iconPx} className="text-primary-foreground" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`font-display font-semibold tracking-tight ${s.text}`}>
          IdeaPilot <span className="gradient-text">AI</span>
        </span>
        {showTagline && (
          <span className={`text-muted-foreground ${s.sub}`}>Dalla tua idea alla tua prima app</span>
        )}
      </div>
    </div>
  );
  if (!asLink) return inner;
  return (
    <Link to="/" className="inline-flex">
      {inner}
    </Link>
  );
}

export const BRAND_NAME = "IdeaPilot AI";
export const BRAND_TAGLINE = "Dalla tua idea alla tua prima app";
import { Link } from "@tanstack/react-router";
import markAsset from "@/assets/ideapilot-mark.png.asset.json";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; text: string; sub: string }> = {
  sm: { box: "size-7", text: "text-sm", sub: "text-[10px]" },
  md: { box: "size-9", text: "text-lg", sub: "text-xs" },
  lg: { box: "size-12", text: "text-2xl", sub: "text-sm" },
};

export function BrandMark({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <img
      src={markAsset.url}
      alt="IdeaPilot AI"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
      loading="lazy"
    />
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
  const iconPx = size === "lg" ? 44 : size === "sm" ? 26 : 34;
  const inner = (
    <div className={"flex items-center gap-2 group " + className}>
      <BrandMark size={iconPx} className="shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]" />
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
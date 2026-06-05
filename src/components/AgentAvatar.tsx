import { Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentIdentity } from "@/lib/agent-identity";

type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, { box: string; img: number; badge: string; badgeIcon: number }> = {
  sm: { box: "size-12 sm:size-14", img: 56, badge: "size-5", badgeIcon: 12 },
  md: { box: "size-14 sm:size-16", img: 64, badge: "size-6", badgeIcon: 14 },
  lg: { box: "size-16 sm:size-20", img: 80, badge: "size-7", badgeIcon: 16 },
};

export function AgentAvatar({
  agent,
  size = "md",
  className,
  locked = false,
}: {
  agent: AgentIdentity;
  size?: Size;
  className?: string;
  locked?: boolean;
}) {
  const s = SIZE_MAP[size];
  return (
    <div className={cn("relative shrink-0", s.box, className)}>
      {/* glow */}
      <div
        className={cn(
          "absolute -inset-1 rounded-full blur-md opacity-60 bg-gradient-to-br",
          agent.color,
        )}
        aria-hidden
      />
      {/* avatar */}
      <div
        className={cn(
          "relative w-full h-full rounded-full overflow-hidden ring-2 ring-primary/40 bg-gradient-to-br from-background/80 to-background/40",
          locked && "grayscale opacity-70",
        )}
      >
        <img
          src={agent.avatar}
          alt={agent.name}
          width={s.img}
          height={s.img}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      {agent.badge === "crown" && (
        <div
          className={cn(
            "absolute -top-1 -right-1 rounded-full bg-amber-400 grid place-items-center text-amber-950 ring-2 ring-background shadow",
            s.badge,
          )}
          aria-hidden
        >
          <Crown style={{ width: s.badgeIcon, height: s.badgeIcon }} />
        </div>
      )}
      {agent.badge === "shield" && (
        <div
          className={cn(
            "absolute -top-1 -right-1 rounded-full bg-blue-500 grid place-items-center text-white ring-2 ring-background shadow",
            s.badge,
          )}
          aria-hidden
        >
          <Shield style={{ width: s.badgeIcon, height: s.badgeIcon }} />
        </div>
      )}
    </div>
  );
}
import { ToolIcon } from "./ToolIcon";

export type ToolBadgeProps = {
  name: string;
  size?: "sm" | "md";
  variant?: "soft" | "outline";
  prefix?: string;
  className?: string;
};

export function ToolBadge({ name, size = "md", variant = "soft", prefix, className = "" }: ToolBadgeProps) {
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  const bg = variant === "outline"
    ? "border border-border/60 bg-transparent"
    : "bg-secondary/60 border border-border/40";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${padding} ${bg} text-foreground ${className}`}>
      <ToolIcon name={name} size={size === "sm" ? 13 : 14} />
      {prefix && <span className="text-muted-foreground">{prefix}</span>}
      <span className="font-medium">{name}</span>
    </span>
  );
}
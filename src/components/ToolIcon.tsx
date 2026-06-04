import { useState } from "react";
import { Wrench } from "lucide-react";

// Map of tool name (canonical) → { slug, color, label? } for simpleicons.org CDN.
// `slug` is the simpleicons slug; if missing or the request fails at runtime,
// the component falls back to an elegant monogram tile using brand color + label.
const TOOL_META: Record<string, { slug?: string; color: string; label?: string }> = {
  ChatGPT:           { slug: "openai",     color: "10A37F", label: "GPT" },
  Claude:            { slug: "anthropic",  color: "D97757", label: "Cl" },
  Perplexity:        { slug: "perplexity", color: "1FB8CD", label: "P" },
  Codex:             { slug: "openai",     color: "10A37F", label: "Cx" },
  Lovable:           {                     color: "FF4D8D", label: "L" },
  Supabase:          { slug: "supabase",   color: "3ECF8E", label: "Sb" },
  GitHub:            { slug: "github",     color: "FFFFFF", label: "GH" },
  "GitHub Desktop":  {                     color: "FFFFFF", label: "GH" },
  Antigravity:       {                     color: "A78BFA", label: "A" },
  Obsidian:          { slug: "obsidian",   color: "7C3AED", label: "Ob" },
  Notion:            { slug: "notion",     color: "FFFFFF", label: "N" },
  Midjourney:        {                     color: "FFFFFF", label: "MJ" },
  Runway:            {                     color: "FFFFFF", label: "Rw" },
  ElevenLabs:        {                     color: "8A5CF6", label: "11" },
  HyperFrames:       {                     color: "F472B6", label: "HF" },
  Canva:             { slug: "canva",      color: "00C4CC", label: "C" },
  "D-ID":            {                     color: "38BDF8", label: "DI" },
  Stripe:            { slug: "stripe",     color: "635BFF", label: "S" },
  Twilio:            { slug: "twilio",     color: "F22F46", label: "Tw" },
};

export type ToolIconProps = {
  name: string;
  size?: number;
  className?: string;
};

export function ToolIcon({ name, size = 18, className = "" }: ToolIconProps) {
  const meta = TOOL_META[name];
  const [failed, setFailed] = useState(false);
  const px = `${size}px`;

  const monogram = (color: string, label: string) => (
    <span
      aria-label={name}
      title={name}
      role="img"
      className={`inline-grid place-items-center shrink-0 rounded-md font-display font-semibold leading-none ${className}`}
      style={{
        width: px, height: px,
        fontSize: `${Math.max(9, Math.round(size * 0.5))}px`,
        background: `#${color}22`,
        color: `#${color}`,
        border: `1px solid #${color}55`,
      }}
    >
      {label}
    </span>
  );

  if (meta?.slug && !failed) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${meta.slug}/${meta.color}`}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`inline-block shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }
  if (meta) {
    return monogram(meta.color, meta.label ?? name.charAt(0));
  }
  // Sconosciuto: monogramma neutro invece di un'icona generica rotta
  return monogram("A78BFA", name.slice(0, 2).toUpperCase() || "?");
}
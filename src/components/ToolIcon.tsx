import { Wrench } from "lucide-react";

// Map of tool name (canonical) → { slug, color } for simpleicons.org CDN.
// Tools without a brand icon fall back to a colored monogram tile.
const TOOL_META: Record<string, { slug?: string; color: string }> = {
  ChatGPT: { slug: "openai", color: "10A37F" },
  Claude: { slug: "anthropic", color: "D97757" },
  Perplexity: { slug: "perplexity", color: "1FB8CD" },
  Codex: { slug: "openai", color: "10A37F" },
  Lovable: { slug: "lovable", color: "FF4D8D" },
  Supabase: { slug: "supabase", color: "3ECF8E" },
  GitHub: { slug: "github", color: "FFFFFF" },
  "GitHub Desktop": { slug: "githubdesktop", color: "FFFFFF" },
  Antigravity: { color: "A78BFA" },
  Obsidian: { slug: "obsidian", color: "7C3AED" },
  Notion: { slug: "notion", color: "FFFFFF" },
  Midjourney: { slug: "midjourney", color: "FFFFFF" },
  Runway: { slug: "runway", color: "FFFFFF" },
  ElevenLabs: { slug: "elevenlabs", color: "FFFFFF" },
  HyperFrames: { color: "F472B6" },
  Canva: { slug: "canva", color: "00C4CC" },
  "D-ID": { color: "38BDF8" },
  Stripe: { slug: "stripe", color: "635BFF" },
  Twilio: { slug: "twilio", color: "F22F46" },
};

export type ToolIconProps = {
  name: string;
  size?: number;
  className?: string;
};

export function ToolIcon({ name, size = 18, className = "" }: ToolIconProps) {
  const meta = TOOL_META[name];
  const px = `${size}px`;
  if (meta?.slug) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${meta.slug}/${meta.color}`}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={`inline-block shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }
  if (meta) {
    return (
      <span
        aria-label={name}
        title={name}
        className={`inline-grid place-items-center shrink-0 rounded-md font-display font-semibold ${className}`}
        style={{
          width: px, height: px, fontSize: `${Math.max(9, size * 0.55)}px`,
          background: `#${meta.color}22`, color: `#${meta.color}`,
          border: `1px solid #${meta.color}55`,
        }}
      >
        {name.charAt(0)}
      </span>
    );
  }
  return <Wrench className={`shrink-0 text-muted-foreground ${className}`} style={{ width: px, height: px }} />;
}
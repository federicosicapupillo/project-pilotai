import { Wrench, Repeat, Sparkles } from "lucide-react";

export type ReusableToolkitBoxProps = {
  variant?: "default" | "compact" | "inline";
  showExample?: boolean;
  className?: string;
};

/**
 * Box informativo condiviso: chiarisce che gli abbonamenti agli strumenti
 * AI/no-code sono riutilizzabili su più progetti.
 */
export function ReusableToolkitBox({
  variant = "default",
  showExample = false,
  className = "",
}: ReusableToolkitBoxProps) {
  if (variant === "inline") {
    return (
      <p className={`text-xs text-muted-foreground leading-relaxed ${className}`}>
        <span className="text-foreground/90 font-medium">Molti di questi strumenti sono riutilizzabili anche per altri progetti.</span>{" "}
        Il costo mensile non va letto solo come costo della singola app, ma come investimento nella tua infrastruttura AI/no-code.
      </p>
    );
  }

  const compact = variant === "compact";

  return (
    <div
      className={`relative rounded-2xl border border-primary/25 overflow-hidden ${compact ? "p-4" : "p-5 sm:p-6"} ${className}`}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 10%, hsl(222 47% 6%)) 0%, hsl(222 47% 5%) 60%, color-mix(in oklab, var(--accent) 8%, hsl(222 47% 6%)) 100%)",
        boxShadow:
          "0 0 0 1px color-mix(in oklab, var(--primary) 14%, transparent), 0 14px 40px -22px color-mix(in oklab, var(--primary) 55%, transparent)",
      }}
    >
      <div className="pointer-events-none absolute -top-16 -left-10 size-40 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 -right-10 size-40 rounded-full bg-accent/15 blur-3xl" aria-hidden />

      <div className="relative flex items-start gap-3">
        <div
          className="size-10 rounded-xl grid place-items-center shrink-0"
          style={{
            background: "linear-gradient(135deg, hsl(265 85% 60%), hsl(320 75% 60%))",
            boxShadow: "0 0 18px -4px hsl(265 85% 60% / 0.55)",
          }}
        >
          <Wrench className="size-5 text-white" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-semibold inline-flex items-center gap-1">
              <Repeat className="size-3" /> Strumenti riutilizzabili
            </span>
          </div>
          <h3 className={`font-display font-semibold tracking-tight mt-1 ${compact ? "text-base" : "text-lg sm:text-xl"}`}>
            Non sono costi solo per questa app
          </h3>
          <p className={`text-muted-foreground mt-2 leading-relaxed ${compact ? "text-xs" : "text-sm"}`}>
            Gli abbonamenti agli strumenti AI/no-code che userai per costruire la prima versione non servono solo per questo progetto.
            Una volta attivati, potrai riutilizzarli per creare altre app, landing page, dashboard, CRM, automazioni, contenuti e nuovi progetti digitali.
          </p>
          <p className={`text-foreground/85 mt-2 leading-relaxed ${compact ? "text-xs" : "text-sm"}`}>
            <Sparkles className="inline size-3.5 text-primary mr-1 -mt-0.5" />
            Il corso ti insegna il metodo. Gli strumenti diventano la tua cassetta degli attrezzi per continuare a costruire.
          </p>

          {showExample && (
            <div className="mt-3 rounded-xl border border-border/60 bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Esempio</div>
              <p className="text-xs text-foreground/85 leading-relaxed">
                Se spendi <strong className="text-foreground">100€/mese</strong> in strumenti e crei una sola app, quel costo pesa tutto su quel progetto.
                Se usi gli stessi strumenti per creare <strong className="text-foreground">3 app, una landing e una dashboard</strong>, lo stesso costo lavora su più progetti.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Mappa tool → badge "riutilizzabilità".
 */
const REUSE_BADGES: Record<string, string> = {
  ChatGPT: "Riutilizzabile per ogni progetto",
  Claude: "Riutilizzabile per ogni progetto",
  Lovable: "Per creare più app",
  Supabase: "Backend per più progetti",
  Perplexity: "Ricerca e validazione",
  Antigravity: "Debug e sviluppo avanzato",
  Codex: "Debug e sviluppo avanzato",
  GitHub: "Versioning per più progetti",
  "GitHub Desktop": "Versioning per più progetti",
  Stripe: "Pagamenti per più prodotti",
  Twilio: "Notifiche per più progetti",
  Runway: "Contenuti e demo",
  ElevenLabs: "Contenuti e demo",
  Canva: "Contenuti e demo",
  Midjourney: "Contenuti e demo",
  Notion: "Knowledge base personale",
  Obsidian: "Knowledge base personale",
};

export function getReuseBadge(tool: string): string {
  return REUSE_BADGES[tool] ?? "Utile anche per altre app";
}
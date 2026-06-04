import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, ArrowRight, Layers, Database, ShieldCheck, Hammer, Bug, Wand2, Gauge,
} from "lucide-react";

type Difficulty = "Bassa" | "Media" | "Alta";
type Estimate = {
  hoursLow: number;
  hoursHigh: number;
  difficulty: Difficulty;
  projectType: string;
};

const STORAGE_KEY = "draft_idea_description";
const REDIRECT_KEY = "post_auth_redirect";

function classify(idea: string): Estimate {
  const t = idea.toLowerCase();
  const has = (...kws: string[]) => kws.some((k) => t.includes(k));

  let projectType = "Web app";
  if (has("crm", "clienti", "lead", "pipeline", "follow-up")) projectType = "CRM / Dashboard";
  else if (has("marketplace", "venditori", "annunci", "compra")) projectType = "Marketplace";
  else if (has("landing", "lancio", "pre-order", "waitlist")) projectType = "Landing page";
  else if (has("gestionale", "magazzino", "ordini", "fatture")) projectType = "Gestionale";
  else if (has("dashboard", "metrich", "analytics", "kpi")) projectType = "Dashboard analytics";
  else if (has("prenotaz", "calendar", "slot", "appuntament")) projectType = "App prenotazioni";
  else if (has("blog", "articoli", "cms", "rivista")) projectType = "Sito editoriale";
  else if (has("chat", "messaggi", "realtime")) projectType = "App di messaggistica";

  // Heuristic difficulty
  const heavySignals = [
    "pagament", "stripe", "abbonament", "subscription",
    "realtime", "chat", "video", "ai", "intelligenza",
    "marketplace", "ruoli", "admin", "permess",
    "mappa", "geolocal", "notifiche push",
  ].filter((k) => t.includes(k)).length;
  const length = t.trim().length;

  let difficulty: Difficulty = "Media";
  if (heavySignals >= 2 || length > 600) difficulty = "Alta";
  else if (heavySignals === 0 && length < 120) difficulty = "Bassa";

  const baseByType: Record<string, [number, number]> = {
    "Landing page": [6, 14],
    "Web app": [20, 36],
    "CRM / Dashboard": [24, 40],
    "Dashboard analytics": [28, 48],
    "Gestionale": [30, 50],
    "Marketplace": [40, 70],
    "App prenotazioni": [22, 38],
    "Sito editoriale": [14, 26],
    "App di messaggistica": [40, 70],
  };
  const [bl, bh] = baseByType[projectType] ?? [20, 36];
  const mult = difficulty === "Alta" ? 1.4 : difficulty === "Bassa" ? 0.7 : 1;
  const hoursLow = Math.max(4, Math.round((bl * mult) / 2) * 2);
  const hoursHigh = Math.max(hoursLow + 4, Math.round((bh * mult) / 2) * 2);

  return { hoursLow, hoursHigh, difficulty, projectType };
}

const STEPS = [
  { icon: Sparkles, text: "definizione della prima versione funzionante" },
  { icon: Layers, text: "schermate principali" },
  { icon: Database, text: "database" },
  { icon: ShieldCheck, text: "login utenti" },
  { icon: Hammer, text: "costruzione con Lovable" },
  { icon: Bug, text: "test e correzioni" },
];

export function IdeaEstimator() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<Estimate | null>(null);
  const navigate = useNavigate();

  const onCalc = () => {
    if (idea.trim().length < 8) return;
    setResult(classify(idea));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, idea.trim());
    }
  };

  const goToRoadmap = () => {
    if (typeof window !== "undefined" && idea.trim()) {
      localStorage.setItem(STORAGE_KEY, idea.trim());
      localStorage.setItem(REDIRECT_KEY, "/new-project");
    }
    navigate({ to: "/new-project" });
  };

  return (
    <section className="relative">
      <div className="max-w-3xl mx-auto px-6 -mt-10 pb-10">
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-primary/20 glow-soft">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Gauge className="size-3.5 text-primary" /> Stima rapida
          </div>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl mt-2">
            Hai un'idea per un'app?<br />
            <span className="gradient-text">Scrivila e scopri in quante ore puoi crearla.</span>
          </h2>

          <div className="mt-5 space-y-3">
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Raccontami la tua idea…"
              rows={5}
              maxLength={2000}
              className="text-base"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="hero"
                size="lg"
                onClick={onCalc}
                disabled={idea.trim().length < 8}
              >
                <Wand2 className="size-4" /> Calcola le ore
              </Button>
              <p className="text-xs text-muted-foreground">
                Stima orientativa basata sulla tua descrizione. Non è una promessa: ti aiuta solo a capire l'ordine di grandezza.
              </p>
            </div>
          </div>

          {result && (
            <div className="mt-6 rounded-2xl p-6 border border-primary/30 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
              }}
            >
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <Metric label="Prima versione stimata" value={`${result.hoursLow}–${result.hoursHigh} ore`} accent />
                <Metric label="Difficoltà" value={result.difficulty} />
                <Metric label="Tipo progetto" value={result.projectType} />
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Per costruirla serviranno</div>
                <ol className="grid sm:grid-cols-2 gap-2">
                  {STEPS.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="size-6 rounded-full bg-primary/15 text-primary text-xs grid place-items-center font-display font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex items-center gap-2">
                        <s.icon className="size-3.5 text-primary/80" />
                        {s.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground max-w-md">
                  La prima versione funzionante (chiamata anche MVP) contiene solo le funzioni essenziali per capire se l'idea ha senso.
                </p>
                <Button variant="hero" size="lg" onClick={goToRoadmap}>
                  Crea la roadmap completa <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-background/40 border border-border/60 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-lg ${accent ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}
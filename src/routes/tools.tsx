import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, ExternalLink, Sparkles, Users, ArrowRight, Lock } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { OperativeCircuit } from "@/components/OperativeCircuit";
import { Button } from "@/components/ui/button";
import { useAcademyAccess } from "@/components/AcademyLock";

const AGENT_OVERRIDES: Record<string, { role: string; when: string }> = {
  Idea:        { role: "Lo stratega che dà forma all'idea grezza",          when: "Entra in gioco appena hai un'intuizione" },
  Analisi:     { role: "L'analista che valida l'idea sul mercato",          when: "Entra in gioco prima di iniziare a costruire" },
  Memoria:     { role: "L'archivista che tiene memoria del progetto",       when: "Entra in gioco da subito e ti accompagna sempre" },
  Costruzione: { role: "Il builder che trasforma l'idea in una vera app",   when: "Entra in gioco quando sei pronto a creare" },
  Versioning:  { role: "Lo specialista che tiene ordine nelle versioni",    when: "Entra in gioco quando il progetto diventa serio" },
  Backend:     { role: "L'ingegnere che gestisce dati, utenti e logica",    when: "Entra in gioco quando ti servono account e dati" },
  Test:        { role: "Il garante della qualità che caccia i bug",         when: "Entra in gioco prima di mostrare l'app a qualcuno" },
  Media:       { role: "Il creativo che cura immagini, video e voce",       when: "Entra in gioco quando devi presentare la tua app" },
  Lancio:      { role: "Il manager che porta l'app sul mercato",            when: "Entra in gioco quando sei pronto a farti vedere" },
};

export const Route = createFileRoute("/tools")({
  head: () => ({ meta: [{ title: "Tool Stack — Da Idea ad App" }] }),
  component: ToolsPage,
});

const LEVEL_STYLE: Record<string, string> = {
  base: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  intermedio: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  avanzato: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};
const LEVEL_LABEL: Record<string, string> = { base: "Base", intermedio: "Intermedio", avanzato: "Avanzato" };

const REQ_STYLE: Record<string, string> = {
  required: "bg-primary/15 text-primary border-primary/30",
  recommended: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  optional: "bg-secondary/60 text-muted-foreground border-border/60",
};
const REQ_LABEL: Record<string, string> = { required: "Obbligatorio", recommended: "Consigliato", optional: "Opzionale" };

const CATEGORY_ORDER = [
  "Sviluppo / Costruzione",
  "AI di supporto",
  "Memoria / Organizzazione",
  "Creatività / Media",
  "Integrazioni prodotto",
];

function ToolsPage() {
  const { hasAccess } = useAcademyAccess();
  const { data, isLoading } = useQuery({
    queryKey: ["tool-library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tool_library").select("*").order("sort_order").order("name");
      if (error) throw error;
      return data;
    },
    enabled: hasAccess,
  });

  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, t) => {
    const cat = t.category ?? "Altro";
    if (!acc[cat]) acc[cat] = [] as never;
    (acc[cat] as unknown as typeof data)!.push(t);
    return acc;
  }, {});
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]?.length),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs text-primary mb-4">
          <Users className="size-3.5" /> Il tuo team AI
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-semibold leading-tight">
          Ti presento gli agenti AI che lavoreranno per <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">creare la tua app</span>
        </h1>
        <p className="text-muted-foreground text-lg mt-4 max-w-3xl">
          Non sei da solo. Ogni agente ha un compito preciso: c'è chi ti aiuta a chiarire l'idea, chi costruisce la logica, chi organizza il backend, chi testa, chi cura i media e chi ti accompagna fino al lancio.
        </p>
        <p className="text-sm text-foreground/70 mt-3 max-w-3xl">
          Non devi usarli tutti insieme. Ti guideremo noi su quale attivare, quando serve.
        </p>
      </div>

      <div className="mb-10">
        <OperativeCircuit
          badge="Il tuo team operativo"
          title={<>Questo è il team che porterà la tua idea <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">dal pensiero al lancio</span></>}
          subtitle="Ogni fase ha il suo agente specializzato. Insieme formano la squadra che costruisce la tua app passo dopo passo."
          counterLabel="9 ruoli operativi"
          stepLabelPrefix="Agente"
          stepOverrides={AGENT_OVERRIDES}
          footerNote="Ogni agente ha un compito specifico. Insieme non sono solo strumenti: sono il tuo team operativo AI."
          hideTools={!hasAccess}
          lockCta={!hasAccess ? (
            <Button variant="hero" size="sm" asChild>
              <Link to="/prezzi">Attiva Team AI - 29€ <ArrowRight className="size-4" /></Link>
            </Button>
          ) : undefined}
        />
      </div>

      <div
        className="relative mb-12 rounded-2xl p-8 sm:p-12 overflow-hidden border border-primary/40 text-center"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 16%, transparent), color-mix(in oklab, var(--accent) 12%, transparent))",
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--primary) 28%, transparent), 0 20px 60px -20px color-mix(in oklab, var(--primary) 45%, transparent)",
        }}
      >
        <div className="absolute -top-20 -right-16 size-56 rounded-full bg-primary/25 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute -bottom-20 -left-16 size-56 rounded-full bg-accent/20 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/40 border border-primary/40 text-[11px] uppercase tracking-wider text-primary/90 mb-4">
            <Sparkles className="size-3" /> Il tuo ruolo nel progetto
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-semibold leading-[1.1]">
            Tu devi solo <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">approvare</span>
          </h2>

          <p className="text-base sm:text-lg text-foreground/85 mt-5 max-w-2xl mx-auto leading-relaxed">
            Non devi sapere programmare, disegnare schermate o capire i flussi tecnici. I tuoi agenti AI
            lavorano sulla tua idea e ti mostrano cosa hanno preparato.{" "}
            <strong className="text-foreground">Tu devi solo approvare oppure chiedere modifiche.</strong>
          </p>

          <div className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-background/50 border border-primary/50">
            <span className="text-lg sm:text-xl font-display font-semibold">
              Tu <span className="text-foreground">controlli</span>. Gli agenti{" "}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">eseguono</span>.
            </span>
          </div>

          <ul className="mt-7 grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto text-left">
            {[
              "Nessuna competenza tecnica necessaria",
              "Nessun caos da gestire da solo",
              "Tu approvi, il team AI avanza",
              "Se qualcosa non ti piace, gli agenti la correggono",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-2 text-sm rounded-lg bg-background/40 border border-border/60 px-3 py-2.5"
              >
                <Sparkles className="size-3.5 mt-0.5 shrink-0 text-primary" />
                <span className="text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-border/40">
            <h3 className="font-display font-semibold text-xl sm:text-2xl">
              Vuoi mettere al lavoro i tuoi agenti AI?
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Porta la tua idea. Guarda cosa preparano. Approva solo ciò che ti convince.
            </p>
            <div className="mt-5">
              <Button variant="hero" size="lg" asChild>
                <Link to="/prezzi">
                  Attiva il mio Team AI - 29€ <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground mb-3">
          <Wrench className="size-3.5 text-primary" /> Dietro le quinte del team
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold">Gli strumenti che usano i tuoi agenti</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Ogni agente del tuo team lavora con strumenti specifici. Qui sotto trovi tutti gli strumenti usati: non devi capirli tutti, ci pensa il tuo agente AI a guidarti su quale serve e quando.
        </p>
      </div>

      {isLoading && <div className="text-muted-foreground">Caricamento…</div>}

      {orderedCats.map((cat) => (
        <section key={cat} className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{cat}</h2>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{grouped[cat]?.length} strumenti</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[cat]?.map((t) => {
              const lvl = (t.level ?? t.difficulty_level ?? "").toLowerCase();
              const req = t.requirement ?? "";
              const pairs = Array.isArray(t.pairs_with_agents) ? (t.pairs_with_agents as string[]) : [];
              return (
                <div key={t.id} className="glass-card rounded-xl p-5 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-11 rounded-xl bg-background/60 border border-border/60 grid place-items-center shrink-0">
                      <ToolIcon name={t.name} size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-lg leading-tight">{t.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {req && REQ_LABEL[req] && (
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${REQ_STYLE[req]}`}>
                            {REQ_LABEL[req]}
                          </span>
                        )}
                        {lvl && LEVEL_LABEL[lvl] && (
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${LEVEL_STYLE[lvl]}`}>
                            {LEVEL_LABEL[lvl]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                  <dl className="space-y-2 text-sm mt-3">
                    {t.phase_note && (<>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Quando usarlo</dt>
                      <dd>{t.phase_note}</dd>
                    </>)}
                    {t.course_phase && (<>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Fase del percorso</dt>
                      <dd className="text-foreground/90">{t.course_phase}</dd>
                    </>)}
                    {pairs.length > 0 && (<>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Agenti con cui si abbina</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {pairs.map((p) => (
                          <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/60">{p}</span>
                        ))}
                      </dd>
                    </>)}
                    {t.example_use && (<>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Esempio d'uso</dt>
                      <dd className="italic text-muted-foreground">{t.example_use}</dd>
                    </>)}
                  </dl>
                  {t.url && (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto pt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Apri strumento <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* CTA finale */}
      <section className="mt-12 relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-violet-500/10 to-fuchsia-500/10 p-8 sm:p-12 text-center">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-display font-semibold">Adesso hai il tuo team. Vuoi iniziare a usarlo?</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Attiva il tuo agente AI personale e inizia a costruire la tua app con il supporto della squadra giusta.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button variant="hero" size="lg">
                <Sparkles className="size-4" /> Attiva il mio team AI
              </Button>
            </Link>
            <Link to="/academy">
              <Button variant="outline" size="lg">
                Scopri da dove partire <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
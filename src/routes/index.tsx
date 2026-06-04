import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { IdeaEstimator } from "@/components/IdeaEstimator";
import {
  Sparkles, ArrowRight, Users, Wand2, ListChecks, BookOpen,
  Lightbulb, Rocket, Target, ShieldCheck, Layers, Zap, PenLine, FileText, Hammer,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Da Idea ad App — Trasforma la tua idea in una prima app con agenti AI" },
      { name: "description", content: "Il metodo per imprenditori e creator senza competenze tecniche: scheda progetto, agenti AI, prompt operativi, roadmap." },
      { property: "og:title", content: "Da Idea ad App" },
      { property: "og:description", content: "Diventa il regista di una squadra di agenti AI e porta la tua idea online." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main>
        {/* HERO */}
        <section className="relative hero-bg overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
              <Sparkles className="size-3 text-primary" /> Metodo AI per non tecnici
            </div>
            <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-tight leading-[1.05]">
              Hai un'<span className="gradient-text">idea</span> per un'app?<br />
              Scrivila e scopri in quanto <span className="gradient-text">tempo</span> puoi crearla.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Da Idea ad App ti guida passo passo con agenti AI, strumenti no-code,
              prompt operativi e una roadmap personalizzata per trasformare la tua idea in una prima app reale.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/pricing">
                <Button variant="hero" size="xl">Inizia il tuo progetto <ArrowRight className="size-4" /></Button>
              </Link>
              <Link to="/method">
                <Button variant="glass" size="xl">Scopri il metodo</Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Niente promesse magiche: tu resti il regista, gli agenti AI ti aiutano passo passo.
            </p>
          </div>
        </section>

        {/* IDEA → ORE — blocco interattivo subito sotto la hero */}
        <IdeaEstimator />

        {/* STEPS — 4 card subito sotto la hero */}
        <Section title="Dall'idea alla prima versione dell'app in 4 passi" eyebrow="Come funziona">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: PenLine, title: "1. Inserisci la tua idea", desc: "Rispondi a poche domande guidate: cosa fai, per chi, quale problema risolvi." },
              { icon: FileText, title: "2. Ottieni il progetto strutturato", desc: "Una scheda chiara: target, prima versione dell'app (MVP), schermate, dati, rischi e cosa non costruire." },
              { icon: Wand2, title: "3. Agenti AI e prompt pronti", desc: "Una squadra di agenti AI consigliati e prompt operativi da copiare e usare." },
              { icon: Hammer, title: "4. Costruisci la prima versione della tua app", desc: "Segui la roadmap passo passo e realizza la prima versione funzionante con strumenti no-code." },
            ].map((s) => (
              <div key={s.title} className="glass-card rounded-xl p-6">
                <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                  <s.icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mt-4">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* METODO */}
        <Section title="Il metodo in dettaglio" eyebrow="Il metodo">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Lightbulb, title: "1. Descrivi l'idea", desc: "Rispondi a un form guidato: cosa fai, per chi, quale problema risolvi." },
              { icon: Layers, title: "2. Ricevi una scheda chiara", desc: "Target, soluzione, funzioni essenziali della prima versione, schermate, dati, rischi, cosa NON costruire." },
              { icon: Wand2, title: "3. Squadra agenti + prompt", desc: "7 agenti AI consigliati, ognuno con prompt pronti da copiare nei tuoi strumenti." },
            ].map((s) => (
              <div key={s.title} className="glass-card rounded-xl p-6">
                <div className="size-10 rounded-lg gradient-bg grid place-items-center glow-soft">
                  <s.icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mt-4">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* VANTAGGI */}
        <Section title="Perché funziona" eyebrow="Vantaggi">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Target, title: "Focus chiaro", desc: "Prima versione dell'app definita, niente progetti infiniti." },
              { icon: Zap, title: "Veloce", desc: "Dal foglio bianco alla scheda in 5 minuti." },
              { icon: ShieldCheck, title: "Niente codice", desc: "Pensato per chi non programma." },
              { icon: Rocket, title: "Pronto a costruire", desc: "Prompt e roadmap operativa inclusi." },
            ].map((v) => (
              <div key={v.title} className="glass-card rounded-xl p-5">
                <v.icon className="size-5 text-primary" />
                <h3 className="font-display font-semibold mt-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ESEMPI */}
        <Section title="Esempi di progetti realizzabili" eyebrow="Casi reali">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { t: "Prenotazioni per ristorante", d: "Una web app semplice per ricevere prenotazioni senza più perdere chiamate." },
              { t: "CRM mini per consulenti", d: "Schede cliente, note, follow-up. Solo l'essenziale." },
              { t: "Landing per lanciare un servizio", d: "Pagina che spiega l'offerta e raccoglie contatti qualificati." },
              { t: "Gestionale per agente immobiliare", d: "Annunci, clienti interessati, appuntamenti in un posto solo." },
              { t: "App interna per il team", d: "Strumento su misura per un processo specifico del tuo studio." },
              { t: "Marketplace di nicchia", d: "Una prima versione dell'app (MVP) per validare l'idea con utenti reali." },
            ].map((e) => (
              <div key={e.t} className="glass-card rounded-xl p-5">
                <h3 className="font-display font-semibold">{e.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{e.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* PER CHI */}
        <Section title="Per chi è" eyebrow="Target">
          <div className="glass-card rounded-2xl p-8 grid md:grid-cols-2 gap-6">
            <div>
              <Users className="size-6 text-primary" />
              <h3 className="font-display font-semibold text-xl mt-3">Imprenditori, consulenti, creator</h3>
              <p className="text-muted-foreground mt-2">
                Hai un'intuizione, un servizio o un processo che vorresti digitalizzare ma non sai da dove iniziare.
                Tu resti il regista: gli agenti AI ti aiutano passo passo con struttura, prompt e roadmap per partire davvero.
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              {["Ristoratori e attività locali", "Agenti immobiliari", "Freelance e studi professionali", "Coach e formatori", "Founder alla prima versione dell'app"].map((x) => (
                <li key={x} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /> {x}</li>
              ))}
            </ul>
          </div>
        </Section>

        {/* COSA OTTIENI */}
        <Section title="Cosa ottieni" eyebrow="Deliverable">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Layers, t: "Scheda progetto strutturata", d: "Target, prima versione dell'app (MVP), schermate, dati, rischi, cosa NON costruire." },
              { icon: Users, t: "Squadra di 7 agenti AI", d: "Stratega, PM, UX, Prompt Engineer, Tester, Marketing, Documentazione." },
              { icon: BookOpen, t: "Libreria di prompt pronti", d: "Per ogni fase: strategia, ricerca, design, debug, marketing, lancio." },
              { icon: ListChecks, t: "Roadmap operativa", d: "10 step con stato Da fare / In corso / Completato." },
            ].map((c) => (
              <div key={c.t} className="glass-card rounded-xl p-5 flex gap-4">
                <div className="size-10 rounded-lg bg-secondary grid place-items-center shrink-0">
                  <c.icon className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{c.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="glass-card rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 hero-bg opacity-60 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-display font-semibold">
                La tua idea merita una <span className="gradient-text">prima versione</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Tu guidi la visione, gli agenti AI ti accompagnano passo passo: scheda progetto, prompt e roadmap personalizzata in pochi minuti.
              </p>
              <Link to="/pricing" className="inline-block mt-8">
                <Button variant="hero" size="xl">Inizia il tuo progetto <ArrowRight className="size-4" /></Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Da Idea ad App — metodo, agenti, prompt.
        </footer>
      </main>
    </div>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-primary font-semibold">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-display font-semibold mt-2 mb-8">{title}</h2>
      {children}
    </section>
  );
}

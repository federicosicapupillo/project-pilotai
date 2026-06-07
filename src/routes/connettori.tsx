import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Github, Database, HardDrive, FileText, Wand2, Sparkles,
  MessagesSquare, Brain, Search, Mail, Calendar, Film, Image as ImageIcon,
  Mic, UserCircle2, Plug, AlertTriangle, CheckCircle2, RefreshCcw,
  CircleDashed, Hand, Settings2, Download, FolderOpen, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/connettori")({
  head: () => ({
    meta: [
      { title: "Connettori — IdeaPilot AI" },
      { name: "description", content: "Quali strumenti puoi collegare a IdeaPilot: cosa è manuale, cosa è collegabile e cosa potrà sincronizzarsi in futuro. Nessuna integrazione finta." },
      { property: "og:title", content: "Connettori — IdeaPilot AI" },
      { property: "og:description", content: "Dashboard dei connettori: manuali, da collegare, collegati, sincronizzati, in errore." },
    ],
  }),
  component: ConnettoriPage,
});

type Status = "manuale" | "da-collegare" | "collegato" | "sincronizzato" | "errore" | "non-disponibile";
type Category = "Sviluppo" | "Database" | "File" | "Note" | "AI" | "Email" | "Calendario" | "Creatività";

type Connector = {
  id: string;
  name: string;
  category: Category;
  status: Status;
  Icon: React.ComponentType<{ className?: string }>;
  short: string;
  canImport: string[];
  canRead?: string[];
  canWrite?: string[];
  privacy: string;
  nextAction: string;
  mode: string;
};

const STATUS_META: Record<Status, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  "manuale":        { label: "Manuale",        cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",   Icon: Hand },
  "da-collegare":   { label: "Da collegare",   cls: "bg-blue-500/10 text-blue-300 border-blue-500/30",      Icon: Plug },
  "collegato":      { label: "Collegato",      cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", Icon: CheckCircle2 },
  "sincronizzato":  { label: "Sincronizzato",  cls: "bg-primary/15 text-primary border-primary/30",         Icon: RefreshCcw },
  "errore":         { label: "Errore",         cls: "bg-rose-500/15 text-rose-300 border-rose-500/30",      Icon: AlertTriangle },
  "non-disponibile":{ label: "Non disponibile",cls: "bg-secondary/60 text-muted-foreground border-border/60", Icon: CircleDashed },
};

const CONNECTORS: Connector[] = [
  {
    id: "github", name: "GitHub", category: "Sviluppo", status: "da-collegare", Icon: Github,
    short: "Repository, README, commit, issue e documentazione tecnica.",
    canImport: ["README", "File markdown", "Commit", "Issue", "Changelog"],
    canRead: ["File pubblici e privati autorizzati", "Issue e PR"],
    canWrite: ["Nessuna scrittura per ora"],
    privacy: "Richiede OAuth GitHub con scope minimi (repo read). Nessun token salvato in chiaro.",
    nextAction: "Collega il repository del progetto per permettere a IdeaPilot di leggere README, changelog e file markdown.",
    mode: "OAuth GitHub (non ancora attivo)",
  },
  {
    id: "supabase", name: "Supabase", category: "Database", status: "da-collegare", Icon: Database,
    short: "Schema database, tabelle, migrazioni, storage e log del backend.",
    canImport: ["Schema", "Tabelle", "Migrazioni", "Bucket storage", "Log recenti"],
    canRead: ["Metadati progetto", "Schema pubblico"],
    canWrite: ["Nessuna scrittura per ora"],
    privacy: "Richiede service role o personal access token. Salvati solo in Secrets server-side.",
    nextAction: "Collega il progetto Supabase per leggere schema e stato del backend.",
    mode: "Personal Access Token (non ancora attivo)",
  },
  {
    id: "google-drive", name: "Google Drive", category: "File", status: "da-collegare", Icon: HardDrive,
    short: "Documenti, PDF, immagini e cartelle progetto.",
    canImport: ["Documenti", "PDF", "Immagini", "Cartelle"],
    canRead: ["File condivisi e autorizzati"],
    canWrite: ["Nessuna scrittura per ora"],
    privacy: "Richiede OAuth Google con scope drive.readonly. Token gestiti server-side.",
    nextAction: "Connetti Google Drive per importare documenti progetto.",
    mode: "OAuth Google (non ancora attivo)",
  },
  {
    id: "obsidian", name: "Obsidian", category: "Note", status: "manuale", Icon: FileText,
    short: "Vault, note markdown e cartelle di progetto.",
    canImport: ["File markdown", "Cartelle vault"],
    privacy: "Il vault è locale al tuo computer: nessuna integrazione diretta è possibile senza un sync esterno.",
    nextAction: "Sincronizza il vault tramite GitHub o Drive, oppure importa manualmente file markdown.",
    mode: "Manuale (file locali) o via GitHub/Drive",
  },
  {
    id: "lovable", name: "Lovable", category: "Sviluppo", status: "manuale", Icon: Wand2,
    short: "Riepiloghi progetto, prompt, changelog e stato sviluppo.",
    canImport: ["Riepiloghi", "Prompt", "Changelog"],
    privacy: "Non esiste un'API pubblica Lovable per import diretto: passa dal repository GitHub generato.",
    nextAction: "Esporta o copia i riepiloghi progetto oppure collega il repository GitHub generato da Lovable.",
    mode: "Manuale o via GitHub",
  },
  {
    id: "antigravity", name: "Antigravity", category: "Sviluppo", status: "manuale", Icon: Sparkles,
    short: "Stato progetto, file, codice, prompt e workflow.",
    canImport: ["Stato progetto", "File", "Prompt", "Workflow"],
    privacy: "Nessuna integrazione diretta: import manuale o via repository condiviso.",
    nextAction: "Importa manualmente stato e prompt oppure collega un repository GitHub di appoggio.",
    mode: "Manuale o via GitHub",
  },
  {
    id: "chatgpt", name: "ChatGPT", category: "AI", status: "manuale", Icon: MessagesSquare,
    short: "Riassunti, prompt, strategie e decisioni.",
    canImport: ["Riassunti", "Prompt", "Strategie", "Export conversazioni"],
    privacy: "Le conversazioni vanno esportate dall'utente: nessun accesso automatico.",
    nextAction: "Importa manualmente riassunti, prompt o export delle conversazioni.",
    mode: "Manuale (copia/incolla o export)",
  },
  {
    id: "claude", name: "Claude", category: "AI", status: "manuale", Icon: Brain,
    short: "Analisi, prompt, documenti e ragionamenti.",
    canImport: ["Analisi", "Prompt", "Documenti"],
    privacy: "Nessuna API import-conversazioni pubblica: solo import manuale.",
    nextAction: "Importa manualmente i contenuti delle tue chat Claude.",
    mode: "Manuale (copia/incolla o export)",
  },
  {
    id: "perplexity", name: "Perplexity", category: "AI", status: "manuale", Icon: Search,
    short: "Ricerche, fonti, link e sintesi.",
    canImport: ["Ricerche", "Fonti", "Link", "Sintesi"],
    privacy: "Import manuale degli output di ricerca.",
    nextAction: "Copia le ricerche più utili nell'archivio del progetto.",
    mode: "Manuale",
  },
  {
    id: "gmail", name: "Gmail", category: "Email", status: "da-collegare", Icon: Mail,
    short: "Email importanti, estrazione task, collegamento conversazioni → progetti.",
    canImport: ["Email filtrate", "Allegati selezionati"],
    canRead: ["Solo dopo OAuth con scope gmail.readonly"],
    canWrite: ["Nessuna scrittura prevista"],
    privacy: "Richiede OAuth Google reale prima di poter leggere qualsiasi email. Nessun accesso senza consenso esplicito.",
    nextAction: "Richiede connessione OAuth prima di poter leggere email.",
    mode: "OAuth Google (non ancora attivo)",
  },
  {
    id: "google-calendar", name: "Google Calendar", category: "Calendario", status: "da-collegare", Icon: Calendar,
    short: "Appuntamenti, scadenze, eventi di progetto.",
    canImport: ["Eventi", "Scadenze"],
    canRead: ["Calendari autorizzati"],
    canWrite: ["Nessuna scrittura per ora"],
    privacy: "Richiede OAuth Google con scope calendar.readonly.",
    nextAction: "Collega Google Calendar per importare scadenze e milestone.",
    mode: "OAuth Google (non ancora attivo)",
  },
  {
    id: "runway", name: "Runway", category: "Creatività", status: "manuale", Icon: Film,
    short: "Prompt video, asset video, note creative.",
    canImport: ["Prompt video", "Asset", "Note creative"],
    privacy: "Nessuna integrazione automatica: import manuale.",
    nextAction: "Salva i prompt video più riusciti nell'archivio creativo.",
    mode: "Manuale",
  },
  {
    id: "midjourney", name: "Midjourney", category: "Creatività", status: "manuale", Icon: ImageIcon,
    short: "Prompt immagini, riferimenti visual, asset creativi.",
    canImport: ["Prompt", "Riferimenti", "Asset"],
    privacy: "Nessuna API import diretta: import manuale.",
    nextAction: "Archivia prompt e immagini chiave del moodboard.",
    mode: "Manuale",
  },
  {
    id: "elevenlabs", name: "ElevenLabs", category: "Creatività", status: "manuale", Icon: Mic,
    short: "Script voce, voiceover, prompt audio.",
    canImport: ["Script", "Voiceover", "Prompt audio"],
    privacy: "Import manuale di script e file audio.",
    nextAction: "Salva gli script voce e i prompt audio approvati.",
    mode: "Manuale",
  },
  {
    id: "d-id", name: "D-ID", category: "Creatività", status: "manuale", Icon: UserCircle2,
    short: "Script avatar, video generati, prompt.",
    canImport: ["Script avatar", "Video", "Prompt"],
    privacy: "Import manuale dei contenuti generati.",
    nextAction: "Salva script avatar e video chiave nell'archivio.",
    mode: "Manuale",
  },
];

const FILTERS: { id: string; label: string; match: (c: Connector) => boolean }[] = [
  { id: "all",            label: "Tutti",          match: () => true },
  { id: "manuale",        label: "Manuali",        match: (c) => c.status === "manuale" },
  { id: "da-collegare",   label: "Da collegare",   match: (c) => c.status === "da-collegare" },
  { id: "collegato",      label: "Collegati",      match: (c) => c.status === "collegato" },
  { id: "sincronizzato",  label: "Sincronizzati",  match: (c) => c.status === "sincronizzato" },
  { id: "errore",         label: "Errore",         match: (c) => c.status === "errore" },
  { id: "AI",             label: "AI",             match: (c) => c.category === "AI" },
  { id: "Sviluppo",       label: "Sviluppo",       match: (c) => c.category === "Sviluppo" },
  { id: "File",           label: "File",           match: (c) => c.category === "File" || c.category === "Note" },
  { id: "Email",          label: "Email",          match: (c) => c.category === "Email" },
  { id: "Calendario",     label: "Calendario",     match: (c) => c.category === "Calendario" },
  { id: "Creatività",     label: "Creatività",     match: (c) => c.category === "Creatività" },
];

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  const Icon = m.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${m.cls}`}>
      <Icon className="size-3.5" /> {m.label}
    </span>
  );
}

function ConnettoriPage() {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0];
    return CONNECTORS.filter(f.match);
  }, [filter]);

  const open = openId ? CONNECTORS.find((c) => c.id === openId) ?? null : null;

  const goImport = (id: string, name: string) => {
    navigate({ to: "/importa", search: { strumento: id } as never });
    void name;
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">Connettori</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">Connettori</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-3xl">
          Cosa è già manuale, cosa è collegabile e cosa potrà sincronizzarsi in futuro.
        </p>

        <div
          className="mt-6 rounded-2xl border border-primary/25 p-5 sm:p-6"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--primary) 8%, hsl(222 47% 7%)) 0%, hsl(222 47% 6%) 100%)",
          }}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed">
              IdeaPilot può salvare contenuti manualmente già da ora. Le sincronizzazioni automatiche
              richiedono connettori reali tramite API, OAuth, GitHub, Drive o altri sistemi autorizzati.
              Questa pagina mostra cosa è già manuale, cosa è collegabile e cosa potrà essere sincronizzato.
              <span className="block mt-2 text-xs text-muted-foreground">
                Nessuno strumento è dichiarato “Collegato” se non esiste una connessione reale autorizzata.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm transition ${
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/40 text-foreground/80 border-border/60 hover:bg-secondary/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((c) => {
            const Icon = c.Icon;
            return (
              <article
                key={c.id}
                className="rounded-2xl border border-border/60 bg-card/40 p-5 flex flex-col gap-3 hover:border-primary/40 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-secondary/60 grid place-items-center">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.category}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <p className="text-sm text-foreground/85">{c.short}</p>

                <div className="text-xs text-muted-foreground">
                  <span className="text-foreground/70">Può importare:</span>{" "}
                  {c.canImport.slice(0, 3).join(" · ")}
                  {c.canImport.length > 3 ? " · …" : ""}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-foreground/70">Modalità:</span> {c.mode}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    disabled={c.status !== "da-collegare"}
                    title={c.status !== "da-collegare" ? "Configurazione non ancora disponibile" : ""}
                  >
                    <Settings2 className="size-3.5" /> Configura
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => goImport(c.id, c.name)}>
                    <Download className="size-3.5" /> Importa manualmente
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setOpenId(c.id)}>
                    <FolderOpen className="size-3.5" /> Dettagli
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-secondary/60 grid place-items-center">
                    <open.Icon className="size-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{open.name}</DialogTitle>
                    <DialogDescription>{open.category} · <span className="inline-block align-middle"><StatusBadge status={open.status} /></span></DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="text-foreground/90">{open.short}</p>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Modalità di collegamento</div>
                  <div>{open.mode}</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Può leggere</div>
                    <ul className="list-disc pl-5 space-y-1 text-foreground/85">
                      {(open.canRead ?? ["Solo ciò che importi manualmente"]).map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Può scrivere</div>
                    <ul className="list-disc pl-5 space-y-1 text-foreground/85">
                      {(open.canWrite ?? ["Nessuna scrittura"]).map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Cosa puoi importare</div>
                  <div className="flex flex-wrap gap-1.5">
                    {open.canImport.map((x) => (
                      <Badge key={x} variant="secondary" className="font-normal">{x}</Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-amber-300 mb-1">Privacy</div>
                  <p className="text-foreground/85">{open.privacy}</p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-primary mb-1">Prossima azione consigliata</div>
                  <p className="text-foreground/90">{open.nextAction}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={open.status !== "da-collegare"}
                    className="gap-1.5"
                  >
                    <Settings2 className="size-3.5" /> Configura
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => goImport(open.id, open.name)}>
                    <Download className="size-3.5" /> Importa manualmente
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
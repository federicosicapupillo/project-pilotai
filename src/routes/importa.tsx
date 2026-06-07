import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Download, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

type Search = { strumento?: string };

const TOOL_LABEL: Record<string, string> = {
  github: "GitHub", supabase: "Supabase", "google-drive": "Google Drive",
  obsidian: "Obsidian", lovable: "Lovable", antigravity: "Antigravity",
  chatgpt: "ChatGPT", claude: "Claude", perplexity: "Perplexity",
  gmail: "Gmail", "google-calendar": "Google Calendar",
  runway: "Runway", midjourney: "Midjourney", elevenlabs: "ElevenLabs", "d-id": "D-ID",
};

export const Route = createFileRoute("/importa")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    strumento: typeof s.strumento === "string" ? s.strumento.slice(0, 64) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Importa manualmente — IdeaPilot AI" },
      { name: "description", content: "Importa manualmente contenuti dai tuoi strumenti in IdeaPilot. Funzione in preparazione." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImportaPage,
});

function ImportaPage() {
  const { strumento } = useSearch({ from: "/importa" });
  const label = strumento ? TOOL_LABEL[strumento] ?? strumento : "";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20">
        <Link to="/connettori" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Torna ai connettori
        </Link>

        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight">Importa manualmente</h1>
        <p className="mt-2 text-muted-foreground">
          Pagina in preparazione. Qui potrai incollare testi, caricare file o trascinare export dai tuoi strumenti.
        </p>

        <div className="mt-6 rounded-2xl border border-border/60 bg-card/40 p-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Strumento collegato</label>
            <div className="mt-1 flex items-center gap-2">
              <div className="px-3 py-2 rounded-lg bg-secondary/60 border border-border/60 flex items-center gap-2 text-sm">
                <Hand className="size-4 text-amber-300" />
                {label || "Nessuno strumento selezionato"}
              </div>
              {!label && (
                <span className="text-xs text-muted-foreground">Apri da <Link to="/connettori" className="underline">Connettori</Link>.</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground text-center">
            Importazione in arrivo. Per ora archivia manualmente nel tuo flusso di progetto.
          </div>

          <Button disabled className="gap-1.5">
            <Download className="size-4" /> Importa (presto disponibile)
          </Button>
        </div>
      </section>
    </main>
  );
}
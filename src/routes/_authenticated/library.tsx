import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROMPT_CATEGORIES, PROMPT_LIBRARY_SEED } from "@/lib/project-templates";
import { toast } from "sonner";
import { Copy, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Libreria prompt — Da Idea ad App" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const [active, setActive] = useState<string>("Tutti");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return PROMPT_LIBRARY_SEED.filter((p) => {
      if (active !== "Tutti" && p.category !== active) return false;
      if (q && !(p.title.toLowerCase().includes(q.toLowerCase()) || p.prompt_text.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [active, q]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copiato");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-display font-semibold">Libreria prompt</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Prompt operativi pronti da copiare, organizzati per fase del progetto. Pensati per imprenditori e
        creator, non solo per sviluppatori.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cerca prompt…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["Tutti", ...PROMPT_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={
              "text-xs px-3 py-1.5 rounded-full border transition-colors " +
              (active === c
                ? "gradient-bg text-primary-foreground border-transparent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {filtered.map((p, i) => (
          <div key={i} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  {p.category}
                </span>
                <h3 className="font-display font-semibold mt-2">{p.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Consigliato: {p.recommended_tool}</p>
              </div>
              <Button variant="glass" size="sm" onClick={() => copy(p.prompt_text)}>
                <Copy className="size-4" />
              </Button>
            </div>
            <pre className="mt-3 rounded-lg border border-border/60 bg-background/60 p-4 font-mono text-xs whitespace-pre-wrap overflow-auto">
{p.prompt_text}
            </pre>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">Nessun prompt trovato.</p>}
      </div>
    </div>
  );
}
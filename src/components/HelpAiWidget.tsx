import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { HelpCircle, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { askHelpAi } from "@/lib/help-ai.functions";
import { useActiveProject } from "@/hooks/use-active-project";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Ciao, sono l'Assistente IdeaPilot. Posso aiutarti a capire come usare la piattaforma, i progetti, la roadmap, gli agenti e i prompt operativi. Dimmi dove ti sei bloccato.",
};

const QUICK_ACTIONS = [
  "Come funziona la roadmap?",
  "Come uso un prompt?",
  "Cosa fa il Project Manager?",
  "Come creo un progetto?",
  "Come funziona il pagamento?",
  "Come continuo la costruzione?",
  "Perché devo incollare la risposta dell'AI?",
];

const HIDDEN_ROUTES = ["/auth"];

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/new-project": "Nuovo progetto",
  "/project-manager": "Project Manager",
  "/agente-ai": "Project Manager",
  "/agents": "Agenti",
  "/prezzi": "Prezzi",
  "/pricing": "Prezzi",
  "/checkout-agente": "Checkout",
  "/pagamento-successo": "Pagamento riuscito",
  "/pagamento-annullato": "Pagamento annullato",
  "/roadmap-success": "Il mio percorso",
};

function pageContextLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  if (pathname.startsWith("/projects/")) return "Scheda progetto";
  if (pathname.startsWith("/workbook")) return "Workbook progetto";
  if (pathname.startsWith("/academy")) return "Academy";
  return pathname;
}

export function HelpAiWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { active } = useActiveProject();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const askFn = useServerFn(askHelpAi);

  const mutation = useMutation({
    mutationFn: async (next: ChatMessage[]) => {
      const res = await askFn({
        data: {
          messages: next.slice(-10),
          pageContext: pageContextLabel(pathname),
          activeProjectTitle: active?.title ?? "",
        },
      });
      return res.text;
    },
    onSuccess: (text) => {
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Errore inatteso";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Si è verificato un problema. Riprova tra poco oppure consulta il Project Manager per le decisioni operative sul progetto.",
        },
      ]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, mutation.isPending]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (HIDDEN_ROUTES.includes(pathname)) return null;
  // Help assistant is only available to authenticated users (the server
  // function requires auth). Hide it for anonymous visitors.
  if (!user) return null;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Hai bisogno di aiuto?"
        title="Hai bisogno di aiuto?"
        className={cn(
          "fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground shadow-lg shadow-primary/30",
          "hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary/50",
          "md:bottom-6 md:right-6",
          open && "opacity-0 pointer-events-none",
        )}
      >
        <HelpCircle className="h-6 w-6" />
        <span className="sr-only">Hai bisogno di aiuto?</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-4 py-3 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-base">Assistente IdeaPilot</SheetTitle>
                <SheetDescription className="text-xs">
                  Ti aiuto a usare la piattaforma
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Chiudi"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Sto pensando…
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="border-t border-border px-4 py-2">
              <p className="mb-2 text-xs text-muted-foreground">Domande frequenti:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    disabled={mutation.isPending}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Chiedi qualcosa sulla piattaforma…"
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                disabled={mutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={mutation.isPending || !input.trim()}
                aria-label="Invia"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
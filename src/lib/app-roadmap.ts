// Shared utilities for the App Construction Roadmap.
// Pure helpers + constants — safe to import from client and server.

export const APP_ROADMAP_PHASES = [
  "Chiarezza idea",
  "Validazione",
  "MVP",
  "Schermate e flussi",
  "Database e dati",
  "Costruzione con Lovable",
  "Backend e sicurezza",
  "Test e bug",
  "Grafica e presentazione",
  "Demo e lancio beta",
] as const;
export type AppRoadmapPhase = (typeof APP_ROADMAP_PHASES)[number];

/** Default progress weight per phase (1 = strategic, 2 = build/critical). */
export const PHASE_WEIGHT: Record<AppRoadmapPhase, number> = {
  "Chiarezza idea": 1,
  "Validazione": 1,
  "MVP": 2,
  "Schermate e flussi": 2,
  "Database e dati": 2,
  "Costruzione con Lovable": 2,
  "Backend e sicurezza": 2,
  "Test e bug": 2,
  "Grafica e presentazione": 1,
  "Demo e lancio beta": 1,
};

export type RoadmapStatus = "todo" | "in_progress" | "done";

export type RoadmapItem = {
  id?: string;
  title: string;
  description: string | null;
  phase: string | null;
  order_index: number;
  status: RoadmapStatus | string;
  priority: number;
  recommended_agent: string | null;
  recommended_tool: string | null;
  prompt_text: string | null;
  expected_output: string | null;
  checklist_items: unknown;
  progress_weight: number;
  user_notes?: string | null;
  completed_at?: string | null;
};

/** Weighted progress: 0–100, rounded. */
export function computeProgress(items: Pick<RoadmapItem, "status" | "progress_weight">[]): {
  pct: number;
  completed: number;
  total: number;
} {
  if (!items || items.length === 0) return { pct: 0, completed: 0, total: 0 };
  let totalW = 0;
  let doneW = 0;
  let completed = 0;
  for (const it of items) {
    const w = Math.max(1, Number(it.progress_weight) || 1);
    totalW += w;
    if (it.status === "done") {
      doneW += w;
      completed += 1;
    }
  }
  const pct = totalW > 0 ? Math.round((doneW / totalW) * 100) : 0;
  return { pct, completed, total: items.length };
}

export function currentPhase(items: RoadmapItem[]): string | null {
  const sorted = [...items].sort((a, b) => a.order_index - b.order_index);
  const next = sorted.find((i) => i.status !== "done");
  return next?.phase ?? sorted[sorted.length - 1]?.phase ?? null;
}

export function nextActionableStep(items: RoadmapItem[]): RoadmapItem | null {
  const sorted = [...items].sort((a, b) => a.order_index - b.order_index);
  return sorted.find((i) => i.status !== "done") ?? null;
}

/** Deterministic fallback roadmap used when the AI call fails. */
export function buildFallbackRoadmap(project: { title: string; idea_description?: string | null }): Omit<RoadmapItem, "id">[] {
  const idea = project.idea_description?.trim() || project.title;
  const defs: Array<Omit<RoadmapItem, "id" | "order_index" | "progress_weight" | "priority">> = [
    {
      phase: "Chiarezza idea",
      title: "Scrivi l'idea in una frase di 20 parole",
      description: "Riduci il progetto a una frase chiara: cosa fa, per chi, con quale risultato.",
      status: "todo",
      recommended_agent: "Agente Stratega",
      recommended_tool: "ChatGPT",
      prompt_text: `Agisci come Stratega. Aiutami a riscrivere in una frase di max 20 parole l'idea: "${idea}". Formula: "Voglio creare X per aiutare Y a ottenere Z senza W". Dammi 3 alternative.`,
      expected_output: "Una frase di max 20 parole salvata nel Workbook (Idea).",
      checklist_items: ["Frase ≤20 parole", "Contiene target e risultato", "Salvata nel Workbook"],
    },
    {
      phase: "Validazione",
      title: "Mappa competitor e alternative manuali",
      description: "Trova competitor diretti, indiretti e modi 'manuali' con cui le persone risolvono già il problema.",
      status: "todo",
      recommended_agent: "Agente Ricercatore",
      recommended_tool: "Perplexity",
      prompt_text: `Trova competitor diretti, indiretti e alternative manuali per: "${idea}". Per ognuno: nome, link, punto forte, punto debole.`,
      expected_output: "Mappa competitor con ≥3 voci per categoria nel Workbook (Validazione).",
      checklist_items: ["≥3 competitor diretti", "≥3 alternative manuali", "Punto forte/debole per ognuno"],
    },
    {
      phase: "Validazione",
      title: "Verifica che esista domanda reale",
      description: "Cerca discussioni, ricerche e community che dimostrino che il problema è davvero sentito.",
      status: "todo",
      recommended_agent: "Agente Business Analyst",
      recommended_tool: "Perplexity",
      prompt_text: `Trova 5 prove di domanda per: "${idea}". Ricerche, forum, community, aziende che pagano. Giudizio finale: debole/media/forte.`,
      expected_output: "Almeno 3 prove concrete + giudizio onesto sulla forza della domanda.",
      checklist_items: ["≥3 prove raccolte", "Giudizio onesto scritto"],
    },
    {
      phase: "MVP",
      title: "Definisci l'MVP del progetto",
      description: "Riduci l'idea alla prima versione costruibile: ipotesi da verificare + comportamento atteso.",
      status: "todo",
      recommended_agent: "Agente MVP Specialist",
      recommended_tool: "ChatGPT",
      prompt_text: `Agisci come MVP Specialist. Per il progetto "${idea}": definisci l'MVP in 4 righe, l'ipotesi da verificare, il comportamento dell'utente che mi dirà se l'ipotesi è vera, e cosa NON deve esserci.`,
      expected_output: "Definizione MVP nel Workbook (sezione MVP).",
      checklist_items: ["Ipotesi scritta", "Comportamento osservabile definito", "Lista 'cosa non c'è'"],
    },
    {
      phase: "MVP",
      title: "Scegli le funzioni must-have (max 5)",
      description: "Classifica ogni funzione possibile in must-have / nice-to-have / future. Tieni ≤5 must-have.",
      status: "todo",
      recommended_agent: "Agente MVP Specialist",
      recommended_tool: "ChatGPT",
      prompt_text: `Classifica le funzioni possibili di "${idea}" in must-have / nice-to-have / future. Max 5 must-have, ognuna giustificata rispetto all'ipotesi MVP.`,
      expected_output: "Tabella funzioni nel Workbook + lista must-have ≤5.",
      checklist_items: ["≤5 must-have", "Ogni must-have giustificata"],
    },
    {
      phase: "Schermate e flussi",
      title: "Definisci le schermate principali",
      description: "Elenca le schermate dell'MVP e cosa succede in ognuna.",
      status: "todo",
      recommended_agent: "Agente UX/UI Designer",
      recommended_tool: "ChatGPT",
      prompt_text: `Agisci come UX Designer. Elenca le schermate principali dell'MVP "${idea}" (max 6). Per ognuna: nome, scopo, elementi chiave, azione principale dell'utente.`,
      expected_output: "Lista schermate con scopo e azione principale.",
      checklist_items: ["≤6 schermate", "Ogni schermata ha un'unica azione principale"],
    },
    {
      phase: "Schermate e flussi",
      title: "Disegna il flusso utente principale",
      description: "Scrivi il percorso end-to-end del primo utente: dall'apertura al risultato.",
      status: "todo",
      recommended_agent: "Agente UX/UI Designer",
      recommended_tool: "ChatGPT",
      prompt_text: `Scrivi il flusso utente principale di "${idea}" in 5–8 step numerati: dal primo accesso al risultato finale.`,
      expected_output: "Flusso utente numerato nel Workbook (Schermate).",
      checklist_items: ["5–8 step", "Inizia con primo accesso", "Finisce con risultato concreto"],
    },
    {
      phase: "Database e dati",
      title: "Definisci i dati da salvare",
      description: "Identifica le tabelle/entità principali del progetto e i loro campi essenziali.",
      status: "todo",
      recommended_agent: "Agente Database Architect",
      recommended_tool: "ChatGPT",
      prompt_text: `Agisci come Database Architect. Per "${idea}", definisci 3–6 entità principali con i campi essenziali e le relazioni. Niente over-engineering.`,
      expected_output: "Lista entità + campi nel Workbook (Database).",
      checklist_items: ["3–6 entità", "Relazioni base definite"],
    },
    {
      phase: "Costruzione con Lovable",
      title: "Scrivi il prompt master per Lovable",
      description: "Prepara il prompt iniziale completo da incollare in Lovable per generare la prima versione.",
      status: "todo",
      recommended_agent: "Agente Builder",
      recommended_tool: "Lovable",
      prompt_text: `Crea il prompt master per Lovable che costruisca la prima versione di "${idea}". Includi: schermate, dati, ruoli utente, stile visivo (dark premium).`,
      expected_output: "Prompt master copiato in Lovable.",
      checklist_items: ["Prompt include schermate", "Prompt include dati", "Prompt incollato in Lovable"],
    },
    {
      phase: "Costruzione con Lovable",
      title: "Costruisci la prima schermata funzionante",
      description: "Genera con Lovable la schermata principale dell'MVP e verifica che si apra.",
      status: "todo",
      recommended_agent: "Agente Builder",
      recommended_tool: "Lovable",
      prompt_text: `In Lovable: costruisci la schermata principale di "${idea}" con i dati definiti. Mostra preview funzionante.`,
      expected_output: "Schermata principale visibile in preview Lovable.",
      checklist_items: ["Preview si apre", "Dati visibili", "Nessun errore bloccante"],
    },
    {
      phase: "Backend e sicurezza",
      title: "Abilita database e autenticazione",
      description: "Configura Supabase (database + auth) e RLS per i dati utente.",
      status: "todo",
      recommended_agent: "Agente Backend",
      recommended_tool: "Supabase",
      prompt_text: `Configura per "${idea}": tabelle, RLS scoped a auth.uid(), login email/password o Google. Niente policy "TO anon" sui dati utente.`,
      expected_output: "Tabelle + RLS + auth funzionanti.",
      checklist_items: ["Tabelle create", "RLS attiva", "Login funziona"],
    },
    {
      phase: "Test e bug",
      title: "Test del flusso principale con un utente reale",
      description: "Fai usare l'app a una persona non tecnica e annota dove si blocca.",
      status: "todo",
      recommended_agent: "Agente QA",
      recommended_tool: "ChatGPT",
      prompt_text: `Crea uno script di test per "${idea}" da far seguire a un tester non tecnico: 5–7 task brevi + cosa osservare.`,
      expected_output: "Lista bug/frizioni + priorità.",
      checklist_items: ["≥1 tester reale", "Bug raccolti", "Top 3 frizioni identificate"],
    },
    {
      phase: "Test e bug",
      title: "Correggi i 3 bug più gravi",
      description: "Risolvi solo i bug bloccanti dell'MVP. Rimanda il resto.",
      status: "todo",
      recommended_agent: "Agente Debug",
      recommended_tool: "Lovable",
      prompt_text: `Per ognuno dei 3 bug bloccanti di "${idea}", proponi diagnosi + correzione minima in Lovable.`,
      expected_output: "3 bug bloccanti chiusi.",
      checklist_items: ["Bug 1 chiuso", "Bug 2 chiuso", "Bug 3 chiuso"],
    },
    {
      phase: "Grafica e presentazione",
      title: "Rifinisci tipografia, colori e spaziature",
      description: "Allinea look & feel al brand: tipografia coerente, contrasti corretti, spaziature ordinate.",
      status: "todo",
      recommended_agent: "Agente UX/UI Designer",
      recommended_tool: "Lovable",
      prompt_text: `Rifinisci l'UI di "${idea}": tipografia, colori, spaziature. Mantieni stile dark premium e accessibilità.`,
      expected_output: "Schermate visivamente coerenti.",
      checklist_items: ["Tipografia coerente", "Contrasti accessibili", "Spaziature uniformi"],
    },
    {
      phase: "Demo e lancio beta",
      title: "Prepara la demo (video o link)",
      description: "Crea una demo da 60–90 secondi che mostri il valore dell'MVP.",
      status: "todo",
      recommended_agent: "Agente Marketing",
      recommended_tool: "Runway",
      prompt_text: `Crea lo script di una demo video da 60–90s per "${idea}": problema → soluzione in app → risultato.`,
      expected_output: "Demo video o link condivisibile nel Workbook (Materiali lancio).",
      checklist_items: ["Script scritto", "Demo registrata o pubblicata", "Link salvato"],
    },
    {
      phase: "Demo e lancio beta",
      title: "Invita i primi 5–10 utenti beta",
      description: "Manda l'accesso ai primi tester della nicchia scelta e raccogli feedback.",
      status: "todo",
      recommended_agent: "Agente Validatore",
      recommended_tool: "ChatGPT",
      prompt_text: `Scrivi 3 messaggi (email, LinkedIn, WhatsApp) per invitare i primi tester di "${idea}". Tono diretto, niente hype.`,
      expected_output: "5–10 tester invitati, feedback raccolto.",
      checklist_items: ["≥5 invitati", "≥3 feedback raccolti"],
    },
  ];

  return defs.map((d, i) => {
    const phase = (d.phase as AppRoadmapPhase) ?? "MVP";
    return {
      ...d,
      order_index: i,
      priority: i,
      progress_weight: PHASE_WEIGHT[phase] ?? 1,
    };
  });
}
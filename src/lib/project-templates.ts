export const PRODUCT_TYPES = [
  "Web app",
  "Landing page",
  "Gestionale",
  "Marketplace",
  "CRM",
  "App interna",
  "Altro",
] as const;

export const URGENCY_OPTIONS = [
  { value: "low", label: "Bassa — esploro" },
  { value: "medium", label: "Media — entro qualche settimana" },
  { value: "high", label: "Alta — il prima possibile" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzato" },
] as const;

export const PROMPT_CATEGORIES = [
  "Strategia",
  "Ricerca mercato",
  "Progettazione app",
  "Lovable",
  "Antigravity",
  "Supabase",
  "Debug",
  "Grafica",
  "Marketing",
  "Lancio",
] as const;

export const ROADMAP_TEMPLATE = [
  { title: "Idea chiarita", description: "Hai descritto il problema, il target e il risultato atteso." },
  { title: "Prima versione dell'app (MVP) definita", description: "Hai stabilito cosa entra nella prima versione funzionante della tua app e cosa no." },
  { title: "Schermate definite", description: "Lista delle schermate principali e dei flussi utente." },
  { title: "Database definito", description: "Quali entità servono e che relazioni hanno." },
  { title: "Prompt per Lovable creato", description: "Prompt operativo per generare la prima versione." },
  { title: "Prima versione generata", description: "Output iniziale prodotto dall'AI." },
  { title: "Test completato", description: "Hai testato i flussi principali con utenti veri o simulati." },
  { title: "Bug corretti", description: "Errori e attriti risolti." },
  { title: "Demo pronta", description: "Versione presentabile pronta per essere mostrata." },
  { title: "Lancio beta", description: "Apertura ai primi utenti reali." },
];

import { STRATEGIST_AGENT_SYSTEM_PROMPT } from "@/prompts/strategistAgentSystemPrompt";

export const AGENT_TEMPLATE = (idea: string) => [
  {
    name: "Agente Stratega",
    role: "Chiarisce la visione e il posizionamento del progetto.",
    when_to_use: "All'inizio, quando l'idea è ancora grezza e poco focalizzata.",
    expected_output: "Posizionamento, target, value proposition in una pagina sintetica.",
    prompt_text: `${STRATEGIST_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA DEL PROGETTO DA ANALIZZARE:\n"${idea}"\n\nApplica il METODO DI ANALISI e rispondi con il FORMATO RISPOSTA STANDARD (10 sezioni) seguito da OUTPUT PER PROJECT MANAGER.`,
  },
  {
    name: "Agente Product Manager",
    role: "Trasforma la visione nella prima versione dell'app (MVP), costruibile davvero.",
    when_to_use: "Dopo che la strategia è chiara, prima del design.",
    expected_output: "Lista funzioni essenziali della prima versione, cosa rimandare, criteri di successo.",
    prompt_text: `Sei un product manager. Partendo dall'idea: "${idea}", produci:\n- 5 funzioni essenziali per la prima versione dell'app (MVP).\n- 5 funzioni da NON costruire ora.\n- 3 metriche per capire se la prima versione funziona.\n- User story principale in formato "Come ... voglio ... per ...".`,
  },
  {
    name: "Agente UX/UI Designer",
    role: "Disegna le schermate e i flussi utente.",
    when_to_use: "Quando le funzioni sono definite e serve la struttura visiva.",
    expected_output: "Lista schermate, gerarchia informativa, stile visivo.",
    prompt_text: `Sei un designer UX/UI. Per l'idea "${idea}", definisci:\n- Lista delle schermate necessarie (max 6).\n- Per ogni schermata: scopo, elementi chiave, call to action principale.\n- Stile visivo consigliato (mood, colori, font).\n- Flusso utente principale in 5 step.`,
  },
  {
    name: "Agente Prompt Engineer",
    role: "Crea il prompt operativo per Lovable / no-code.",
    when_to_use: "Quando hai schermate e funzioni e devi generare la prima versione.",
    expected_output: "Prompt pronto da incollare in Lovable.",
    prompt_text: `Sei un prompt engineer specializzato in Lovable. Genera un prompt completo per costruire la prima versione dell'app "${idea}". Includi: scopo, pagine, componenti, schema database, autenticazione, stile visivo e regole importanti (cosa NON fare). Scrivilo in italiano, chiaro e operativo.`,
  },
  {
    name: "Agente Tester",
    role: "Verifica che la prima versione dell'app faccia davvero quello che promette.",
    when_to_use: "Dopo la generazione della prima versione.",
    expected_output: "Checklist di test + lista bug prioritari.",
    prompt_text: `Sei un QA tester. Data l'app "${idea}", scrivi:\n- 10 test funzionali su flussi reali.\n- 5 test su casi limite.\n- Una checklist di accessibilità e responsive.\n- Formato bug: [Gravità] [Schermata] Descrizione - passi per riprodurre.`,
  },
  {
    name: "Agente Marketing",
    role: "Costruisce il messaggio per il lancio.",
    when_to_use: "Quando la demo è pronta e vuoi attirare i primi utenti.",
    expected_output: "Headline, sottotitolo, 3 angoli di comunicazione, prima campagna.",
    prompt_text: `Sei un copywriter di marketing. Per l'app "${idea}", produci:\n- Headline forte (max 9 parole).\n- Sottotitolo descrittivo.\n- 3 angoli di comunicazione diversi.\n- Bozza di un post LinkedIn per il lancio.\n- 5 obiezioni tipiche e come rispondere.`,
  },
  {
    name: "Agente Documentazione",
    role: "Scrive guida utente e documentazione interna.",
    when_to_use: "Prima del lancio beta, per non lasciare gli utenti soli.",
    expected_output: "Mini-guida, FAQ, onboarding email.",
    prompt_text: `Sei un technical writer. Per l'app "${idea}", scrivi:\n- Guida rapida in 5 step per il primo utilizzo.\n- 8 FAQ (domanda + risposta breve).\n- Sequenza onboarding di 3 email (oggetto + corpo).\nLinguaggio semplice, niente gergo tecnico.`,
  },
];

export const ANALYSIS_TEMPLATE = (project: {
  idea_description?: string | null;
  target?: string | null;
  problem?: string | null;
  solution?: string | null;
  product_type?: string | null;
}) => ({
  target_users: project.target || "Imprenditori, professionisti e creator che vogliono validare un'idea velocemente.",
  main_problem: project.problem || "Hanno un'intuizione ma non sanno come trasformarla in qualcosa di costruibile.",
  proposed_solution:
    project.solution ||
    "Una scheda chiara del progetto + agenti AI consigliati + prompt operativi + roadmap step-by-step.",
  main_features: [
    "Registrazione e autenticazione utente",
    "Creazione progetto con form guidato",
    "Scheda progetto strutturata",
    "Libreria di prompt copia-incolla",
    "Roadmap operativa con stati",
  ],
  required_screens: [
    "Home pubblica",
    "Dashboard utente",
    "Form nuovo progetto",
    "Scheda progetto",
    "Squadra agenti",
    "Libreria prompt",
    "Roadmap progetto",
  ],
  data_to_save: [
    "Profilo utente",
    "Progetti",
    "Analisi progetto",
    "Agenti consigliati",
    "Prompt operativi",
    "Stato roadmap",
  ],
  risks: [
    "Utenti che si aspettano l'AI faccia tutto da sola",
    "Scope troppo grande nella prima versione",
    "Mancanza di esempi concreti che ispirino",
  ],
  mvp_version: `Prima versione dell'idea "${project.idea_description ?? "il tuo progetto"}" come ${project.product_type ?? "web app"} minimale: form di input, scheda chiara, agenti consigliati, prompt pronti, roadmap.`,
  not_to_build_now: [
    "Pagamenti",
    "Community / forum",
    "Mobile app nativa",
    "Agenti AI autonomi reali",
    "Marketplace",
  ],
});

export const PROMPT_LIBRARY_SEED = [
  {
    category: "Strategia",
    title: "Chiarisci la tua idea in 5 righe",
    recommended_tool: "ChatGPT / Claude",
    prompt_text:
      "Aiutami a chiarire questa idea: [descrivi]. Restituisci in 5 righe: 1) cosa fa, 2) per chi, 3) problema che risolve, 4) perché ora, 5) cosa NON è.",
  },
  {
    category: "Ricerca mercato",
    title: "Trova 5 concorrenti e differenziazione",
    recommended_tool: "Perplexity",
    prompt_text:
      "Cerca 5 prodotti simili a [idea]. Per ognuno: nome, sito, target, prezzo, punto debole. Poi suggerisci 3 modi in cui possiamo differenziarci.",
  },
  {
    category: "Progettazione app",
    title: "Definisci la prima versione dell'app e le schermate",
    recommended_tool: "ChatGPT",
    prompt_text:
      "Per l'app [idea]: lista 5 funzioni essenziali della prima versione dell'app (MVP), 5 funzioni da rimandare, 5 schermate principali con scopo e CTA.",
  },
  {
    category: "Lovable",
    title: "Prompt iniziale per generare la prima versione",
    recommended_tool: "Lovable",
    prompt_text:
      "Crea una web app chiamata [nome]. Obiettivo: [obiettivo]. Pagine: [lista]. Stile: moderno premium dark. Database: [tabelle]. Auth: email + Google. Regole: niente pagamenti, niente mobile, prima versione (MVP) semplice e ordinata.",
  },
  {
    category: "Antigravity",
    title: "Briefing per un agente Antigravity",
    recommended_tool: "Antigravity",
    prompt_text:
      "Agisci come orchestratore. Obiettivo: [obiettivo del progetto]. Suddividi in sotto-task con responsabile, output atteso e criterio di completamento. Restituisci una tabella.",
  },
  {
    category: "Supabase",
    title: "Schema database da idea",
    recommended_tool: "Lovable / Claude",
    prompt_text:
      "Per l'app [idea], proponi schema Postgres con tabelle, colonne, tipi e relazioni. Aggiungi policy RLS pensando che ogni utente vede solo i propri dati.",
  },
  {
    category: "Debug",
    title: "Diagnosi errore in 3 passi",
    recommended_tool: "Lovable chat",
    prompt_text:
      "Ho questo errore: [incolla]. 1) Spiegamelo in linguaggio semplice. 2) Indica la causa più probabile. 3) Dammi la patch minima per risolverlo.",
  },
  {
    category: "Grafica",
    title: "Genera hero image per landing",
    recommended_tool: "Midjourney / Nano Banana",
    prompt_text:
      "Hero image cinematica per [idea]: stile dark indigo/violet, luci morbide, look AI premium, composizione orizzontale 16:9, niente testo.",
  },
  {
    category: "Marketing",
    title: "Post LinkedIn di lancio",
    recommended_tool: "ChatGPT",
    prompt_text:
      "Scrivi un post LinkedIn per lanciare [idea]. Tono: pratico, non hype. Inizia con un problema reale. Mostra la soluzione. Chiudi con una CTA chiara per provarla.",
  },
  {
    category: "Lancio",
    title: "Checklist lancio beta",
    recommended_tool: "Notion / Lovable",
    prompt_text:
      "Dammi una checklist operativa per lanciare la beta di [idea] in 7 giorni: tecnica, comunicazione, supporto utenti, raccolta feedback.",
  },
];

export const METHOD_STEPS = [
  {
    key: "idea",
    title: "Idea",
    description:
      "Parti da una frase chiara: cosa vuoi creare, per chi e perché ha senso adesso. Niente PowerPoint, solo onestà.",
  },
  {
    key: "diagnosi",
    title: "Diagnosi",
    description:
      "Verifica il problema reale, il target e quanto è urgente. Se non c'è dolore, non c'è prodotto.",
  },
  {
    key: "architettura",
    title: "Architettura",
    description:
      "Definisci schermate, funzioni essenziali della prima versione dell'app e dati da salvare. Tutto il resto va nella lista 'non ora'.",
  },
  {
    key: "prompt",
    title: "Prompt",
    description:
      "Trasforma il progetto in un prompt operativo, chiaro e ripetibile. È il ponte tra idea e codice.",
  },
  {
    key: "costruzione",
    title: "Costruzione",
    description:
      "Generi la prima versione con strumenti no-code/AI. Tu sei il regista, gli agenti sono la squadra.",
  },
  {
    key: "test",
    title: "Test",
    description:
      "Provala tu, poi falla provare ad altri. Cerca attriti, non complimenti.",
  },
  {
    key: "miglioramento",
    title: "Miglioramento",
    description:
      "Correggi bug, semplifica, taglia ciò che non serve. Meno feature, più impatto.",
  },
  {
    key: "lancio",
    title: "Lancio",
    description:
      "Apri ai primi utenti reali, raccogli feedback strutturato e itera. Il lancio è l'inizio, non la fine.",
  },
];
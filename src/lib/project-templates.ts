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
import { VALIDATOR_AGENT_SYSTEM_PROMPT } from "@/prompts/validatorAgentSystemPrompt";
import { RESEARCHER_AGENT_SYSTEM_PROMPT } from "@/prompts/researcherAgentSystemPrompt";
import { VALIDATING_AGENT_SYSTEM_PROMPT } from "@/prompts/validatingAgentSystemPrompt";
import { MVP_AGENT_SYSTEM_PROMPT } from "@/prompts/mvpAgentSystemPrompt";
import { UX_AGENT_SYSTEM_PROMPT } from "@/prompts/uxAgentSystemPrompt";
import { INSTRUCTOR_AGENT_SYSTEM_PROMPT } from "@/prompts/instructorAgentSystemPrompt";
import { BUILDER_AGENT_SYSTEM_PROMPT } from "@/prompts/builderAgentSystemPrompt";
import { SECURITY_AGENT_SYSTEM_PROMPT } from "@/prompts/securityAgentSystemPrompt";
import { QA_AGENT_SYSTEM_PROMPT } from "@/prompts/qaAgentSystemPrompt";
import { DEBUGGER_AGENT_SYSTEM_PROMPT } from "@/prompts/debuggerAgentSystemPrompt";
import { LAUNCH_AGENT_SYSTEM_PROMPT } from "@/prompts/launchAgentSystemPrompt";

export const AGENT_TEMPLATE = (idea: string) => [
  {
    name: "Agente Stratega",
    role: "Chiarisce la visione e il posizionamento del progetto.",
    when_to_use: "All'inizio, quando l'idea è ancora grezza e poco focalizzata.",
    expected_output: "Posizionamento, target, value proposition in una pagina sintetica.",
    prompt_text: `${STRATEGIST_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA DEL PROGETTO DA ANALIZZARE:\n"${idea}"\n\nApplica il METODO DI ANALISI e rispondi con il FORMATO RISPOSTA STANDARD (10 sezioni) seguito da OUTPUT PER PROJECT MANAGER.`,
  },
  {
    name: "Agente Validatore",
    role: "Mette alla prova l'idea prima della costruzione: rischi, assunzioni, punti deboli.",
    when_to_use: "Subito dopo lo Stratega, prima di definire l'MVP e iniziare a costruire.",
    expected_output: "Validazione strutturata con verdetto operativo e indicazione se si può avanzare all'MVP.",
    prompt_text: `${VALIDATOR_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA DEL PROGETTO DA VALIDARE:\n"${idea}"\n\nApplica il METODO DI VALIDAZIONE e rispondi con il FORMATO RISPOSTA STANDARD (9 sezioni) seguito da OUTPUT PER PROJECT MANAGER. Se manca una direzione strategica approvata, dichiara che si tratta di una validazione preliminare.`,
  },
  {
    name: "Agente Ricercatore",
    role: "Analizza mercato, target, competitor e rischi per preparare il terreno agli altri agenti.",
    when_to_use: "Quando serve capire settore, alternative esistenti, ipotesi da verificare e dati mancanti prima di costruire.",
    expected_output: "Analisi strutturata in 12 sezioni con brief di ricerca finale per Stratega, Project Manager, Validatore e Agente Tecnico.",
    prompt_text: `${RESEARCHER_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA DEL PROGETTO DA ANALIZZARE:\n"${idea}"\n\nClassifica prima il tipo di progetto, poi adatta l'analisi e rispondi con il FORMATO RISPOSTA STANDARD (12 sezioni in markdown) chiudendo con il BRIEF DI RICERCA PER GLI ALTRI AGENTI. Se non hai accesso a fonti aggiornate, dichiaralo e marca i dati come "Dato da verificare", "Stima indicativa" o "Inferenza logica".`,
  },
  {
    name: "Agente Validante",
    role: "Mette alla prova problema, target pagante, modello economico, prezzo, domanda, MVP e decide GO / NO GO.",
    when_to_use: "Prima di investire tempo o budget nello sviluppo: per capire se l'idea regge davvero o se va testata prima.",
    expected_output: "Analisi strutturata in 12 sezioni con decisione di validazione e brief operativo per gli altri agenti.",
    prompt_text: `${VALIDATING_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA DEL PROGETTO DA VALIDARE:\n"${idea}"\n\nClassifica prima la categoria del progetto, poi adatta la validazione e rispondi con il FORMATO RISPOSTA STANDARD (12 sezioni in markdown) chiudendo con il BRIEF DI VALIDAZIONE PER GLI ALTRI AGENTI. Dichiara esplicitamente la decisione di validazione (es. PRONTO PER MVP, NON ANCORA VALIDATO, DA TESTARE SUBITO).`,
  },
  {
    name: "Agente Product Manager",
    role: "Riduce l'idea alla prima versione minima costruibile e testabile (MVP).",
    when_to_use: "Dopo strategia e validazione, prima del design e della costruzione: per decidere cosa entra nell'MVP e cosa no.",
    expected_output: "Analisi strutturata in 16 sezioni con MVP consigliato, criterio di successo e brief operativo per gli altri agenti.",
    prompt_text: `${MVP_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA DEL PROGETTO DA RIDURRE A MVP:\n"${idea}"\n\nClassifica prima la categoria del progetto, poi adatta l'MVP e rispondi con il FORMATO RISPOSTA STANDARD (16 sezioni in markdown) chiudendo con il BRIEF MVP PER GLI ALTRI AGENTI. Etichetta esplicitamente le funzioni come "Funzione core", "Da rimandare", "Rischio complessità" o "Non necessario nell'MVP". Se l'utente chiede se partire con lo sviluppo, dichiara MVP PRONTO / TROPPO GRANDE / DA RIDURRE / NON ANCORA CHIARO / COSTRUIBILE / DA VALIDARE PRIMA.`,
  },
  {
    name: "Agente UX/UI Designer",
    role: "Progetta l'esperienza utente: flussi, schermate, CTA, stati UX e mobile first.",
    when_to_use: "Dopo che le funzioni dell'MVP sono definite, prima della costruzione: per ridurre attriti e rendere i percorsi semplici.",
    expected_output: "Analisi strutturata in 18 sezioni con flusso minimo, schermate, attriti, stati UX e brief operativo per gli altri agenti.",
    prompt_text: `${UX_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA DEL PROGETTO DA PROGETTARE LATO UX:\n"${idea}"\n\nClassifica prima la categoria del progetto, poi adatta l'analisi e rispondi con il FORMATO RISPOSTA STANDARD (18 sezioni in markdown) chiudendo con il BRIEF UX PER GLI ALTRI AGENTI. Etichetta esplicitamente i problemi come "Rischio confusione", "CTA da riscrivere", "Flusso da semplificare" o "Rischio abbandono". Se l'utente chiede se la UX è pronta, dichiara UX PRONTA / DA SEMPLIFICARE / CONFUSA / TROPPO COMPLESSA / BUONA MA DA TESTARE / NON ANCORA PRONTA.`,
  },
  {
    name: "Agente Istruttore",
    role: "Trasforma decisioni, brief e richieste in prompt operativi pronti per Lovable, Antigravity e sviluppatori.",
    when_to_use: "Quando hai bisogno di un prompt chiaro e copiabile per costruire, correggere bug, aggiungere funzioni o controllare qualità senza ambiguità.",
    expected_output: "Prompt operativo in blocco copiabile con contesto, obiettivo, intervento, regole, cosa non modificare, controllo qualità e risultato atteso.",
    prompt_text: `${INSTRUCTOR_AGENT_SYSTEM_PROMPT}\n\n---\nRICHIESTA DELL'UTENTE DA TRASFORMARE IN ISTRUZIONI OPERATIVE:\n"${idea}"\n\nSegui il METODO DI LAVORO e rispondi nel FORMATO RISPOSTA STANDARD (blocco \`\`\`txt copiabile). Proteggi sempre routing, login, database, permessi, layout esistente e funzioni già funzionanti. Se la richiesta è troppo ampia, dichiara che va divisa in più prompt.`,
  },
  {
    name: "Agente Costruttore",
    role: "Costruisce e modifica funzioni, schermate e integrazioni rispettando UX, dati, permessi e funzioni esistenti.",
    when_to_use: "Quando hai brief, prompt o decisioni operative e devi tradurli in costruzione concreta, stabile e non distruttiva.",
    expected_output: "Analisi strutturata in 10 sezioni con piano di implementazione, controlli responsive, anti-regressione e brief costruzione per gli altri agenti.",
    prompt_text: `${BUILDER_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA / RICHIESTA DI COSTRUZIONE:\n"${idea}"\n\nClassifica prima la categoria del progetto, applica la modifica minima necessaria e rispondi con il FORMATO RISPOSTA STANDARD (10 sezioni in markdown) chiudendo con il BRIEF COSTRUZIONE PER GLI ALTRI AGENTI. Se l'utente chiede se la costruzione è pronta, dichiara COSTRUZIONE PRONTA / DA TESTARE / INCOMPLETA / TROPPO AMPIA / RISCHIO REGRESSIONE / DA PASSARE AL CONTROLLO QUALITÀ / DA PASSARE ALL'AGENTE SICUREZZA.`,
  },
  {
    name: "Agente Sicurezza",
    role: "Protegge dati, ruoli, permessi, database, storage, pagamenti e comunicazioni sensibili.",
    when_to_use: "Prima della pubblicazione e ogni volta che una funzione tocca dati privati, ruoli, pagamenti, file, chat o aree admin.",
    expected_output: "Analisi strutturata in 16 sezioni con verdetto GO / NO GO sicurezza e brief operativo per Costruttore, Architetto Dati, Debugger e Controllo Qualità.",
    prompt_text: `${SECURITY_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA / PROGETTO / FUNZIONE DA ANALIZZARE LATO SICUREZZA:\n"${idea}"\n\nClassifica prima la categoria del progetto, poi adatta l'analisi e rispondi con il FORMATO RISPOSTA STANDARD (16 sezioni in markdown) chiudendo con il BRIEF SICUREZZA PER GLI ALTRI AGENTI. Usa etichette esplicite (DATO PRIVATO, DATO SENSIBILE, TABELLA DA PROTEGGERE, RISCHIO PERMESSI, PROTEZIONE INSUFFICIENTE, CONTROLLO LATO DATABASE NECESSARIO) e, se l'utente chiede se è sicuro pubblicare, dichiara SICUREZZA OK / DA TESTARE / RISCHIO MEDIO / RISCHIO ALTO / NON PUBBLICARE ANCORA / PERMESSI DA CORREGGERE / DATI SENSIBILI ESPOSTI / CONTROLLO DATABASE NECESSARIO.`,
  },
  {
    name: "Agente Controllo Qualità",
    role: "Controlla che funzioni, modifiche e bug fix siano davvero pronti: funzionali, responsive, sicuri, senza regressioni.",
    when_to_use: "Dopo ogni costruzione o bug fix e prima di passare allo step successivo o al lancio.",
    expected_output: "Analisi strutturata in 12 sezioni con classificazione problemi, decisione finale QA e brief operativo per Debugger, Costruttore e Agente Sicurezza.",
    prompt_text: `${QA_AGENT_SYSTEM_PROMPT}\n\n---\nIDEA / FUNZIONE / MODIFICA DA CONTROLLARE:\n"${idea}"\n\nClassifica prima la categoria del progetto, poi adatta i controlli e rispondi con il FORMATO RISPOSTA STANDARD (12 sezioni in markdown) chiudendo con il BRIEF CONTROLLO QUALITÀ PER GLI ALTRI AGENTI. Classifica ogni problema come BLOCCANTE / ALTO / MEDIO / BASSO / MIGLIORIA e chiudi con una decisione esplicita: APPROVATO / APPROVATO CON RISERVE / DA CORREGGERE / DA PASSARE AL DEBUGGER / DA PASSARE ALL'AGENTE SICUREZZA / NON PRONTO / BLOCCATO.`,
  },
  {
    name: "Agente Debugger",
    role: "Trova la causa reale di bug, regressioni e malfunzionamenti e propone correzioni stabili.",
    when_to_use: "Quando qualcosa non funziona, un fix precedente non ha tenuto, ci sono duplicati, dati appesi, errori dopo refresh/login o regressioni dopo una modifica.",
    expected_output: "Analisi strutturata in 11 sezioni con cause probabili, correzione strutturale, prevenzione ricorrenza, test obbligatori e brief debug per gli altri agenti.",
    prompt_text: `${DEBUGGER_AGENT_SYSTEM_PROMPT}\n\n---\nBUG / MALFUNZIONAMENTO DA ANALIZZARE:\n"${idea}"\n\nClassifica prima la categoria del progetto, poi adatta il debug e rispondi con il FORMATO RISPOSTA STANDARD (11 sezioni in markdown) chiudendo con il BRIEF DEBUG PER GLI ALTRI AGENTI. Usa etichette esplicite (BUG BLOCCANTE / CONTROLLO DATABASE NECESSARIO / CONTROLLO PERMESSI NECESSARIO / RISCHIO DUPLICATI / BUG VISIVO / CAUSA DA VERIFICARE) e, se l'utente chiede se il bug è risolto, dichiara BUG RISOLTO / NON RISOLTO / PARZIALMENTE RISOLTO / SERVE CONTROLLO DATABASE / PERMESSI / QUALITÀ / TEST MOBILE / RISCHIO REGRESSIONE.`,
  },
  {
    name: "Agente di Lancio",
    role: "Prepara il progetto al lancio: tipo di lancio, target, offerta, messaggio, canali, funnel, checklist e metriche.",
    when_to_use: "Quando il progetto è vicino al pronto e vuoi decidere se e come lanciarlo (beta, soft launch, lancio pubblico) senza bruciare fiducia e budget.",
    expected_output: "Analisi strutturata in 18 sezioni con piano 7/14/30 giorni, checklist tecnica/commerciale/marketing/operativa, metriche, rischi e decisione GO / NO GO.",
    prompt_text: `${LAUNCH_AGENT_SYSTEM_PROMPT}\n\n---\nPROGETTO DA PREPARARE AL LANCIO:\n"${idea}"\n\nClassifica prima la categoria del progetto, poi adatta il piano di lancio e rispondi con il FORMATO RISPOSTA STANDARD (18 sezioni in markdown) chiudendo con il BRIEF LANCIO PER GLI ALTRI AGENTI. Usa etichette esplicite (SOFT LAUNCH O BETA CONSIGLIATA / PRIMA CONTROLLO QUALITÀ / PRIMA DEBUG / PRIMA CONTROLLO SICUREZZA / OFFERTA NON ANCORA PRONTA) e chiudi con decisione GO / GO CON RISERVE / SOFT LAUNCH CONSIGLIATO / SOLO BETA CHIUSA / NO GO TEMPORANEO / NON LANCIARE / PRIMA QA / PRIMA DEBUG / PRIMA SICUREZZA / PRIMA VALIDAZIONE OFFERTA, indicando motivo, rischio principale, cosa fare prima e quando rivalutare.`,
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
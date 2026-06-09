import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "it" | "en";

const STORAGE_KEY = "ideapilot_locale";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "it";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "it" || saved === "en") return saved;
  } catch {
    // ignore
  }
  const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
  return nav.toLowerCase().startsWith("it") ? "it" : "en";
}

type Dict = Record<string, string>;

const it: Dict = {
  // Brand
  "brand.full": "IdeaPilot IA",
  "brand.ai": "IA",
  "brand.tagline": "Dalla tua idea alla tua prima app",

  // Nav
  "nav.home": "Home",
  "nav.tools": "Strumenti",
  "nav.agents": "Agenti",
  "nav.pricing": "Prezzi",
  "nav.dashboard": "Dashboard",
  "nav.signIn": "Accedi",
  "nav.start": "Inizia ora",
  "nav.signOut": "Esci",
  "nav.activate": "Attiva Team IA - 29€",
  "nav.projectManager": "Parla con il Project Manager",
  "nav.projectManagerShort": "Project Manager",

  // Language switcher
  "lang.label": "Lingua",

  // Home / Hero
  "home.badge": "Metodo IA per non tecnici",
  "home.hero.eyebrow": "Validazione idee app — gratis, in ~10 secondi",
  "home.hero.title": "Scopri se la tua idea può diventare un progetto reale, prima di spendere soldi.",
  "home.hero.subtitle":
    "Descrivi la tua idea in una frase: IdeaPilot IA stima ore, costi, budget e potenziale economico, e ti dice cosa puoi costruire davvero — senza agenzie e senza buttare via mesi.",
  "home.cta.primary": "Analizza gratis la mia idea",
  "home.cta.secondary": "Guarda un esempio di report",
  "home.hero.note": "Gratis, senza registrazione. Prima analisi in circa 10 secondi.",

  // Home — steps
  "home.steps.eyebrow": "Come funziona",
  "home.steps.title": "Dall'idea alla prima versione dell'app in 4 passi",
  "home.steps.1.title": "1. Inserisci la tua idea",
  "home.steps.1.desc": "Rispondi a poche domande guidate: cosa fai, per chi, quale problema risolvi.",
  "home.steps.2.title": "2. Ottieni il progetto strutturato",
  "home.steps.2.desc": "Una scheda chiara: target, prima versione dell'app (MVP), schermate, dati, rischi e cosa non costruire.",
  "home.steps.3.title": "3. Agenti IA e prompt pronti",
  "home.steps.3.desc": "Una squadra di agenti IA consigliati e prompt operativi da copiare e usare.",
  "home.steps.4.title": "4. Costruisci la prima versione della tua app",
  "home.steps.4.desc": "Segui la roadmap passo passo e realizza la prima versione funzionante con strumenti no-code.",

  // Home — method
  "home.method.eyebrow": "Il metodo",
  "home.method.title": "Il metodo in dettaglio",
  "home.method.1.title": "1. Descrivi l'idea",
  "home.method.1.desc": "Rispondi a un form guidato: cosa fai, per chi, quale problema risolvi.",
  "home.method.2.title": "2. Ricevi una scheda chiara",
  "home.method.2.desc": "Target, soluzione, funzioni essenziali della prima versione, schermate, dati, rischi, cosa NON costruire.",
  "home.method.3.title": "3. Squadra agenti + prompt",
  "home.method.3.desc": "7 agenti IA consigliati, ognuno con prompt pronti da copiare nei tuoi strumenti.",

  // Home — advantages
  "home.adv.eyebrow": "Vantaggi",
  "home.adv.title": "Perché funziona",
  "home.adv.1.title": "Focus chiaro",
  "home.adv.1.desc": "Prima versione dell'app definita, niente progetti infiniti.",
  "home.adv.2.title": "Veloce",
  "home.adv.2.desc": "Dal foglio bianco alla scheda in 5 minuti.",
  "home.adv.3.title": "Niente codice",
  "home.adv.3.desc": "Pensato per chi non programma.",
  "home.adv.4.title": "Pronto a costruire",
  "home.adv.4.desc": "Prompt e roadmap operativa inclusi.",

  // Home — examples
  "home.ex.eyebrow": "Casi reali",
  "home.ex.title": "Esempi di progetti realizzabili",
  "home.ex.1.t": "Gestione appuntamenti",
  "home.ex.1.d": "Una web app semplice per ricevere e gestire appuntamenti senza perdere richieste.",
  "home.ex.2.t": "CRM mini per consulenti",
  "home.ex.2.d": "Schede cliente, note, follow-up. Solo l'essenziale.",
  "home.ex.3.t": "Landing per lanciare un servizio",
  "home.ex.3.d": "Pagina che spiega l'offerta e raccoglie contatti qualificati.",
  "home.ex.4.t": "Gestione clienti per freelance",
  "home.ex.4.d": "Schede cliente, attività e scadenze in un posto solo.",
  "home.ex.5.t": "App interna per il team",
  "home.ex.5.d": "Strumento su misura per un processo specifico del tuo studio.",
  "home.ex.6.t": "Marketplace di nicchia",
  "home.ex.6.d": "Una prima versione dell'app (MVP) per validare l'idea con utenti reali.",

  // Home — target
  "home.target.eyebrow": "Target",
  "home.target.title": "Per chi è",
  "home.target.role": "Imprenditori, consulenti, creator",
  "home.target.desc":
    "Hai un'intuizione, un servizio o un processo che vorresti digitalizzare ma non sai da dove iniziare. Tu resti il regista: gli agenti IA ti aiutano passo passo con struttura, prompt e roadmap per partire davvero.",
  "home.target.list.1": "Creator e solopreneur",
  "home.target.list.2": "Piccoli team e community",
  "home.target.list.3": "Freelance e studi professionali",
  "home.target.list.4": "Coach e formatori",
  "home.target.list.5": "Founder alla prima versione dell'app",

  // Home — cosa ricevi nel report
  "home.receive.eyebrow": "Cosa ricevi",
  // injected above; see below for proof keys
  "home.receive.title": "Cosa ricevi dal tuo primo report",
  "home.receive.subtitle": "Una prima analisi chiara per capire se la tua idea può diventare un progetto costruibile.",
  "home.receive.1.t": "Analisi dell'idea",
  "home.receive.1.d": "Capisci se l'idea è chiara, realistica e trasformabile in un primo progetto.",
  "home.receive.2.t": "Ore e difficoltà stimate",
  "home.receive.2.d": "Vedi quanto lavoro potrebbe servire per creare una prima versione funzionante.",
  "home.receive.3.t": "Budget consigliato",
  "home.receive.3.d": "Scopri quale fascia di budget è più coerente con quello che vuoi costruire.",
  "home.receive.4.t": "Potenziale economico stimato",
  "home.receive.4.d": "Ottieni una prima ipotesi prudente del possibile fatturato mensile.",
  "home.receive.5.t": "Funzioni da costruire ora",
  "home.receive.5.d": "Capisci cosa ha senso sviluppare subito e cosa rimandare.",
  "home.receive.6.t": "Roadmap e prossimi step",
  "home.receive.6.d": "Ricevi una direzione chiara per trasformare l'idea in un progetto operativo.",

  // Home — social proof (early access)
  "home.proof.eyebrow": "Community early access",
  "home.proof.title": "Già scelto da oltre 1.000 early user",
  "home.proof.subtitle": "Creator, freelance, imprenditori e founder stanno usando IdeaPilot IA per analizzare idee, generare report e trasformarle in progetti concreti.",
  "home.proof.earlyUsers.label": "Early user",
  "home.proof.earlyUsers.desc": "Utenti entrati nella prima fase della piattaforma.",
  "home.proof.ideasAnalyzed.label": "Idee analizzate",
  "home.proof.ideasAnalyzed.desc": "Idee inserite e valutate con il calcolatore intelligente.",
  "home.proof.reportsGenerated.label": "Report generati",
  "home.proof.reportsGenerated.desc": "Prime analisi operative create con ore, budget e potenziale.",
  "home.proof.projectsSaved.label": "Progetti salvati",
  "home.proof.projectsSaved.desc": "Report trasformati in progetti ritrovabili nella dashboard utente.",
  "home.proof.micro": "Dati aggregati della fase early access. Le stime economiche restano orientative e non garantiscono risultati.",

  // Home — casi studio dimostrativi
  "home.cases.eyebrow": "Esempi dimostrativi",
  "home.cases.title": "Esempi di app nate da un'idea",
  "home.cases.subtitle": "Alcuni scenari dimostrativi di come un'idea può diventare un progetto concreto, con potenziale economico, funzioni e primi step operativi.",
  "home.cases.micro": "Esempi dimostrativi: i risultati economici sono stime orientative e non garantite.",
  "home.cases.metric.users": "utenti potenziali",
  "home.cases.metric.leads": "lead potenziali/mese",
  "home.cases.metric.business": "attività potenziali",
  "home.cases.metric.features": "funzioni MVP consigliate",
  "home.cases.metric.hours": "ore stimate per la prima versione",
  "home.cases.metric.revenue": "Modello ricavo",
  "home.cases.potential": "potenziale economico stimato",
  "home.cases.cta": "Guarda esempio report",
  "home.cases.outro.title": "La prossima idea potrebbe essere la tua",
  "home.cases.outro.text": "Scrivi la tua idea e ricevi un primo report operativo con costi, ore, potenziale economico e funzioni da costruire.",
  "home.cases.outro.cta": "Analizza gratis la mia idea",
  "home.cases.outro.micro": "Il report completo verrà salvato nel tuo account dopo la registrazione gratuita.",

  // Home — report esempio (demo)
  "home.demo.eyebrow": "Report di esempio",
  "home.demo.title": "Guarda cosa riceverai nel tuo report",
  "home.demo.subtitle": "Un esempio concreto di analisi: idea, ore, costi, potenziale, funzioni consigliate e prossimi step.",
  "home.demo.cta": "Guarda report esempio",
  "home.demo.idea.label": "Idea analizzata",
  "home.demo.idea.text": "Piattaforma per aiutare freelance e piccoli team a gestire clienti, attività e scadenze in un unico posto.",
  "home.demo.hours": "Ore stimate",
  "home.demo.difficulty": "Difficoltà",
  "home.demo.budget": "Budget consigliato",
  "home.demo.potential": "Potenziale economico stimato",
  "home.demo.traditional": "Costo sviluppo tradizionale",
  "home.demo.savings": "Risparmio stimato con Team IA",
  "home.demo.inScope": "Funzioni da costruire ora",
  "home.demo.outScope": "Funzioni da rimandare",
  "home.demo.nextStep": "Prossimo step consigliato",
  "home.demo.nextStep.text": "Attivare il Team IA per trasformare l'analisi in una roadmap operativa e iniziare la prima versione.",
  "home.demo.note": "Esempio illustrativo. Stima orientativa, non una promessa di guadagno.",

  // Home — da idea confusa a progetto
  "home.flow.eyebrow": "Il percorso",
  "home.flow.title": "Da idea confusa a progetto operativo",
  "home.flow.intro": "IdeaPilot IA non promette app magiche in un click. Ti aiuta a mettere ordine: cosa costruire, quanto potrebbe costare, quali funzioni sviluppare per prime e quale passo fare dopo.",
  "home.flow.1.t": "Scrivi la tua idea",
  "home.flow.1.d": "Racconta cosa vuoi creare, anche se è ancora confusa.",
  "home.flow.2.t": "Ricevi il report",
  "home.flow.2.d": "IdeaPilot IA genera una prima analisi con costi, ore, budget, potenziale e funzioni.",
  "home.flow.3.t": "Decidi se costruirla",
  "home.flow.3.d": "Se il progetto ti convince, puoi attivare il Team IA e iniziare la prima versione.",

  // Home — fiducia
  "home.trust.eyebrow": "Trasparenza",
  "home.trust.title": "Non è una promessa magica. È un primo piano operativo.",
  "home.trust.body": "IdeaPilot IA non ti dice che la tua app avrà successo automaticamente. Ti aiuta a capire se l'idea è costruibile, quali sono i primi passi realistici e quanto potrebbe valere se validata dal mercato.",
  "home.trust.b1": "Nessuna promessa di guadagno garantito",
  "home.trust.b2": "Stime orientative e prudenti",
  "home.trust.b3": "Report salvato nel tuo account",
  "home.trust.b4": "Budget e funzioni coerenti con quello che scegli",
  "home.trust.b5": "Team IA attivabile solo se vuoi proseguire",

  // Home — toolkit
  "home.kit.eyebrow": "La tua infrastruttura",
  "home.kit.title.a": "La tua ",
  "home.kit.title.b": "cassetta degli attrezzi IA",
  "home.kit.desc":
    "Una volta imparato il metodo, gli strumenti che attivi non servono solo per completare questo percorso. Puoi usarli per validare nuove idee, creare prototipi, costruire app, preparare demo, generare contenuti e migliorare progetti già esistenti.",
  "home.kit.1.t": "Crea più app",
  "home.kit.1.d": "Usa lo stesso metodo per trasformare nuove idee in prime versioni funzionanti.",
  "home.kit.2.t": "Riduci il costo per progetto",
  "home.kit.2.d": "Più usi gli strumenti, più ogni singolo progetto pesa meno sul costo mensile.",
  "home.kit.3.t": "Costruisci competenza",
  "home.kit.3.d": "Non impari solo a usare un tool: impari un processo replicabile.",
  "home.kit.4.t": "Riutilizza prompt e agenti",
  "home.kit.4.d": "Gli agenti, i prompt e le roadmap che crei diventano patrimonio riutilizzabile.",
  "home.kit.note":
    "Non stai pagando strumenti per una sola idea. Stai costruendo il tuo laboratorio personale per trasformare più idee in progetti reali.",

  // Home — final CTA
  "home.final.title.a": "Hai un'idea in testa? ",
  "home.final.title.b": "Mettila alla prova.",
  "home.final.desc":
    "Scrivi la tua idea e ricevi una prima analisi operativa con costi, ore, budget, potenziale e prossimi step.",
  "home.final.cta": "Analizza gratis la mia idea",
  "home.final.micro": "Registrazione gratuita richiesta solo per vedere e salvare il report completo.",

  // Footer
  "footer.copy": "— metodo, agenti, prompt.",

  // Estimator
  "est.eyebrow": "Calcolatore intelligente · 10s",
  "est.title.a": "Metti alla prova la tua idea. ",
  "est.title.b": "Scopri cosa può diventare, quanto può costare e da dove partire.",
  "est.desc":
    "Scrivi la tua idea: in circa 10 secondi ricevi una prima analisi operativa con ore stimate, budget consigliato, potenziale economico e funzioni realizzabili.",
  "est.label.idea": "Descrivi la tua idea",
  "est.placeholder.idea":
    "Esempio: voglio creare una piattaforma per aiutare freelance, creator o piccoli team a gestire clienti, attività e scadenze in modo semplice.",
  "est.hint.idea": "Più sei chiaro, più la stima sarà precisa.",
  "est.hint.privacy": "Salviamo la tua richiesta per mantenere coerenti le stime e permetterti di ritrovare la tua idea in futuro.",
  "est.budget.title": "Inserisci il tuo budget",
  "est.budget.desc":
    "Indica solo il budget operativo per costruire la prima versione.",
  "est.optional.toggle": "Aggiungi dettagli facoltativi per una stima più precisa",
  "est.optional.target": "A chi vuoi venderla?",
  "est.optional.revenue": "Come pensi di guadagnarci?",
  "est.optional.price": "Quanto vorresti far pagare?",
  "est.optional.targetSpecify": "Specifica il target",
  "est.optional.targetSpecifyPh": "Scrivi il target a cui vuoi vendere l'app",
  "est.btn.calc": "Analizza la mia idea",
  "est.btn.calcInProgress": "Analisi in corso…",
  "est.btn.review": "Rivedi analisi",
  "est.btn.note": "Stima orientativa basata sulla tua descrizione. Non è una promessa: serve a capire l'ordine di grandezza.",
  "est.timeBadge": "~10s per la prima analisi",
  "est.loader.title": "Stiamo analizzando la tua idea",
  "est.loader.desc": "Il tuo agente IA sta trasformando la tua descrizione in una prima analisi operativa.",
  "est.loader.step1": "Analisi idea",
  "est.loader.step2": "Stima funzionalità",
  "est.loader.step3": "Calcolo costi e budget",
  "est.loader.step4": "Preparazione risultati",
  "est.loader.error": "C'è stato un problema durante l'elaborazione. Riprova tra qualche secondo.",
  "est.btn.preNote": "Analizziamo la tua idea ora. Per vedere e salvare il report completo ti chiederemo di creare un account.",
  "est.ready.title": "Il tuo progetto è pronto",
  "est.ready.subtitle": "Abbiamo preparato l'analisi della tua idea con fattibilità, ore, costi, budget e primi step operativi.",
  "est.ready.l1": "Ore e difficoltà stimate",
  "est.ready.l2": "Budget consigliato",
  "est.ready.l3": "Potenziale economico orientativo",
  "est.ready.l4": "Funzionalità sviluppabili con il tuo budget",
  "est.ready.l5": "Prossimi step consigliati",
  "est.ready.ctaPrimary": "Crea account gratis e guarda il report",
  "est.ready.ctaSecondary": "Accedi",
  "est.ready.micro": "La registrazione è gratuita. Il report verrà salvato nel tuo account.",
  "est.ready.saveError": "Non siamo riusciti a salvare il report. Riprova tra qualche secondo.",
  "report.title": "Il tuo report",
  "report.notFound": "Report non trovato o non più accessibile.",
  "report.loading": "Carico il tuo report…",
  "report.idea": "La tua idea",
  "report.section.estimates": "Stime e budget",
  "report.section.economics": "Potenziale economico",
  "report.section.scope": "Cosa puoi costruire con questo budget",
  "report.section.outOfScope": "Cosa rimandare per ora",
  "report.section.nextStep": "Prossimo step consigliato",
  "report.cta.activate": "Attiva il Team IA a 29€",
  "cta.early.micro": "Early access riservato ai primi utenti: 29€ per 12 mesi, senza pacchetti crediti.",
  "cta.early.compact": "29€ per 12 mesi · Nessun pacchetto crediti · Early access",
  "cta.early.strong": "Entri ora come early user: accesso incluso per 12 mesi, nessun pacchetto crediti e prezzo lancio riservato ai primi utenti.",
  "cta.early.final": "Prezzo lancio riservato ai primi utenti. Attivi ora il Team IA a 29€ e ottieni 12 mesi di accesso alla piattaforma, senza pacchetti crediti.",
  "cta.early.finalNote": "Il prezzo potrà aumentare con le prossime evoluzioni della piattaforma.",
  "cta.early.badge": "Early access 12 mesi",
  "cta.early.boxTitle": "Prezzo lancio early access",
  "cta.early.boxBody": "Attiva ora il Team IA a 29€ e ottieni 12 mesi di accesso alla piattaforma. In questa prima versione non usiamo pacchetti crediti: entri a prezzo lancio mentre il prodotto continua a crescere.",
  "cta.early.b1": "Accesso per 12 mesi",
  "cta.early.b2": "Nessun pacchetto crediti",
  "cta.early.b3": "Prezzo lancio per i primi utenti",
  "cta.early.note": "Il prezzo potrà aumentare con le prossime evoluzioni della piattaforma.",
  "report.hours": "Ore stimate",
  "report.difficulty": "Difficoltà",
  "report.projectType": "Tipo progetto",
  "report.budget": "Budget consigliato",
  "report.potential": "Potenziale orientativo",
  "report.traditional": "Costo sviluppo tradizionale",
  "report.savings": "Risparmio stimato con Team IA",
  "report.subtitle": "Una prima lettura concreta della tua idea: stime, scenari economici e cosa puoi costruire davvero.",
  "report.eco.kicker": "Scenario economico",
  "report.eco.heroTitle": "Potenziale economico stimato",
  "report.eco.heroBadge": "Scenario realistico",
  "report.eco.heroDesc": "Se validata e proposta al pubblico giusto, questa app potrebbe generare entrate ricorrenti.",
  "report.eco.heroDisclaimer": "Stima orientativa, non garantita, basata su una prima ipotesi di mercato.",
  "report.eco.heroEmotional": "Una prima stima concreta del potenziale mensile della tua idea.",
  "report.eco.bridgeTitle": "Pronto a trasformare il potenziale in realtà?",
  "report.eco.bridgeBody": "Se vuoi trasformare questo potenziale in una prima versione reale, il prossimo passo è attivare il Team IA.",
  "report.eco.tradDesc": "Quanto avresti potuto spendere affidando analisi, progettazione e prima versione a freelance o agenzie esterne.",
  "report.eco.savingsLabel": "risparmiati",
  "report.eco.savingsDesc": "Confronto orientativo tra sviluppo tradizionale esterno e accesso guidato al Team IA.",
  "report.eco.contextTitle": "Un approccio più sostenibile",
  "report.eco.contextBody": "Prima di spendere migliaia di euro per sviluppare tutto da zero, puoi validare la tua idea e costruire una prima versione con un approccio più guidato, sostenibile e realistico.",
  "report.perMonth": "/mese",
  "report.upTo": "Fino a",

  // Estimator — result card
  "est.res.firstHours": "Prima versione stimata",
  "est.res.hoursUnit": "ore",
  "est.res.difficulty": "Difficoltà",
  "est.res.projectType": "Tipo progetto",
  "est.res.monthly": "Costi mensili degli strumenti",
  "est.res.monthlyEss": "Costi mensili essenziali",
  "est.res.monthlyFull": "Con stack completo",
  "est.res.monthlyNote": "Gli strumenti possono essere riutilizzati anche per altre app e progetti, quindi il costo non va attribuito solo a una singola idea.",
  "est.res.tools": "Strumenti consigliati",
  "est.res.toolsNote": "Nota importante: alcuni strumenti hanno abbonamenti mensili. Questi costi possono sembrare legati a una singola app, ma in realtà ti permettono di lavorare anche su altri progetti. Più idee sviluppi, più il costo degli strumenti si distribuisce.",
  "est.res.potential": "Potenziale economico stimato",
  "est.res.scen.prudent": "Scenario prudente",
  "est.res.scen.realistic": "Scenario realistico",
  "est.res.scen.ambitious": "Scenario ambizioso, non garantito",
  "est.res.scen.note": "Stima basata su prezzo, target, modello di ricavo, difficoltà commerciale e capacità di acquisire clienti. Lo scenario ambizioso è possibile solo se il progetto viene validato, promosso e venduto bene.",
  "est.res.scen.customers": "clienti",
  "est.res.revModel": "Modello di ricavo consigliato",
  "est.res.breakeven": "Quante vendite servono per rientrare?",
  "est.res.breakevenIntro": "Se parti con un costo iniziale di",
  "est.res.breakevenSuffix": "ti servirebbero circa:",
  "est.res.breakevenPrice": "Prezzo",
  "est.res.breakevenUnit": "vendite",
  "est.res.breakevenHigh": "Con un'offerta da 497€, bastano poche vendite per recuperare il costo iniziale.",
  "est.res.breakevenFormula": "Formula: costo iniziale stimato / prezzo ipotizzato = vendite per break-even.",
  "est.res.disclaimer": "Queste stime non sono promesse di guadagno. Servono a capire l'ordine di grandezza economico del progetto. I risultati reali dipendono da mercato, prezzo, offerta, traffico, capacità di vendita, qualità del prodotto ed esecuzione.",
  "est.res.advice": "Consiglio operativo",
  "est.res.advice.default": "Puoi costruire una prima versione funzionante con database, dashboard base e flusso utente principale.",
  "est.res.advice.low": "Parti con una versione più semplice: landing + raccolta richieste + dashboard manuale. Evita subito login complessi, pagamenti, chat e notifiche.",
  "est.res.advice.high": "Puoi valutare una prima versione più completa con login, ruoli, dashboard, pagamenti o notifiche, solo se servono davvero.",
  "est.res.ctaMethod": "Voglio prima vedere il metodo",
  "est.res.ctaRoadmap": "Crea la roadmap completa a 29€",
  "est.res.ctaNote": "La roadmap completa ti mostra step, agenti, strumenti, prompt e avanzamento percentuale per costruire la prima versione funzionante della tua app.",

  // Pricing
  "pricing.badge": "Pacchetto Team IA Operativo",
  "pricing.title": "Attiva il tuo Team IA operativo",
  "pricing.subtitle":
    "Tu porti l'idea. Il tuo team di agenti IA la organizza, la struttura e prepara il lavoro per trasformarla nella prima versione della tua app.",
  "pricing.leadHint": "Attivi una squadra IA pronta a lavorare sul tuo progetto.",
  "pricing.activeBadge": "Team IA attivo",
  "pricing.opPackBadge": "Pacchetto operativo",
  "pricing.cardTitle.a": "Pacchetto ",
  "pricing.cardTitle.b": "Team IA Operativo",
  "pricing.cardDesc": "Attiva la squadra di agenti IA che lavora sulla tua idea e ti aiuta a trasformarla nella prima versione della tua app.",
  "pricing.launch": "Prezzo lancio",
  "pricing.oneTime": "Accesso per 12 mesi",
  "pricing.accessNote": "Prezzo riservato ai primi utenti che entrano ora nella piattaforma. Pagamento singolo, nessun rinnovo automatico.",
  "pricing.launchHook": "Siamo appena partiti — entra ora al prezzo lancio",
  "pricing.earlyTitle": "Prezzo lancio riservato ai primi utenti",
  "pricing.earlyBody": "Entrando ora, attivi il Team IA Operativo a 29€ e ottieni 12 mesi di accesso alla piattaforma. Siamo all'inizio del progetto: con l'arrivo di nuove funzioni, il prezzo aumenterà.",
  "pricing.valueLine": "Oggi entri a condizioni di lancio. Domani, con l'evoluzione della piattaforma, questo prezzo non sarà più disponibile.",
  "pricing.bullets.1": "Nessun sistema a crediti",
  "pricing.bullets.2": "Accesso chiaro per 12 mesi",
  "pricing.bullets.3": "Prezzo early access",
  "pricing.bullets.4": "Il prodotto continuerà a crescere",
  "pricing.early": "Early access",
  "pricing.earlyLine.a": "Prezzo lancio",
  "pricing.earlyLine.b": "riservato ai",
  "pricing.earlyLine.c": "primi utenti",
  "pricing.earlyNote.a": "Attiva ora il Team IA a 29€. Dopo questa fase iniziale, il prezzo",
  "pricing.earlyNote.b": "potrà aumentare",
  "pricing.longDesc":
    "Non devi sapere programmare, progettare schermate o capire tutti gli strumenti. Tu racconti cosa vuoi creare e dai le direttive. Il tuo team IA organizza il progetto, definisce le funzioni e lavorerà per te per la creazione della tua app.",
  "pricing.slogan.a": "Non parti da zero.",
  "pricing.slogan.b": "Parti con una squadra.",
  "pricing.slogan.sub": "Tu dai l'idea. Il team IA prepara il lavoro.",
  "pricing.cta.primary": "Parti ora con il Team IA - 29€",
  "pricing.cta.dashboard": "Vai alla dashboard",
  "pricing.cta.note": "Pagamento singolo · 12 mesi di accesso · Nessun rinnovo automatico.",
  "pricing.cta.secure": "Early access riservato ai primi utenti: 29€ per 12 mesi, senza pacchetti crediti.",
  "pricing.os.title.a": "Un sistema operativo pronto a ",
  "pricing.os.title.b": "lavorare sulla tua idea",
  "pricing.os.desc.a": "Stai attivando un sistema operativo di agenti IA che prende la tua idea e la trasforma in un progetto concreto.",
  "pricing.os.desc.b": "Pronto a partire?",
  "pricing.compare.title.a": "Da solo o con il tuo ",
  "pricing.compare.title.b": "team IA",
  "pricing.compare.alone": "Da solo",
  "pricing.compare.with": "Con il team IA",
  "pricing.alone.1": "Non sai da dove partire",
  "pricing.alone.2": "Rischi di creare troppe funzioni",
  "pricing.alone.3": "Perdi tempo tra tool e prompt",
  "pricing.alone.4": "Non hai una roadmap chiara",
  "pricing.with.1": "Parti da un'analisi chiara",
  "pricing.with.2": "Costruisci solo ciò che serve",
  "pricing.with.3": "Hai prompt e step già pronti",
  "pricing.with.4": "Tu controlli e approvi, loro lavorano",
  "pricing.final.title.a": "Il tuo ",
  "pricing.final.title.b": "Team IA",
  "pricing.final.title.c": " è pronto. Vuoi attivarlo?",
  "pricing.final.desc": "Porta la tua idea. Dai le direttive. Lascia che gli agenti IA inizino a trasformarla in una prima app.",
  "pricing.final.active": "Il tuo Team IA è già attivo.",
  "pricing.final.access": "Prezzo lancio riservato ai primi utenti. Attivi ora il Team IA a 29€ e ottieni 12 mesi di accesso alla piattaforma, senza pacchetti crediti.",
  "pricing.final.method": "Prima voglio vedere il metodo →",

  // Pricing — team agents
  "team.strategist.role": "Stratega IA",
  "team.strategist.line": "Analizza la tua idea e decide da dove conviene partire.",
  "team.product.role": "Product Agent",
  "team.product.line": "Trasforma la tua idea in un piano operativo chiaro.",
  "team.ux.role": "UX Agent",
  "team.ux.line": "Ti prepara le schermate principali della tua app.",
  "team.logic.role": "Logic Agent",
  "team.logic.line": "Organizza funzioni, flussi e passaggi fondamentali.",
  "team.prompt.role": "Prompt Agent",
  "team.prompt.line": "Crea istruzioni pronte da usare per costruire meglio e più velocemente.",
  "team.build.role": "Build Agent",
  "team.build.line": "Ti aiuta a generare le prime parti operative del progetto.",
  "team.test.role": "Test Agent",
  "team.test.line": "Controlla errori, punti deboli e passaggi da migliorare.",
  "team.launch.role": "Launch Agent",
  "team.launch.line": "Ti aiuta a preparare la tua app per presentarla, venderla o lanciarla.",
  "team.path.role": "Percorso personale",
  "team.path.line": "Tieni sotto controllo l'avanzamento del tuo progetto.",
  "team.method.role": "Metodo operativo",
  "team.method.line": "Prompt, roadmap e istruzioni operative guidate dal Team IA.",

  // Auth
  "auth.signin": "Accedi",
  "auth.signup": "Crea account",
  "auth.signupCta": "Crea il tuo account",
  "auth.continueGoogle": "Continua con Google",
  "auth.continueApple": "Continua con Apple",
  "auth.orEmail": "oppure con email",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordConfirm": "Conferma password",
  "auth.name": "Nome",
  "auth.wait": "Attendere...",
  "auth.pwd.length": "Almeno 8 caratteri",
  "auth.pwd.upper": "Una lettera maiuscola",
  "auth.pwd.lower": "Una lettera minuscola",
  "auth.pwd.number": "Un numero",
  "auth.pwd.special": "Un carattere speciale (! @ # $ % ^ & * ? _ - .)",
  "auth.pwd.mismatch": "Le password non coincidono.",
  "auth.show": "Mostra password",
  "auth.hide": "Nascondi password",
  "auth.toast.welcome": "Bentornato!",
  "auth.toast.created": "Account creato!",
  "auth.toast.createdConfirm": "Account creato! Controlla la tua email per confermare, poi accedi.",
  "auth.toast.oauthFail": "Accesso non riuscito. Riprova.",
  "auth.err.pwdRules": "La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale.",
  "auth.err.pwdMatch": "Le password non coincidono.",

  // Idea Analysis Dialog
  "iad.badge": "Analisi generata dal tuo agente IA",
  "iad.title.a": "Ecco l'analisi della tua ",
  "iad.title.b": "idea",
  "iad.subtitle": "Il tuo agente IA sta trasformando la tua idea in un primo piano operativo.",
  "iad.close": "Chiudi",
  "iad.error": "Non siamo riusciti a generare l'analisi. Riprova tra qualche secondo.",
  "iad.retry": "Riprova",
  "iad.degraded": "Analisi generata in modalità rapida. Alcuni dati sono indicativi: puoi rigenerarla tra qualche minuto per la versione completa.",
  "iad.sect.idea": "Idea analizzata",
  "iad.sect.projectType": "Tipo progetto",
  "iad.sect.target": "Target",
  "iad.sect.problem": "Problema risolto",
  "iad.sect.solution": "Soluzione proposta",
  "iad.sect.firstVersion": "Prima versione consigliata",
  "iad.sect.features": "Funzioni principali",
  "iad.sect.screens": "Schermate consigliate",
  "iad.sect.integrations": "Integrazioni richieste",
  "iad.sect.hours": "Ore stimate",
  "iad.sect.hoursNote": "Per la prima versione funzionante.",
  "iad.sect.complexity": "Livello complessità",
  "iad.sect.tools": "Strumenti consigliati",
  "iad.sect.advice": "Consiglio operativo",
  "iad.sect.adviceBody": "Parti dalla prima versione funzionante: lascia che il tuo Team IA prepari struttura, funzioni, schermate e prompt. Valida l'idea con i primi utenti prima di investire in funzioni avanzate o sviluppo esterno.",
  "iad.impact.potential": "Quanto potrebbe fruttare",
  "iad.impact.potentialDesc": "Se trasformata in una prima versione funzionante e proposta al pubblico giusto, questa app potrebbe generare entrate ricorrenti.",
  "iad.impact.potentialMicro": "Stima indicativa, non garantita, basata su una prima ipotesi di mercato.",
  "iad.impact.cost": "Quanto avresti potuto spendere",
  "iad.impact.costDesc": "Per far progettare e sviluppare questa prima versione da freelance, agenzia o sviluppatori esterni, il costo avrebbe potuto arrivare a questa cifra.",
  "iad.impact.savings": "Risparmio stimato con il Team IA",
  "iad.compareLine": "Prima di spendere migliaia di euro per sviluppare tutto da zero, puoi validare e costruire la prima versione guidata con il tuo Team IA. Questa non è solo una stima: è il confronto tra lasciare l'idea ferma e iniziare oggi a trasformarla in un progetto reale.",
  "iad.footer.authed": "Sei già registrato: trasforma subito questa analisi in un nuovo progetto.",
  "iad.footer.guest": "Attiva il tuo Team IA per costruire la prima versione guidata.",
  "iad.cta.generate": "Genera questo progetto",
  "iad.cta.generateHint": "Trasforma questa analisi in un progetto operativo nella tua dashboard.",
  "iad.cta.activate": "Attiva il Team IA a 29€",
  "iad.cta.activateHint": "Prezzo lancio una tantum. Nessun abbonamento automatico.",
  "iad.loading.title": "Il tuo agente IA sta analizzando l'idea…",
  "iad.loading.sub": "Stiamo trasformando la tua idea in target, problema, soluzione, funzioni e schermate.",
  "iad.confirm.title": "Chiudere l'analisi?",
  "iad.confirm.desc": "L'analisi è ancora in corso. Se chiudi ora potresti dover rilanciare il calcolo.",
  "iad.confirm.cancel": "Annulla",
  "iad.confirm.ok": "Chiudi",

  // Riepilogo (results page)
  "rie.empty.badge": "Analisi gratuita",
  "rie.empty.title.a": "Non abbiamo ancora un'",
  "rie.empty.title.b": "idea",
  "rie.empty.title.c": " da analizzare.",
  "rie.empty.desc": "Torna alla home e scrivi la tua idea: il tuo agente IA la trasformerà in un primo piano operativo.",
  "rie.empty.cta": "Scrivi la mia idea",
  "rie.hero.badge": "Analisi generata dal tuo agente IA",
  "rie.hero.title.a": "Ecco l'analisi della tua ",
  "rie.hero.title.b": "idea",
  "rie.hero.desc": "Il tuo agente IA ha trasformato la tua idea in un primo piano operativo per capire cosa creare, da dove partire e quanto tempo può servire.",
  "rie.originalIdea": "Idea originale:",
  "rie.firstVerNote.a": "Stiamo parlando della",
  "rie.firstVerNote.b": "prima versione funzionante",
  "rie.firstVerNote.c": ", non dell'app completa.",
  "rie.timeEst": "Tempo stimato",
  "rie.timeEst.note.a": "Tempo indicativo per la",
  "rie.timeEst.note.b": "prima versione funzionante",
  "rie.timeEst.note.c": ", non per l'app completa.",
  "rie.complexity": "Complessità progetto",
  "rie.agentSect": "Cosa farà il tuo agente IA",
  "rie.agentSect.intro": "Il tuo agente IA personale ti accompagna passo dopo passo per trasformare questa analisi in un'app reale:",
  "rie.agentTask.1": "Chiarisce e mette a fuoco l'idea",
  "rie.agentTask.2": "Elimina le funzioni inutili",
  "rie.agentTask.3": "Costruisce la roadmap operativa",
  "rie.agentTask.4": "Scrive i prompt da copiare",
  "rie.agentTask.5": "Disegna le schermate da creare",
  "rie.agentTask.6": "Migliora il progetto passo dopo passo",
  "rie.value.eyebrow": "Valore stimato della tua idea",
  "rie.value.title.a": "Quanto può ",
  "rie.value.title.b": "valere",
  "rie.value.title.c": " e quanto sarebbe ",
  "rie.value.title.d": "costata",
  "rie.value.desc": "Il tuo agente IA ha stimato il possibile potenziale economico dell'idea e il costo che avresti potuto sostenere per farla realizzare da zero.",
  "rie.value.potential": "Potenziale massimo stimato",
  "rie.value.potential.note": "Stima indicativa basata su una prima versione funzionante, target corretto e primi clienti paganti.",
  "rie.value.cost": "Costo stimato senza Agenti IA",
  "rie.value.cost.tag": "Solo realizzazione",
  "rie.value.cost.note": "Stima indicativa del costo che avresti potuto sostenere per far creare questa prima versione da freelance, agenzia o sviluppatore esterno.",
  "rie.value.compare": "Confronto reale",
  "rie.value.compareTitle.a": "Far realizzare questa app da professionisti ti sarebbe potuto costare fino a ",
  "rie.value.compareDesc.a": "Oggi, con ",
  "rie.value.compareDesc.b": ", puoi attivare il tuo ",
  "rie.value.compareDesc.c": "Team IA",
  "rie.value.compareDesc.d": " e iniziare a trasformare la tua idea nella ",
  "rie.value.compareDesc.e": "prima versione della tua app",
  "rie.value.withoutLabel": "Costo stimato senza Agenti IA",
  "rie.value.withoutPrefix": "Fino a",
  "rie.value.withoutNote": "Costo indicativo se affidassi la realizzazione iniziale a freelance, agenzia o sviluppatore esterno.",
  "rie.value.launchBadge": "Prezzo lancio Team IA",
  "rie.value.launchPrice": "29€ una tantum",
  "rie.value.launchNote": "Parti subito con il tuo Team IA operativo e costruisci la prima versione guidata del progetto.",
  "rie.value.genProject": "Genera questo progetto",
  "rie.value.activate": "Parti ora con il Team IA - 29€",
  "rie.value.activate.note": "Pagamento unico. Nessun abbonamento attivato automaticamente.",
  "rie.value.authed.note": "Sei già registrato: puoi trasformare subito questa valutazione in un nuovo progetto nel tuo account.",
  "rie.value.guest.note": "Accesso immediato. Non ottieni l'app completa finita: attivi il tuo Team IA per partire dall'idea e costruire la prima versione.",
  "rie.value.disclaimer": "Stime indicative. Non includono marketing, server, manutenzione o evoluzioni future.",
  "rie.cta.discover": "Vuoi vedere chi lavorerà sulla tua idea?",
  "rie.cta.discoverDesc": "Abbiamo preparato il Team IA che può aiutarti a trasformare questa idea in una prima app: ogni agente ha un ruolo preciso e lavora insieme agli altri.",
  "rie.cta.discoverBtn": "Scopri il Team IA che lavorerà sulla tua idea",
  "rie.cta.discoverNote": "Prima conosci la squadra. Poi decidi se attivarla.",
  "rie.footer.disclaimer": "Le stime sono indicative e servono a capire l'ordine di grandezza del progetto. I risultati reali dipendono da mercato, prezzo, offerta, traffico, capacità di vendita, qualità del prodotto ed esecuzione.",
  "rie.loading.title": "Il tuo agente IA sta analizzando l'idea…",
  "rie.loading.sub": "Stiamo trasformando la tua idea in target, problema, soluzione, funzioni e schermate.",

  // Common
  "common.error": "Qualcosa è andato storto. Riprova.",
  "common.privacy":
    "La tua idea viene usata solo per generare la tua analisi. Non pubblichiamo né condividiamo il tuo progetto senza il tuo permesso.",
};

const en: Dict = {
  // Brand
  "brand.full": "IdeaPilot AI",
  "brand.ai": "AI",
  "brand.tagline": "From your idea to your first app",

  // Nav
  "nav.home": "Home",
  "nav.tools": "Tools",
  "nav.agents": "Agents",
  "nav.pricing": "Pricing",
  "nav.dashboard": "Dashboard",
  "nav.signIn": "Sign in",
  "nav.start": "Get started",
  "nav.signOut": "Sign out",
  "nav.activate": "Activate AI Team - €29",
  "nav.projectManager": "Talk to the Project Manager",
  "nav.projectManagerShort": "Project Manager",

  "lang.label": "Language",

  // Home / Hero
  "home.badge": "AI method for non-technical founders",
  "home.hero.eyebrow": "App idea validation — free, in ~10 seconds",
  "home.hero.title": "Find out if your idea can become a real project — before you spend any money.",
  "home.hero.subtitle":
    "Describe your idea in one sentence: IdeaPilot AI estimates hours, costs, budget and economic potential, and shows you what you can actually build — no agencies, no wasted months.",
  "home.cta.primary": "Analyze my idea for free",
  "home.cta.secondary": "See an example report",
  "home.hero.note": "Free, no sign-up. First analysis in about 10 seconds.",

  // Home — steps
  "home.steps.eyebrow": "How it works",
  "home.steps.title": "From idea to first app version in 4 steps",
  "home.steps.1.title": "1. Enter your idea",
  "home.steps.1.desc": "Answer a few guided questions: what you do, for whom, which problem you solve.",
  "home.steps.2.title": "2. Get a structured project",
  "home.steps.2.desc": "A clear brief: target, MVP, screens, data, risks and what NOT to build.",
  "home.steps.3.title": "3. AI agents and prompts",
  "home.steps.3.desc": "A recommended team of AI agents and ready-to-use operational prompts.",
  "home.steps.4.title": "4. Build your first app version",
  "home.steps.4.desc": "Follow the step-by-step roadmap and ship a working first version with no-code tools.",

  // Home — method
  "home.method.eyebrow": "The method",
  "home.method.title": "The method, in detail",
  "home.method.1.title": "1. Describe the idea",
  "home.method.1.desc": "Answer a guided form: what you do, who it's for, which problem you solve.",
  "home.method.2.title": "2. Get a clear brief",
  "home.method.2.desc": "Target, solution, essential first-version features, screens, data, risks, what NOT to build.",
  "home.method.3.title": "3. Agent team + prompts",
  "home.method.3.desc": "7 recommended AI agents, each with ready prompts to paste into your tools.",

  // Home — advantages
  "home.adv.eyebrow": "Why it works",
  "home.adv.title": "Why it works",
  "home.adv.1.title": "Clear focus",
  "home.adv.1.desc": "Defined first version. No endless projects.",
  "home.adv.2.title": "Fast",
  "home.adv.2.desc": "From a blank page to a brief in 5 minutes.",
  "home.adv.3.title": "No code",
  "home.adv.3.desc": "Designed for non-developers.",
  "home.adv.4.title": "Ready to build",
  "home.adv.4.desc": "Prompts and an operational roadmap included.",

  // Home — examples
  "home.ex.eyebrow": "Real cases",
  "home.ex.title": "Examples of projects you can build",
  "home.ex.1.t": "Appointment management",
  "home.ex.1.d": "A simple web app to receive and manage appointments without missing requests.",
  "home.ex.2.t": "Mini CRM for consultants",
  "home.ex.2.d": "Client records, notes, follow-ups. Just the essentials.",
  "home.ex.3.t": "Landing page to launch a service",
  "home.ex.3.d": "A page that explains your offer and collects qualified leads.",
  "home.ex.4.t": "Client manager for freelancers",
  "home.ex.4.d": "Client records, tasks and deadlines in one place.",
  "home.ex.5.t": "Internal team app",
  "home.ex.5.d": "A custom tool for a specific process in your business.",
  "home.ex.6.t": "Niche marketplace",
  "home.ex.6.d": "A first-version MVP to validate your idea with real users.",

  // Home — target
  "home.target.eyebrow": "Who it's for",
  "home.target.title": "Who it's for",
  "home.target.role": "Founders, consultants, creators",
  "home.target.desc":
    "You have an intuition, a service or a process you want to digitize but don't know where to start. You stay in charge — the AI agents help you with structure, prompts and a roadmap to actually get going.",
  "home.target.list.1": "Creators and solopreneurs",
  "home.target.list.2": "Small teams and communities",
  "home.target.list.3": "Freelancers and professional firms",
  "home.target.list.4": "Coaches and trainers",
  "home.target.list.5": "First-time app founders",

  // Home — what you receive
  "home.receive.eyebrow": "What you get",
  "home.receive.title": "See what your report will include",
  "home.receive.subtitle": "A clear first analysis to understand if your idea can become a buildable project.",
  "home.receive.1.t": "Idea analysis",
  "home.receive.1.d": "Understand if the idea is clear, realistic and can be turned into a first project.",
  "home.receive.2.t": "Estimated hours and difficulty",
  "home.receive.2.d": "See how much work it could take to ship a first working version.",
  "home.receive.3.t": "Recommended budget",
  "home.receive.3.d": "Find out which budget range fits what you want to build.",
  "home.receive.4.t": "Estimated economic potential",
  "home.receive.4.d": "Get a first prudent hypothesis of possible monthly revenue.",
  "home.receive.5.t": "Features to build now",
  "home.receive.5.d": "Understand what makes sense to ship now and what to postpone.",
  "home.receive.6.t": "Roadmap and next steps",
  "home.receive.6.d": "Get a clear direction to turn the idea into an operational project.",

  // Home — social proof (early access)
  "home.proof.eyebrow": "Early access community",
  "home.proof.title": "Already chosen by 1,000+ early users",
  "home.proof.subtitle": "Creators, freelancers, entrepreneurs and founders use IdeaPilot AI to analyze ideas, generate reports and turn them into concrete projects.",
  "home.proof.earlyUsers.label": "Early users",
  "home.proof.earlyUsers.desc": "People who joined the platform's first phase.",
  "home.proof.ideasAnalyzed.label": "Ideas analyzed",
  "home.proof.ideasAnalyzed.desc": "Ideas submitted and evaluated with the smart calculator.",
  "home.proof.reportsGenerated.label": "Reports generated",
  "home.proof.reportsGenerated.desc": "First operational analyses created with hours, budget and potential.",
  "home.proof.projectsSaved.label": "Projects saved",
  "home.proof.projectsSaved.desc": "Reports turned into projects available in the user dashboard.",
  "home.proof.micro": "Aggregated early access data. Economic estimates are indicative and do not guarantee results.",

  // Home — demo case studies
  "home.cases.eyebrow": "Demo examples",
  "home.cases.title": "Examples of apps born from an idea",
  "home.cases.subtitle": "Demo scenarios showing how an idea can become a concrete project with estimated potential, features and next steps.",
  "home.cases.micro": "Demo examples. Economic estimates are indicative and not guaranteed.",
  "home.cases.metric.users": "potential users",
  "home.cases.metric.leads": "potential leads/month",
  "home.cases.metric.business": "potential businesses",
  "home.cases.metric.features": "recommended MVP features",
  "home.cases.metric.hours": "estimated hours for the first version",
  "home.cases.metric.revenue": "Revenue model",
  "home.cases.potential": "estimated monthly potential",
  "home.cases.cta": "View example report",
  "home.cases.outro.title": "The next idea could be yours",
  "home.cases.outro.text": "Describe your idea and get a first operational report with costs, hours, potential and features to build.",
  "home.cases.outro.cta": "Analyze my idea for free",
  "home.cases.outro.micro": "The full report is saved to your account after free sign up.",

  // Home — example report
  "home.demo.eyebrow": "Example report",
  "home.demo.title": "See what your report will look like",
  "home.demo.subtitle": "A concrete example: idea, hours, costs, potential, recommended features and next steps.",
  "home.demo.cta": "View example report",
  "home.demo.idea.label": "Analyzed idea",
  "home.demo.idea.text": "A platform to help freelancers and small teams manage clients, tasks and deadlines in one place.",
  "home.demo.hours": "Estimated hours",
  "home.demo.difficulty": "Difficulty",
  "home.demo.budget": "Recommended budget",
  "home.demo.potential": "Estimated economic potential",
  "home.demo.traditional": "Traditional development cost",
  "home.demo.savings": "Estimated savings with AI Team",
  "home.demo.inScope": "Features to build now",
  "home.demo.outScope": "Features to postpone",
  "home.demo.nextStep": "Suggested next step",
  "home.demo.nextStep.text": "Activate the AI Team to turn the analysis into an operational roadmap and start your first version.",
  "home.demo.note": "Illustrative example. Indicative estimate, not a promise of earnings.",

  // Home — from confused idea to project
  "home.flow.eyebrow": "The path",
  "home.flow.title": "From a confused idea to an operational project",
  "home.flow.intro": "IdeaPilot AI doesn't promise magic apps in one click. It helps you bring order: what to build, what it could cost, which features to ship first and what step to take next.",
  "home.flow.1.t": "Write down your idea",
  "home.flow.1.d": "Tell us what you want to create, even if it's still messy.",
  "home.flow.2.t": "Get the report",
  "home.flow.2.d": "IdeaPilot AI generates a first analysis with costs, hours, budget, potential and features.",
  "home.flow.3.t": "Decide if you want to build it",
  "home.flow.3.d": "If the project convinces you, activate the AI Team and start the first version.",

  // Home — trust
  "home.trust.eyebrow": "Transparency",
  "home.trust.title": "No magic promises. Just a first operational plan.",
  "home.trust.body": "IdeaPilot AI doesn't tell you your app will succeed automatically. It helps you understand whether the idea is buildable, what the first realistic steps are and how much it could be worth if validated by the market.",
  "home.trust.b1": "No guaranteed earnings promise",
  "home.trust.b2": "Indicative, prudent estimates",
  "home.trust.b3": "Report saved in your account",
  "home.trust.b4": "Budget and features consistent with your choices",
  "home.trust.b5": "AI Team activated only if you want to continue",

  // Home — toolkit
  "home.kit.eyebrow": "Your stack",
  "home.kit.title.a": "Your ",
  "home.kit.title.b": "AI toolkit",
  "home.kit.desc":
    "Once you learn the method, the tools you activate aren't just for finishing this project. You can use them to validate new ideas, build prototypes, ship apps, prepare demos, generate content and improve existing projects.",
  "home.kit.1.t": "Build more apps",
  "home.kit.1.d": "Use the same method to turn new ideas into working first versions.",
  "home.kit.2.t": "Lower cost per project",
  "home.kit.2.d": "The more you use the stack, the less each project costs against the monthly tools.",
  "home.kit.3.t": "Build expertise",
  "home.kit.3.d": "You don't just learn a tool — you learn a repeatable process.",
  "home.kit.4.t": "Reuse prompts and agents",
  "home.kit.4.d": "Agents, prompts and roadmaps you create become reusable assets.",
  "home.kit.note":
    "You're not paying for tools for a single idea. You're building your personal lab to turn more ideas into real projects.",

  // Home — final CTA
  "home.final.title.a": "Got an idea in mind? ",
  "home.final.title.b": "Put it to the test.",
  "home.final.desc":
    "Write down your idea and get a first operational analysis with costs, hours, budget, potential and next steps.",
  "home.final.cta": "Analyze my idea for free",
  "home.final.micro": "Free sign-up only required to view and save your full report.",

  // Footer
  "footer.copy": "— method, agents, prompts.",

  // Estimator
  "est.eyebrow": "Smart calculator · 10s",
  "est.title.a": "Put your idea to the test. ",
  "est.title.b": "See what it can become, what it could cost and where to start.",
  "est.desc":
    "Write your idea: in about 10 seconds you get a first operational analysis with estimated hours, recommended budget, economic potential and feasible features.",
  "est.label.idea": "Describe your idea",
  "est.placeholder.idea":
    "Example: I want to create a platform that helps freelancers, creators or small teams manage clients, tasks and deadlines in a simple way.",
  "est.hint.idea": "The clearer you are, the more accurate the estimate.",
  "est.hint.privacy": "We save your request to keep estimates consistent and let you find your idea again later.",
  "est.budget.title": "Enter your budget",
  "est.budget.desc":
    "Only set the operational budget needed to build the first version.",
  "est.optional.toggle": "Add optional details for a more accurate estimate",
  "est.optional.target": "Who are you selling it to?",
  "est.optional.revenue": "How do you plan to make money?",
  "est.optional.price": "How much would you charge?",
  "est.optional.targetSpecify": "Specify the target",
  "est.optional.targetSpecifyPh": "Describe the audience you want to sell the app to",
  "est.btn.calc": "Analyze my idea",
  "est.btn.calcInProgress": "Analyzing…",
  "est.btn.review": "Review analysis",
  "est.btn.note": "Rough estimate based on your description. It's not a promise: it's meant to give you a sense of scale.",
  "est.timeBadge": "~10s for your first analysis",
  "est.loader.title": "Analyzing your idea",
  "est.loader.desc": "Your AI agent is turning your description into a first operational analysis.",
  "est.loader.step1": "Analyzing idea",
  "est.loader.step2": "Estimating features",
  "est.loader.step3": "Calculating costs and budget",
  "est.loader.step4": "Preparing results",
  "est.loader.error": "Something went wrong. Please try again in a few seconds.",
  "est.btn.preNote": "We'll analyze your idea now. To view and save the full report, you'll be asked to create an account.",
  "est.ready.title": "Your project is ready",
  "est.ready.subtitle": "We prepared your idea analysis with feasibility, estimated hours, costs, budget and first operational steps.",
  "est.ready.l1": "Estimated hours and difficulty",
  "est.ready.l2": "Recommended budget",
  "est.ready.l3": "Indicative economic potential",
  "est.ready.l4": "Features you can build with your budget",
  "est.ready.l5": "Suggested next steps",
  "est.ready.ctaPrimary": "Create a free account and view report",
  "est.ready.ctaSecondary": "Log in",
  "est.ready.micro": "Registration is free. Your report will be saved in your account.",
  "est.ready.saveError": "We couldn't save your report. Please try again in a few seconds.",
  "report.title": "Your report",
  "report.notFound": "Report not found or no longer accessible.",
  "report.loading": "Loading your report…",
  "report.idea": "Your idea",
  "report.section.estimates": "Estimates and budget",
  "report.section.economics": "Economic potential",
  "report.section.scope": "What you can build with this budget",
  "report.section.outOfScope": "What to postpone for now",
  "report.section.nextStep": "Suggested next step",
  "report.cta.activate": "Activate the AI Team for €29",
  "cta.early.micro": "Early access for first users: €29 for 12 months, no credit packs.",
  "cta.early.compact": "€29 for 12 months · No credit packs · Early access",
  "cta.early.strong": "Early access for first users: activate the AI Team for €29 and get 12 months of platform access with no credit packs.",
  "cta.early.final": "Launch price reserved for early users. Activate the AI Team now for €29 and get 12 months of platform access with no credit packs.",
  "cta.early.finalNote": "The price may increase as the platform evolves.",
  "cta.early.badge": "Early access 12 months",
  "cta.early.boxTitle": "Early access launch price",
  "cta.early.boxBody": "Activate the AI Team now for €29 and get 12 months of platform access. In this first version, we don't use credit packs: you enter at launch price while the product keeps evolving.",
  "cta.early.b1": "12 months of access",
  "cta.early.b2": "No credit packs",
  "cta.early.b3": "Launch price for early users",
  "cta.early.note": "The price may increase as the platform evolves.",
  "report.hours": "Estimated hours",
  "report.difficulty": "Difficulty",
  "report.projectType": "Project type",
  "report.budget": "Recommended budget",
  "report.potential": "Indicative potential",
  "report.traditional": "Traditional dev cost",
  "report.savings": "Estimated savings with AI Team",
  "report.subtitle": "A concrete first read of your idea: estimates, economic scenarios and what you can actually build.",
  "report.eco.kicker": "Economic scenario",
  "report.eco.heroTitle": "Estimated economic potential",
  "report.eco.heroBadge": "Realistic scenario",
  "report.eco.heroDesc": "If validated and offered to the right audience, this app could generate recurring revenue.",
  "report.eco.heroDisclaimer": "Indicative estimate, not guaranteed, based on a first market hypothesis.",
  "report.eco.heroEmotional": "A first concrete estimate of your idea's monthly potential.",
  "report.eco.bridgeTitle": "Ready to turn this potential into reality?",
  "report.eco.bridgeBody": "If you want to turn this potential into a real first version, the next step is activating the AI Team.",
  "report.eco.tradDesc": "What you could have spent outsourcing analysis, design and the first version to freelancers or agencies.",
  "report.eco.savingsLabel": "saved",
  "report.eco.savingsDesc": "Indicative comparison between external traditional development and guided access to the AI Team.",
  "report.eco.contextTitle": "A more sustainable approach",
  "report.eco.contextBody": "Before spending thousands building everything from scratch, you can validate your idea and ship a first version with a more guided, sustainable and realistic approach.",
  "report.perMonth": "/mo",
  "report.upTo": "Up to",

  // Estimator — result card
  "est.res.firstHours": "Estimated first version",
  "est.res.hoursUnit": "hours",
  "est.res.difficulty": "Difficulty",
  "est.res.projectType": "Project type",
  "est.res.monthly": "Monthly tool costs",
  "est.res.monthlyEss": "Essential monthly costs",
  "est.res.monthlyFull": "Full stack",
  "est.res.monthlyNote": "These tools can be reused across other apps and projects, so the cost shouldn't be attributed to a single idea.",
  "est.res.tools": "Recommended tools",
  "est.res.toolsNote": "Note: some tools have monthly subscriptions. While they may look tied to one app, they actually let you work on multiple projects. The more ideas you develop, the more the tool cost gets distributed.",
  "est.res.potential": "Estimated revenue potential",
  "est.res.scen.prudent": "Conservative scenario",
  "est.res.scen.realistic": "Realistic scenario",
  "est.res.scen.ambitious": "Ambitious scenario, not guaranteed",
  "est.res.scen.note": "Estimate based on price, target, revenue model, sales difficulty and ability to acquire customers. The ambitious scenario is only possible if the project is validated, promoted and sold well.",
  "est.res.scen.customers": "customers",
  "est.res.revModel": "Recommended revenue model",
  "est.res.breakeven": "How many sales to break even?",
  "est.res.breakevenIntro": "If you start with an initial cost of",
  "est.res.breakevenSuffix": "you would need around:",
  "est.res.breakevenPrice": "Price",
  "est.res.breakevenUnit": "sales",
  "est.res.breakevenHigh": "With a €497 offer, just a few sales recover the initial cost.",
  "est.res.breakevenFormula": "Formula: estimated initial cost / assumed price = break-even sales.",
  "est.res.disclaimer": "These estimates are not income promises. They give you a sense of project scale. Real results depend on market, price, offer, traffic, sales ability, product quality and execution.",
  "est.res.advice": "Practical advice",
  "est.res.advice.default": "You can build a working first version with a database, basic dashboard and the core user flow.",
  "est.res.advice.low": "Start with a simpler version: landing + lead capture + manual dashboard. Skip complex login, payments, chat and notifications for now.",
  "est.res.advice.high": "You can consider a richer first version with login, roles, dashboard, payments or notifications — only if they're truly needed.",
  "est.res.ctaMethod": "I want to see the method first",
  "est.res.ctaRoadmap": "Build the full roadmap for €29",
  "est.res.ctaNote": "The full roadmap shows steps, agents, tools, prompts and progress percentages to build the first working version of your app.",

  // Pricing
  "pricing.badge": "AI Team Operational Package",
  "pricing.title": "Activate your operational AI Team",
  "pricing.subtitle":
    "You bring the idea. Your AI agent team organizes it, structures it, and prepares the work to turn it into the first version of your app.",
  "pricing.leadHint": "You activate an AI team ready to work on your project.",
  "pricing.activeBadge": "AI Team active",
  "pricing.opPackBadge": "Operational package",
  "pricing.cardTitle.a": "The ",
  "pricing.cardTitle.b": "Operational AI Team package",
  "pricing.cardDesc": "Activate the AI agent team that works on your idea and helps you turn it into the first version of your app.",
  "pricing.launch": "Launch price",
  "pricing.oneTime": "12 months of access",
  "pricing.accessNote": "Reserved for early users joining the platform now. Single payment, no auto-renewal.",
  "pricing.launchHook": "We just launched — join now at the launch price",
  "pricing.earlyTitle": "Launch price reserved for early users",
  "pricing.earlyBody": "Join now to activate the Operational AI Team for €29 and get 12 months of access to the platform. We're at the beginning: as new features ship, the price will go up.",
  "pricing.valueLine": "Today you get launch conditions. As the platform evolves, this price won't be available anymore.",
  "pricing.bullets.1": "No credit system",
  "pricing.bullets.2": "Clear 12-month access",
  "pricing.bullets.3": "Early access pricing",
  "pricing.bullets.4": "The product keeps growing",
  "pricing.early": "Early access",
  "pricing.earlyLine.a": "Launch price",
  "pricing.earlyLine.b": "reserved for",
  "pricing.earlyLine.c": "early users",
  "pricing.earlyNote.a": "Activate the AI Team now for €29. After this initial phase, the price",
  "pricing.earlyNote.b": "may increase",
  "pricing.longDesc":
    "You don't need to code, design screens or master every tool. You describe what you want to build and set the direction. Your AI team organizes the project, defines features and works for you to build your app.",
  "pricing.slogan.a": "You don't start from zero.",
  "pricing.slogan.b": "You start with a team.",
  "pricing.slogan.sub": "You bring the idea. The AI team prepares the work.",
  "pricing.cta.primary": "Get started with the AI Team - €29",
  "pricing.cta.dashboard": "Go to dashboard",
  "pricing.cta.note": "Single payment · 12 months of access · No auto-renewal.",
  "pricing.cta.secure": "Early access for first users: €29 for 12 months, no credit packs.",
  "pricing.os.title.a": "An operating system ready to ",
  "pricing.os.title.b": "work on your idea",
  "pricing.os.desc.a": "You're activating an AI agent operating system that takes your idea and turns it into a concrete project.",
  "pricing.os.desc.b": "Ready to start?",
  "pricing.compare.title.a": "Alone or with your ",
  "pricing.compare.title.b": "AI team",
  "pricing.compare.alone": "Alone",
  "pricing.compare.with": "With the AI team",
  "pricing.alone.1": "You don't know where to start",
  "pricing.alone.2": "You risk building too many features",
  "pricing.alone.3": "You waste time between tools and prompts",
  "pricing.alone.4": "You don't have a clear roadmap",
  "pricing.with.1": "You start from a clear analysis",
  "pricing.with.2": "You build only what's needed",
  "pricing.with.3": "Prompts and steps are ready to use",
  "pricing.with.4": "You review and approve, they do the work",
  "pricing.final.title.a": "Your ",
  "pricing.final.title.b": "AI Team",
  "pricing.final.title.c": " is ready. Want to activate it?",
  "pricing.final.desc": "Bring your idea. Set the direction. Let the AI agents start turning it into a first app.",
  "pricing.final.active": "Your AI Team is already active.",
  "pricing.final.access": "Launch price reserved for early users. Activate the AI Team now for €29 and get 12 months of platform access with no credit packs.",
  "pricing.final.method": "I want to see the method first →",

  // Pricing — team agents
  "team.strategist.role": "AI Strategist",
  "team.strategist.line": "Analyzes your idea and decides the best starting point.",
  "team.product.role": "Product Agent",
  "team.product.line": "Turns your idea into a clear operational plan.",
  "team.ux.role": "UX Agent",
  "team.ux.line": "Prepares the main screens of your app.",
  "team.logic.role": "Logic Agent",
  "team.logic.line": "Organizes core features, flows and key steps.",
  "team.prompt.role": "Prompt Agent",
  "team.prompt.line": "Creates ready-to-use instructions to build better and faster.",
  "team.build.role": "Build Agent",
  "team.build.line": "Helps you generate the first operational parts of the project.",
  "team.test.role": "Test Agent",
  "team.test.line": "Checks errors, weak points and what to improve.",
  "team.launch.role": "Launch Agent",
  "team.launch.line": "Helps you prepare your app to present, sell or launch it.",
  "team.path.role": "Personal path",
  "team.path.line": "Track the progress of your project.",
  "team.method.role": "Operational method",
  "team.method.line": "Prompts, roadmap and operational instructions guided by the AI Team.",

  // Auth
  "auth.signin": "Sign in",
  "auth.signup": "Create account",
  "auth.signupCta": "Create your account",
  "auth.continueGoogle": "Continue with Google",
  "auth.continueApple": "Continue with Apple",
  "auth.orEmail": "or with email",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordConfirm": "Confirm password",
  "auth.name": "Name",
  "auth.wait": "Please wait...",
  "auth.pwd.length": "At least 8 characters",
  "auth.pwd.upper": "One uppercase letter",
  "auth.pwd.lower": "One lowercase letter",
  "auth.pwd.number": "One number",
  "auth.pwd.special": "One special character (! @ # $ % ^ & * ? _ - .)",
  "auth.pwd.mismatch": "Passwords do not match.",
  "auth.show": "Show password",
  "auth.hide": "Hide password",
  "auth.toast.welcome": "Welcome back!",
  "auth.toast.created": "Account created!",
  "auth.toast.createdConfirm": "Account created! Check your email to confirm, then sign in.",
  "auth.toast.oauthFail": "Sign in failed. Please try again.",
  "auth.err.pwdRules": "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.",
  "auth.err.pwdMatch": "Passwords do not match.",

  // Idea Analysis Dialog
  "iad.badge": "Analysis generated by your AI agent",
  "iad.title.a": "Your idea ",
  "iad.title.b": "analysis",
  "iad.subtitle": "Your AI agent is turning your idea into a first operational plan.",
  "iad.close": "Close",
  "iad.error": "We couldn't generate the analysis. Please try again in a few seconds.",
  "iad.retry": "Retry",
  "iad.degraded": "Analysis generated in fast mode. Some data is approximate: you can regenerate it in a few minutes for the full version.",
  "iad.sect.idea": "Analyzed idea",
  "iad.sect.projectType": "Project type",
  "iad.sect.target": "Target",
  "iad.sect.problem": "Problem solved",
  "iad.sect.solution": "Proposed solution",
  "iad.sect.firstVersion": "Recommended first version",
  "iad.sect.features": "Core features",
  "iad.sect.screens": "Recommended screens",
  "iad.sect.integrations": "Required integrations",
  "iad.sect.hours": "Estimated hours",
  "iad.sect.hoursNote": "For the first working version.",
  "iad.sect.complexity": "Complexity level",
  "iad.sect.tools": "Recommended tools",
  "iad.sect.advice": "Practical advice",
  "iad.sect.adviceBody": "Start from the first working version: let your AI Team prepare structure, features, screens and prompts. Validate the idea with first users before investing in advanced features or external development.",
  "iad.impact.potential": "Potential revenue",
  "iad.impact.potentialDesc": "Turned into a working first version and offered to the right audience, this app could generate recurring revenue.",
  "iad.impact.potentialMicro": "Indicative estimate, not guaranteed, based on a first market hypothesis.",
  "iad.impact.cost": "What it could have cost you",
  "iad.impact.costDesc": "To have this first version designed and built by freelancers, an agency or external developers, the cost could have reached this figure.",
  "iad.impact.savings": "Estimated savings with the AI Team",
  "iad.compareLine": "Before spending thousands to build everything from scratch, you can validate and build the first guided version with your AI Team. This isn't just an estimate: it's the choice between leaving your idea on the shelf and starting today.",
  "iad.footer.authed": "You're already registered: turn this analysis into a new project right away.",
  "iad.footer.guest": "Activate your AI Team to build the guided first version.",
  "iad.cta.generate": "Generate this project",
  "iad.cta.generateHint": "Turn this analysis into an active project in your dashboard.",
  "iad.cta.activate": "Activate the AI Team for €29",
  "iad.cta.activateHint": "One-time launch price. No automatic subscription.",
  "iad.loading.title": "Your AI agent is analyzing the idea…",
  "iad.loading.sub": "We're turning your idea into target, problem, solution, features and screens.",
  "iad.confirm.title": "Close the analysis?",
  "iad.confirm.desc": "The analysis is still in progress. If you close now you might need to relaunch the calculation.",
  "iad.confirm.cancel": "Cancel",
  "iad.confirm.ok": "Close",

  // Riepilogo (results page)
  "rie.empty.badge": "Free analysis",
  "rie.empty.title.a": "We don't have an ",
  "rie.empty.title.b": "idea",
  "rie.empty.title.c": " to analyze yet.",
  "rie.empty.desc": "Go back to the home and write your idea: your AI agent will turn it into a first operational plan.",
  "rie.empty.cta": "Write my idea",
  "rie.hero.badge": "Analysis generated by your AI agent",
  "rie.hero.title.a": "Your idea ",
  "rie.hero.title.b": "analysis",
  "rie.hero.desc": "Your AI agent turned your idea into a first operational plan, so you understand what to build, where to start, and how long it might take.",
  "rie.originalIdea": "Original idea:",
  "rie.firstVerNote.a": "We're talking about the",
  "rie.firstVerNote.b": "first working version",
  "rie.firstVerNote.c": ", not the complete app.",
  "rie.timeEst": "Estimated time",
  "rie.timeEst.note.a": "Indicative time for the",
  "rie.timeEst.note.b": "first working version",
  "rie.timeEst.note.c": ", not for the complete app.",
  "rie.complexity": "Project complexity",
  "rie.agentSect": "What your AI agent will do",
  "rie.agentSect.intro": "Your personal AI agent supports you step by step to turn this analysis into a real app:",
  "rie.agentTask.1": "Sharpens and focuses the idea",
  "rie.agentTask.2": "Removes unnecessary features",
  "rie.agentTask.3": "Builds the operational roadmap",
  "rie.agentTask.4": "Writes prompts to copy and use",
  "rie.agentTask.5": "Designs the screens to create",
  "rie.agentTask.6": "Improves the project step by step",
  "rie.value.eyebrow": "Estimated value of your idea",
  "rie.value.title.a": "How much it could be ",
  "rie.value.title.b": "worth",
  "rie.value.title.c": " and how much it would have ",
  "rie.value.title.d": "cost",
  "rie.value.desc": "Your AI agent estimated the potential value of the idea and what it could have cost you to build from scratch.",
  "rie.value.potential": "Estimated maximum potential",
  "rie.value.potential.note": "Rough estimate based on a working first version, the right target, and the first paying customers.",
  "rie.value.cost": "Estimated cost without AI agents",
  "rie.value.cost.tag": "Build only",
  "rie.value.cost.note": "Rough estimate of what you could have spent to have this first version built by freelancers, an agency or an external developer.",
  "rie.value.compare": "Real comparison",
  "rie.value.compareTitle.a": "Having this app built by professionals could have cost you up to ",
  "rie.value.compareDesc.a": "Today, with ",
  "rie.value.compareDesc.b": ", you can activate your ",
  "rie.value.compareDesc.c": "AI Team",
  "rie.value.compareDesc.d": " and start turning your idea into the ",
  "rie.value.compareDesc.e": "first version of your app",
  "rie.value.withoutLabel": "Estimated cost without AI agents",
  "rie.value.withoutPrefix": "Up to",
  "rie.value.withoutNote": "Rough cost if you outsourced the initial build to freelancers, an agency or an external developer.",
  "rie.value.launchBadge": "AI Team launch price",
  "rie.value.launchPrice": "€29 one-time",
  "rie.value.launchNote": "Get started right away with your operational AI Team and build the guided first version of the project.",
  "rie.value.genProject": "Generate this project",
  "rie.value.activate": "Get started with the AI Team - €29",
  "rie.value.activate.note": "One-time payment. No subscription started automatically.",
  "rie.value.authed.note": "You're already registered: you can turn this analysis into a new project in your account right away.",
  "rie.value.guest.note": "Instant access. You don't get the finished app: you activate your AI Team to start from the idea and build the first version.",
  "rie.value.disclaimer": "Rough estimates. Marketing, servers, maintenance and future evolutions not included.",
  "rie.cta.discover": "Want to see who'll work on your idea?",
  "rie.cta.discoverDesc": "We've prepared the AI Team that can help you turn this idea into a first app: each agent has a precise role and works with the others.",
  "rie.cta.discoverBtn": "Meet the AI Team that will work on your idea",
  "rie.cta.discoverNote": "Meet the team first. Then decide whether to activate it.",
  "rie.footer.disclaimer": "Estimates are indicative and meant to convey the project's order of magnitude. Real results depend on market, price, offer, traffic, sales ability, product quality and execution.",
  "rie.loading.title": "Your AI agent is analyzing the idea…",
  "rie.loading.sub": "We're turning your idea into target, problem, solution, features and screens.",

  // Common
  "common.error": "Something went wrong. Please try again.",
  "common.privacy":
    "Your idea is used only to generate your analysis. We do not publish or share your project without your permission.",
};

const DICTS: Record<Locale, Dict> = { it, en };

const warnedKeys = new Set<string>();

function translate(locale: Locale, key: string): string {
  const dict = DICTS[locale];
  if (dict[key] !== undefined) return dict[key];
  // Fallback to Italian; warn once per missing key.
  const fallback = DICTS.it[key];
  if (fallback === undefined) {
    if (typeof console !== "undefined" && !warnedKeys.has(key)) {
      warnedKeys.add(key);
      console.warn(`[i18n] Missing translation key: "${key}"`);
    }
    return key;
  }
  if (locale !== "it" && typeof console !== "undefined" && !warnedKeys.has(`${locale}:${key}`)) {
    warnedKeys.add(`${locale}:${key}`);
    console.warn(`[i18n] Missing "${locale}" translation for key: "${key}" (using IT fallback)`);
  }
  return fallback;
}

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("it");

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, l);
      }
    } catch {
      // ignore
    }
  };

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => translate(locale, key),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "it" as Locale,
      setLocale: (_l: Locale) => {},
      t: (key: string) => translate("it", key),
    };
  }
  return ctx;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useT();
  const Btn = ({ code, label }: { code: Locale; label: string }) => {
    const active = locale === code;
    return (
      <button
        type="button"
        onClick={() => setLocale(code)}
        aria-pressed={active}
        aria-label={label}
        className={
          "px-2 py-1 text-xs font-semibold rounded-md transition-colors " +
          (active
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/40")
        }
      >
        {label}
      </button>
    );
  };
  return (
    <div
      role="group"
      aria-label="Language"
      className={
        "inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-secondary/30 p-0.5 " +
        className
      }
    >
      <Btn code="it" label="IT" />
      <Btn code="en" label="EN" />
    </div>
  );
}
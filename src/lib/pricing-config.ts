// Centralized pricing + budget-driven scope logic.
// Bump PRICING_VERSION when the math or features change so historical
// runs can be distinguished from new ones.

import type { BudgetBand } from "./idea-estimate";

export const PRICING_VERSION = "v1";
export const PROMPT_VERSION = "v1";

export type BudgetTier = "micro" | "lite" | "starter" | "standard" | "advanced" | "unknown";

export function budgetTier(band: BudgetBand): BudgetTier {
  switch (band) {
    case "0€ – 100€":
    case "100€ – 300€":
      return "micro";
    case "300€ – 700€":
      return "lite";
    case "700€ – 1.500€":
      return "starter";
    case "1.500€ – 3.000€":
      return "standard";
    case "3.000€+":
      return "advanced";
    default:
      return "unknown";
  }
}

export type BudgetScope = {
  tier: BudgetTier;
  recommendedMvpScope: string;
  inScope: string[];
  outOfScope: string[];
  nextStep: string;
};

export type ScopeSignals = {
  ai?: boolean;
  payments?: boolean;
  chat?: boolean;
  notifications?: boolean;
  media?: boolean;
  marketplace?: boolean;
};

// Build a coherent in-scope / out-of-scope list based on the selected budget.
// Same inputs always produce the same scope (deterministic).
export function getBudgetScope(band: BudgetBand, signals: ScopeSignals = {}): BudgetScope {
  const tier = budgetTier(band);
  switch (tier) {
    case "micro":
      return {
        tier,
        recommendedMvpScope:
          "Micro-validazione: landing page, raccolta richieste e un prompt operativo guidato. Nessun backend complesso.",
        inScope: [
          "Landing page con descrizione chiara dell'idea",
          "Form raccolta contatti / lista d'attesa",
          "Mockup o demo statica del prodotto",
          "Prompt operativo per validare l'idea con i primi utenti",
        ],
        outOfScope: [
          "Login utenti e database",
          "Pagamenti online o abbonamenti",
          "Dashboard amministrativa",
          "Chat o notifiche automatiche",
          "Integrazioni API complesse",
        ],
        nextStep:
          "Convalida l'interesse con la landing prima di investire in un MVP completo.",
      };
    case "lite":
      return {
        tier,
        recommendedMvpScope:
          "MVP molto semplice con 1-2 funzioni principali e un flusso essenziale. Nessun sistema avanzato.",
        inScope: [
          "1 o 2 funzioni principali realmente utili",
          "Salvataggio dati base su database",
          "Schermata principale + dettaglio",
          signals.ai ? "Una chiamata AI semplice (testo o suggerimenti)" : "Form di inserimento dati",
        ],
        outOfScope: [
          "Pagamenti online integrati",
          "Più ruoli utente o area admin completa",
          "Notifiche email/SMS/WhatsApp automatiche",
          "Chat in tempo reale",
          "Automazioni complesse o integrazioni multiple",
        ],
        nextStep:
          "Lancia la versione essenziale e raccogli feedback prima di aggiungere funzioni.",
      };
    case "starter":
      return {
        tier,
        recommendedMvpScope:
          "MVP credibile con 2-3 funzioni principali, flusso utente funzionante ed eventuale dashboard semplice.",
        inScope: [
          "Login utenti e database persistente",
          "2 o 3 funzioni principali ben curate",
          "Dashboard semplice per l'utente",
          "Flusso end-to-end dall'inserimento al risultato",
          signals.ai ? "Funzione AI mirata su un singolo task" : "Filtri o ricerca base",
        ],
        outOfScope: [
          "Pagamenti ricorrenti e gestione abbonamenti completa",
          "Più ruoli utente con permessi granulari",
          "Chat realtime tra utenti",
          "Automazioni multi-step su più servizi esterni",
        ],
        nextStep:
          "Lancia l'MVP, misura l'uso reale e decidi se evolvere verso pagamenti o automazioni.",
      };
    case "standard":
      return {
        tier,
        recommendedMvpScope:
          "Prima versione strutturata con autenticazione, database, dashboard, flussi principali e prime automazioni.",
        inScope: [
          "Autenticazione completa e profili utente",
          "Database e dashboard utente strutturata",
          signals.payments ? "Pagamenti online (one-shot o abbonamento)" : "Area gestionale base",
          signals.notifications ? "Notifiche email transazionali" : "Storico azioni utente",
          "Prime automazioni su 1-2 flussi chiave",
          signals.ai ? "Integrazione AI su uno o due flussi" : "Filtri e ricerca avanzata",
        ],
        outOfScope: [
          "Marketplace multi-utente completo",
          "App mobile nativa (iOS/Android dedicate)",
          "Sistema di analytics avanzato custom",
          "Workflow molto complessi multi-ruolo",
        ],
        nextStep:
          "Apri l'MVP a un gruppo ristretto di utenti reali e itera sui flussi più usati.",
      };
    case "advanced":
      return {
        tier,
        recommendedMvpScope:
          "MVP avanzato con più ruoli, pagamenti, dashboard, automazioni, storico e flussi completi.",
        inScope: [
          "Più ruoli utente con permessi differenziati",
          "Pagamenti, abbonamenti e gestione clienti",
          "Dashboard avanzata con storico e metriche",
          "Automazioni su più flussi e integrazioni esterne",
          signals.ai ? "Più funzioni AI integrate nei flussi chiave" : "Reportistica e analytics base",
          signals.notifications ? "Notifiche multi-canale (email/SMS/WhatsApp)" : "Esportazione dati",
        ],
        outOfScope: [
          "App mobile nativa completa (separato)",
          "Funzioni enterprise (SSO, audit log avanzati, multi-tenant complesso)",
          "Marketplace globale con migliaia di venditori",
        ],
        nextStep:
          "Porta l'MVP avanzato sul mercato e investi sull'acquisizione clienti.",
      };
    default:
      return {
        tier,
        recommendedMvpScope:
          "Definisci prima il budget: ti aiuta a scegliere lo scope giusto e non promettere troppo.",
        inScope: [
          "Descrizione chiara dell'idea",
          "Identificazione del target principale",
          "Una prima ipotesi di soluzione",
        ],
        outOfScope: [
          "Stime economiche precise senza budget di riferimento",
        ],
        nextStep: "Scegli un budget per ottenere uno scope realistico.",
      };
  }
}

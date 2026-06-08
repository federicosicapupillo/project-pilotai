# User Flows — IdeaPilot IA

Tutti i flussi descritti riflettono lo stato attuale del codice. Dove indicato "da verificare", il comportamento è plausibile ma non è stato confermato end-to-end in questa documentazione.

## 1. Flusso utente pubblico (visitatore non registrato)

```text
Instagram / TikTok / SEO
        │
        ▼
   Homepage (/)
        │
        ├── Legge hero + valore
        ├── Scrolla sezioni (steps, metodo, casi demo, report esempio, trust)
        └── CTA "Analizza gratis la mia idea"
                  │
                  ▼
         Calcolatore (#calcolatore)
```

Punti chiave:
- Nessun login richiesto per esplorare la homepage e usare il calcolatore.
- Sezioni secondarie pubbliche: `/method`, `/agents`, `/academy`, `/tools`, `/prezzi`.
- Footer + sitemap garantiscono crawlabilità.

## 2. Flusso creazione idea / app (anonimo → registrato)

```text
Calcolatore homepage
        │
        ├── Utente descrive l'idea + budget
        ├── Sistema genera run anonima (idea_calculator_runs)
        ▼
 Riepilogo idea (/riepilogo-idea)
        │
        ├── Mostra report: ore, difficoltà, budget, potenziale, MVP scope
        └── CTA "Salva il report" / "Continua"
                  │
                  ▼
           /auth (signup o login)
                  │
                  ├── Email/password oppure Google
                  ▼
         Trigger handle_new_user → crea profilo
                  │
                  ▼
         Claim run anonima → collega run al user_id
                  │
                  ▼
         Crea progetto (idempotente, anti-duplicati su idea_run_id)
                  │
                  ▼
         Redirect → /dashboard
```

Garanzie:
- Un solo progetto per `idea_run_id` (vedi `new-project.tsx`).
- Lo stato del progetto non viene promosso automaticamente a `in_progress` solo per la creazione o per il click su "Continua costruzione" (vedi logica pagamento sotto).

## 3. Flusso analisi idea (generazione report)

```text
Input utente (testo idea + budget)
        │
        ▼
 IdeaEstimator (client)
        │
        ├── Validazione input
        ▼
 createServerFn: idea-generator / idea-summary
        │
        ├── Chiama Lovable AI Gateway (LOVABLE_API_KEY)
        ├── Applica rate limit (ai_rate_limits)
        ├── Genera: ore, difficoltà, budget op., potenziale, MVP in/out, roadmap
        ▼
 Salva run su idea_calculator_runs
        │
        ▼
 Ritorna report al client → render riepilogo
```

Sicurezza:
- Chiavi AI usate solo lato server.
- Output normalizzato dai formatter in `idea-report-format.ts`.

## 4. Flusso pagamento / sblocco

```text
Dashboard → card progetto → CTA "Continua costruzione"
        │
        ├── Controllo accesso (user_subscriptions)
        │
        ├── NON pagante ─► /prezzi
        │                       │
        │                       ▼
        │              Selezione piano
        │                       │
        │                       ▼
        │         Stripe Embedded Checkout
        │                       │
        │                       ▼
        │        Stripe → /api/public/payments/webhook
        │                       │
        │                       ├── Verifica firma (PAYMENTS_*_WEBHOOK_SECRET)
        │                       ├── Aggiorna user_subscriptions
        │                       └── Promuove progetto (da verificare nel dettaglio)
        │                       │
        │                       ▼
        │              /pagamento-successo
        │                       │
        │                       ▼
        │              Dashboard con accesso sbloccato
        │
        └── Pagante ─► Costruzione operativa progetto (workbook, agenti, roadmap)
```

Note:
- `/pagamento-annullato` e `/pagamento-successo` sono pagine pubbliche di ritorno.
- Webhook è l'unica fonte di verità per attivare il piano (mai dal client).
- Esiste banner test mode quando si è in sandbox.

## 5. Flusso dashboard utente

```text
/dashboard (richiede auth — sotto _authenticated)
        │
        ├── Header con account e logout
        ├── Roadmap riassuntiva (DashboardRoadmap)
        ├── Lista progetti
        │     ├── Stato progetto
        │     ├── CTA "Rivedi report e potenziale stimato" → /account/ideas/$runId
        │     └── CTA "Continua costruzione" → routing pagamento (vedi sopra)
        │
        ├── Accesso a sezioni operative:
        │     ├── /project-manager
        │     ├── /workbook/$projectId
        │     ├── /projects/$id
        │     ├── /agente-ai
        │     ├── /library
        │     └── /academy
        │
        └── Help AI widget sempre disponibile
```

Stato progetto (sintesi):
- `to_create`: progetto creato dopo registrazione, utente non ha ancora avviato la costruzione (o non ha pagato).
- `in_progress`: utente con accesso sbloccato che ha iniziato la costruzione.
- Altri stati: da verificare nel modello dati `projects`.

Area admin:
- `/admin/users` accessibile solo a utenti con ruolo `admin` in `user_roles` (gated da `has_role` lato server).
- Mostra solo numeri aggregati: nessuna PII esposta.
# Features Map — IdeaPilot IA

## Funzioni presenti

### Marketing & acquisizione
- Homepage con hero, eyebrow, CTA primaria/secondaria.
- Calcolatore idea interattivo (`IdeaEstimator`) con output report.
- Sezioni: Steps, Metodo, Vantaggi, Esempi, Per chi, Cosa ricevi, Demo Case Studies, Report di esempio, Flow, Trust, CTA finale, Toolkit riutilizzabile.
- Social proof statistico (`SocialProofStats`).
- Pagine secondarie: `/method`, `/agents`, `/academy`, `/tools`, `/prezzi`, `/pricing`, `/analizza-idea`, `/riepilogo-idea`.
- Sitemap XML, llms.txt, robots.txt.
- i18n IT/EN (copertura completa: da verificare).

### Auth & account
- Registrazione e login email/password.
- Login Google via broker Lovable.
- Profilo creato automaticamente via trigger `handle_new_user`.
- Claim run anonima al primo login (collega report pre-registrazione al profilo).

### Dashboard utente
- Lista progetti con stato (`to_create`, `in_progress`, ecc.).
- Anti-duplicati su `idea_run_id` / `idea_description`.
- CTA "Rivedi report e potenziale stimato" → apre report salvato.
- CTA "Continua costruzione" → routing condizionale: non pagante → pricing, pagante → costruzione.
- Roadmap dashboard riassuntiva.

### Costruzione progetto
- Project Manager AI con log append-only (`project_manager_logs`).
- Roadmap per progetto (`roadmap_items`) con lock anti-modifica (solo stato/note utente modificabili).
- Workbook per progetto.
- Agenti AI con prompt operativi, agent library, tool library.
- Backlog migliorie future.

### Pagamenti
- Pricing page con configurazione centralizzata (`pricing-config.ts`).
- Stripe Embedded Checkout.
- Webhook pubblico `/api/public/payments/webhook` per attivare il piano.
- Tabella `user_subscriptions` con stato piano.
- Modalità sandbox + live (`STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`).

### AI
- Lovable AI Gateway (`LOVABLE_API_KEY`) per generazione idea, analisi, prompt agenti.
- Rate limit AI (`ai_rate_limits`).
- HelpAI widget.

### Admin
- Tabella `user_roles` + funzione `has_role` (pattern anti-recursion RLS).
- Pagina `/admin/users` con contatori aggregati (totali, oggi, 7 giorni, 30 giorni).

### Operatività & affidabilità
- Logging errori (`app_error_logs`) + email throttle.
- Test mode banner pagamenti.
- SSR con error boundary su h3.

## Funzioni da completare

- Verifica end-to-end del flusso pagamento live (webhook → promozione progetto → accesso costruzione). **Priorità: alta.**
- Contenuti Academy completi (lezioni, moduli, progressi utente). **Priorità: media.**
- Agent Library e Tool Library: completare dataset e UI consultazione. **Priorità: media.**
- Workbook: copertura completa delle fasi progetto. **Priorità: media.**
- i18n EN: verifica copertura su tutte le pagine secondarie. **Priorità: media.**
- Email transazionali (welcome, conferma pagamento, recap report). **Priorità: media — da verificare se già configurate.**
- Onboarding guidato post-registrazione. **Priorità: media.**

## Funzioni future

- Dashboard admin estesa: funnel di conversione, MRR, churn, utenti attivi.
- Esportazione report PDF/Notion.
- Condivisione pubblica di un report (link read-only).
- Integrazione con strumenti esterni (Lovable, Figma, GitHub) per passaggio "report → build".
- Community / showcase di idee pubbliche.
- Programma referral / affiliate.
- Versione mobile dedicata (PWA o nativa) — da verificare se in roadmap.
- A/B testing strutturato su homepage e pricing.

## Priorità sintetica

| Priorità | Area |
|----------|------|
| Alta     | Stabilità flusso pagamento, anti-duplicati, sicurezza RLS |
| Alta     | SEO/OG su pagine pubbliche, conversione homepage |
| Media    | Contenuti Academy / Agent / Tool library |
| Media    | i18n EN completa, email transazionali |
| Bassa    | Dashboard admin avanzata, export, condivisione pubblica |
| Bassa    | Community, referral, mobile dedicato |

## Roadmap sprint (proposta — da validare)

### Sprint 1 — Stabilità & conversione
- QA completo flusso anonimo → claim → dashboard → pagamento → costruzione.
- Fix eventuali edge case anti-duplicati.
- Ottimizzazione hero e CTA homepage (copy + CTR).

### Sprint 2 — Contenuti core
- Completamento Academy (almeno 1 modulo end-to-end).
- Agent Library con prompt operativi rivisti.
- Tool Library con almeno 10 strumenti documentati.

### Sprint 3 — Engagement post-registrazione
- Email transazionali (welcome + recap report).
- Onboarding guidato in dashboard.
- Notifiche stato progetto.

### Sprint 4 — Admin & analytics
- Dashboard admin con funnel registrazioni → report → pagamento.
- Export report PDF.
- Eventi di tracking strutturati per conversion.

> Tutti i contenuti di questa sezione sono indicativi e vanno validati con il product owner.
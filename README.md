# IdeaPilot IA

IdeaPilot IA è una piattaforma che trasforma un'idea per un'app in un progetto operativo: l'utente descrive l'idea, riceve un report di analisi (ore, budget, potenziale economico, feature in/out scope, roadmap) e può poi attivare un percorso guidato con agenti AI per costruire la prima versione.

## A cosa serve

- Validare un'idea di app in pochi minuti senza competenze tecniche.
- Capire ore stimate, budget operativo, potenziale di guadagno e priorità delle feature.
- Ottenere una roadmap chiara e un team di agenti AI con prompt operativi pronti.

## Target

- Imprenditori, creator, freelance e PMI senza team tecnico interno.
- Persone con un'idea ma senza un percorso strutturato per realizzarla.
- Utenti che arrivano da traffico freddo (Instagram / TikTok) e cercano una prima valutazione gratuita.

## Funzioni principali

- Calcolatore idea → report (ore, difficoltà, budget, potenziale, MVP scope).
- Registrazione e claim del report anonimo sul profilo utente.
- Dashboard utente con progetti, report salvati e stato avanzamento.
- Pagina prezzi e checkout (Stripe Embedded) per sbloccare la costruzione operativa.
- Team di agenti AI, prompt operativi, roadmap per progetto, workbook.
- Area admin con contatori utenti registrati (totali / oggi / 7 / 30 giorni).

## Stack tecnico

- Frontend: React 19 + TanStack Start v1 + Vite 7.
- Styling: Tailwind CSS v4, design system con token semantici.
- Backend: Lovable Cloud (Supabase) — Postgres, Auth, RLS.
- Server logic: TanStack `createServerFn` + server routes per webhook pubblici.
- AI: Lovable AI Gateway.
- Pagamenti: Stripe (sandbox + live) con webhook su `/api/public/payments/webhook`.
- Deploy: edge runtime (Cloudflare Workers via Lovable).

## Stato attuale

- Homepage marketing con calcolatore, social proof, casi demo, report di esempio.
- Auth email/password + Google.
- Flusso anonimo → claim → dashboard funzionante con protezione anti-duplicati.
- Pricing e checkout attivi (configurazione live/sandbox — da verificare in produzione).
- Area admin base (`/admin/users`) con statistiche di registrazione.
- Sezioni Academy, Agenti, Workbook, Project Manager presenti — livello di completezza per singola sezione: da verificare.

## Istruzioni di avvio

Requisiti: Bun (preferito) o Node 20+.

```bash
bun install
bun run dev
```

L'app gira di default su `http://localhost:5173`.

Variabili d'ambiente principali (gestite da Lovable Cloud, non committate):

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (client)
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server)
- `LOVABLE_API_KEY` (AI Gateway)
- `STRIPE_*` e `PAYMENTS_*_WEBHOOK_SECRET` (pagamenti)

## Note operative

- Le migrazioni database vivono in `supabase/migrations/` e sono read-only: ogni cambio schema = nuova migrazione.
- Tutte le tabelle in `public` hanno RLS abilitata e policy esplicite.
- Il ruolo admin è gestito dalla tabella `user_roles` + funzione `has_role`.
- Gli endpoint pubblici (webhook, cron) vivono sotto `src/routes/api/public/`.
- Il repo è sincronizzato bidirezionalmente con Lovable: ogni push su `main` aggiorna la preview.

## Documentazione

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Features Map](docs/FEATURES_MAP.md)
- [User Flows](docs/USER_FLOWS.md)
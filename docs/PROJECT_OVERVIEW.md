# Project Overview — IdeaPilot IA

## Descrizione completa

IdeaPilot IA è un copilota intelligente per chi ha un'idea di app e vuole capire — in modo concreto, veloce e senza gergo tecnico — se quell'idea può diventare un progetto reale.

Il cuore della piattaforma è un calcolatore che, partendo da una descrizione testuale dell'idea, produce un report operativo: ore di sviluppo stimate, budget operativo, potenziale economico mensile, feature dell'MVP, cosa resta fuori scope, e una roadmap di prossimi passi. L'utente può registrarsi per salvare il report, gestire i propri progetti dalla dashboard e — sbloccando il piano a pagamento — attivare un percorso guidato con agenti AI specializzati (Strategist, UX, Builder, QA, ecc.) e prompt operativi pronti all'uso.

## Obiettivo

Trasformare un'idea confusa in un progetto operativo, riducendo drasticamente il tempo, il costo e l'incertezza tipici della fase "ho un'idea ma non so da dove partire".

## Target

- **Aspiranti founder non tecnici**: hanno un'idea, non sanno valutarla né costruirla.
- **Creator e freelance**: vogliono validare uno strumento digitale legato al proprio pubblico.
- **PMI senza team IT**: vogliono digitalizzare un processo interno senza assumere uno studio.
- **Early adopter curiosi** arrivati da contenuti social (Instagram, TikTok, YouTube).

## Problema che risolve

- Le idee restano bloccate nella testa perché non c'è un metodo per valutarle.
- I preventivi delle agenzie sono opachi e fuori budget per validare un'ipotesi.
- Gli strumenti AI generici (ChatGPT, Claude) non producono un piano strutturato e azionabile.
- Non esiste un percorso chiaro "idea → report → MVP" per chi non è tecnico.

IdeaPilot IA risponde con: input semplice, output strutturato, percorso operativo guidato.

## Posizionamento

- **Non è**: un'agenzia di sviluppo, un no-code builder generico, un altro wrapper ChatGPT.
- **È**: un copilota AI specializzato sulla fase 0–1 di un prodotto digitale, con report iniziale gratuito e percorso a pagamento per la costruzione operativa.
- **Tono**: pragmatico, trasparente sulle stime, niente promesse magiche.

## Stato attuale

- Homepage marketing completa (hero, calcolatore, social proof, casi demo, report di esempio, trust).
- Auth (email/password + Google) e flusso anonimo → claim → dashboard.
- Dashboard utente con progetti, report collegati, anti-duplicati attivi.
- Pricing + checkout Stripe Embedded.
- Agenti AI, prompt library, roadmap per progetto, workbook, academy (livello di completezza per area: da verificare).
- Area admin minima con statistiche utenti registrati.
- Database: tabelle principali (`profiles`, `projects`, `idea_calculator_runs`, `roadmap_items`, `user_roles`, ecc.) con RLS abilitata.

## Prossimi step

- Verificare end-to-end il flusso pagamento live e la promozione automatica del progetto post-pagamento.
- Completare e validare i contenuti di Academy, Agent Library, Tool Library.
- Estendere la dashboard admin: conversion funnel, utenti pagamenti, MRR (da verificare se prioritario).
- Migliorare SEO tecnico delle pagine pubbliche (meta, OG, sitemap già presente).
- Ottimizzare conversione da traffico freddo: A/B su hero, CTA e sezione casi demo.
- Internazionalizzazione completa IT/EN su tutte le pagine (parziale oggi — da verificare).
- Email transazionali e onboarding post-registrazione (da verificare se già attive).
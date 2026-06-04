-- Refine modules 1-4 lessons (Phase 4A)

-- Delete the 5th lesson of each of these modules (we move to 4 lessons each)

DELETE FROM public.course_lessons WHERE module_id = '238289ee-2a94-4abb-a1e4-8c3c430d47a0' AND order_index = 5;

DELETE FROM public.course_lessons WHERE module_id = '9c3b3de1-a27a-45a4-b46a-39bdb7475898' AND order_index = 5;

DELETE FROM public.course_lessons WHERE module_id = 'b17e572c-7208-4a6a-be35-d96dd89474d7' AND order_index = 5;

DELETE FROM public.course_lessons WHERE module_id = '5a4741f2-2ced-4e6b-9f32-8757e000f09f' AND order_index = 5;

UPDATE public.course_lessons SET
  title = $$Da utilizzatore AI a regista di agenti$$,
  description = $$Smetti di chiedere risposte all'AI. Inizia a dirigere agenti con ruoli precisi sul tuo progetto.$$,
  objective = $$Capire che il tuo ruolo non è scrivere prompt a caso, ma dirigere agenti specializzati come un regista dirige attori.$$,
  recommended_agent = $$Agente Stratega$$,
  recommended_tools = $$["ChatGPT"]$$::jsonb,
  prompt_text = $$Agisci come Agente Stratega.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: capire quali decisioni devo prendere io e cosa posso delegare agli agenti AI.
Aiutami a produrre: una mappa con: 3 decisioni che SOLO io posso prendere, 5 attività che posso delegare agli agenti, e per ognuna l'agente più adatto.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Apri ChatGPT, incolla il prompt sopra (già personalizzato sul tuo progetto attivo) e analizza la risposta. Poi scrivi nelle note di questa lezione: 1) cosa vuoi costruire in una frase, 2) perché lo vuoi costruire, 3) cosa NON sai fare da solo, 4) quali parti vuoi delegare agli agenti.$$,
  checklist_items = $$["Ho capito che l'AI non sostituisce la mia direzione", "Ho scritto in una frase cosa voglio costruire", "Ho elencato cosa posso delegare agli agenti", "Ho salvato la mia 'descrizione di regista' nel Workbook (sezione Idea)"]$$::jsonb,
  content = $$## Cosa imparerai
Cosa significa dirigere agenti AI invece di subirli, la differenza tra chiedere una risposta e guidare un processo, come pensare da direttore operativo del tuo progetto.

## Perché è importante
Senza un regista, ogni agente AI tira da una parte diversa e il progetto non avanza. Tu sei l'unico che conosce davvero la visione: l'AI esegue, tu decidi.

## Cosa devi fare adesso
Apri ChatGPT, usa il prompt qui sotto, poi compila l'esercizio. Bastano 15 minuti.

## Errori comuni da evitare
Chiedere all'AI di 'fare tutto'. Cambiare idea ogni volta che l'AI propone qualcosa. Non scrivere mai cosa hai deciso. Trattare ogni chat come se ripartisse da zero.

## Quando puoi passare alla lezione successiva
Quando hai una frase chiara su cosa vuoi costruire e un elenco scritto di cosa deleghi. Senza questo, le lezioni successive saranno confuse.$$,
  updated_at = now()
WHERE module_id = '238289ee-2a94-4abb-a1e4-8c3c430d47a0' AND order_index = 1;

UPDATE public.course_lessons SET
  title = $$Cosa puoi costruire davvero senza programmare$$,
  description = $$Cosa è realistico fare con Lovable + AI oggi, e cosa no. Senza illusioni e senza paura.$$,
  objective = $$Distinguere tra prototipo, MVP e prodotto completo, e capire cosa puoi costruire nella prima versione del TUO progetto.$$,
  recommended_agent = $$Agente Product Manager$$,
  recommended_tools = $$["ChatGPT", "Lovable"]$$::jsonb,
  prompt_text = $$Agisci come Agente Product Manager.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: capire cosa è realistico costruire nella prima versione della mia app con strumenti no-code/AI.
Aiutami a produrre: tre liste sul mio progetto: A) cosa è costruibile subito con Lovable, B) cosa è costruibile dopo aver validato la prima versione, C) cosa è troppo complesso ora e va rimandato o ridisegnato.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Prendi la risposta dell'AI e classifica ogni funzione della tua idea in: 'costruibile subito', 'costruibile dopo', 'troppo complesso per ora', 'da validare prima'. Scrivi tutto nelle note.$$,
  checklist_items = $$["Ho capito la differenza tra prototipo, MVP e prodotto completo", "Ho classificato ogni funzione della mia idea in 4 categorie", "Ho accettato che la prima versione non sarà perfetta", "Ho salvato la classificazione nel Workbook (sezione MVP)"]$$::jsonb,
  content = $$## Cosa imparerai
Cosa si può creare oggi con Lovable + agenti AI, la differenza concreta tra prototipo / MVP / prodotto, quando serve davvero uno sviluppatore.

## Perché è importante
Se parti pensando di costruire 'tutto', non finirai mai. Se sai cosa rimandare, la prima versione esce in giorni invece che mesi.

## Cosa devi fare adesso
Compila la classificazione delle funzioni. Sii brutale: meglio tagliare ora che bloccarsi a metà.

## Errori comuni da evitare
Pensare che 'no-code' significhi 'senza limiti'. Confondere prototipo con prodotto. Voler integrare subito pagamenti, AI complessa, automazioni, notifiche, ruoli, dashboard… tutto insieme.

## Quando puoi passare alla lezione successiva
Quando hai una lista chiara di 3-5 cose 'costruibili subito'. Se sono più di 7, taglia ancora.$$,
  updated_at = now()
WHERE module_id = '238289ee-2a94-4abb-a1e4-8c3c430d47a0' AND order_index = 2;

UPDATE public.course_lessons SET
  title = $$Idea, progetto, MVP, prodotto: non confonderli$$,
  description = $$Avere un'idea non significa avere un'app. Capisci esattamente in che fase sei.$$,
  objective = $$Trasformare la tua idea grezza in 5 fasi distinte: idea → progetto → MVP → prodotto reale → prodotto scalabile.$$,
  recommended_agent = $$Agente Critico$$,
  recommended_tools = $$["ChatGPT", "Claude"]$$::jsonb,
  prompt_text = $$Agisci come Agente Critico.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: capire chiaramente in quale fase è la mia idea e come evolverà nel tempo.
Aiutami a produrre: una tabella a 5 colonne sul mio progetto: Idea grezza | Progetto strutturato | MVP | Prodotto reale | Prodotto scalabile. Per ogni colonna scrivi cosa c'è dentro nel mio caso specifico e cosa manca per passare alla colonna successiva.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Compila la tabella delle 5 fasi sul tuo progetto. Per ognuna scrivi 2 righe: cosa c'è ORA e cosa manca per passare allo stadio successivo.$$,
  checklist_items = $$["Ho compilato tutte e 5 le fasi sul mio progetto", "So in quale fase sono adesso", "So qual è la fase immediatamente successiva", "Ho salvato la tabella nel Workbook (sezione Roadmap)"]$$::jsonb,
  content = $$## Cosa imparerai
Le 5 fasi di vita di un prodotto digitale e dove ti trovi tu oggi.

## Perché è importante
Confondere idea e MVP è il motivo #1 per cui i progetti si bloccano: l'utente prova a costruire il prodotto finale mentre dovrebbe costruire la prima versione testabile.

## Cosa devi fare adesso
Apri Claude o ChatGPT, lancia il prompt, e compila la tabella. Non saltare la colonna 'cosa manca per passare alla fase successiva'.

## Errori comuni da evitare
Saltare la fase 'progetto strutturato' e andare dritto a 'MVP'. Confondere MVP con prodotto finito. Aggiungere caratteristiche da 'prodotto scalabile' nell'MVP.

## Quando puoi passare alla lezione successiva
Quando sai con sicurezza in che fase sei e qual è la prossima.$$,
  updated_at = now()
WHERE module_id = '238289ee-2a94-4abb-a1e4-8c3c430d47a0' AND order_index = 3;

UPDATE public.course_lessons SET
  title = $$Errori da evitare quando lavori con agenti AI$$,
  description = $$Le 7 trappole che bloccano chi inizia con AI + no-code, e le tue regole personali per evitarle.$$,
  objective = $$Scrivere 5 regole operative TUE che guideranno tutto il resto del corso e ti impediranno di entrare in caos.$$,
  recommended_agent = $$Agente Critico$$,
  recommended_tools = $$["ChatGPT", "Obsidian"]$$::jsonb,
  prompt_text = $$Agisci come Agente Critico.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: individuare i rischi del modo in cui sto approcciando il progetto e definire regole personali per evitarli.
Aiutami a produrre: 1) lista dei 5 rischi più probabili nel MIO modo di lavorare, 2) per ogni rischio, una regola operativa concreta da seguire (scritta in prima persona, max 15 parole).

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Scrivi le TUE 5 regole personali per questo progetto (es: 'Non aggiungo funzioni finché non ho validato l'MVP'). Salvale dove le rivedrai spesso (Obsidian, note, Workbook).$$,
  checklist_items = $$["Ho identificato almeno 3 errori che farei se non stessi attento", "Ho scritto 5 regole personali in prima persona", "Le regole sono concrete (non 'sii organizzato')", "Ho salvato le 5 regole nel Workbook (sezione Note operative)"]$$::jsonb,
  content = $$## Cosa imparerai
Gli errori più frequenti: chiedere tutto insieme, cambiare idea ogni giorno, non salvare decisioni, non testare, fidarsi ciecamente dell'AI, aggiungere funzioni prima di validare, non usare agenti specializzati.

## Perché è importante
Questi errori non sono teorici: sono il motivo per cui la maggior parte dei progetti AI/no-code si arena dopo 2 settimane. Le tue regole sono il tuo antidoto.

## Cosa devi fare adesso
Lancia il prompt, leggi i 5 rischi, scrivi le tue 5 regole personali. Devono essere TUE, non copiate.

## Errori comuni da evitare
Scrivere regole generiche tipo 'lavora con metodo'. Scriverle e poi non rileggerle mai. Cambiarle ogni settimana.

## Quando puoi passare alla lezione successiva
Quando hai 5 regole personali scritte e salvate dove le rivedrai prima di ogni sessione di lavoro.$$,
  updated_at = now()
WHERE module_id = '238289ee-2a94-4abb-a1e4-8c3c430d47a0' AND order_index = 4;

UPDATE public.course_lessons SET
  title = $$Descrivere l'idea in una frase semplice$$,
  description = $$Una frase di massimo 20 parole che spiega cosa fai, a chi, perché. Se non ci riesci, l'idea non è ancora pronta.$$,
  objective = $$Scrivere UNA frase chiara, breve e specifica che descriva la tua idea senza giri di parole.$$,
  recommended_agent = $$Agente Stratega$$,
  recommended_tools = $$["ChatGPT"]$$::jsonb,
  prompt_text = $$Agisci come Agente Stratega.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: trasformare la mia idea in una frase di massimo 20 parole che sia chiara anche a chi non la conosce.
Aiutami a produrre: 3 versioni alternative della frase, secondo questa formula: 'Voglio creare [tipo prodotto] per aiutare [target] a ottenere [risultato] senza [problema principale]'. Per ognuna evidenzia cosa funziona e cosa è ancora vago.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Scegli la frase migliore tra le 3 (o combinale). Riscrivila a mano nelle note. Deve stare in ≤20 parole. Mostrala a qualcuno che non conosce il progetto e chiedi: 'cosa pensi che faccia questa app?'.$$,
  checklist_items = $$["Ho una frase di massimo 20 parole", "Contiene chi (target), cosa (prodotto), perché (risultato)", "L'ho testata con almeno una persona che non conosce il progetto", "Ho salvato la frase nel Workbook (sezione Idea)"]$$::jsonb,
  content = $$## Cosa imparerai
La formula da usare e perché funziona: tipo prodotto + target + risultato + problema.

## Perché è importante
Se non puoi spiegarla in una frase, non puoi venderla, validarla, né dirigerla. Tutto il resto del corso si appoggia su questa frase.

## Cosa devi fare adesso
Lancia il prompt, scegli o combina, testa con una persona reale, salva.

## Errori comuni da evitare
Frasi lunghe piene di buzzword ('piattaforma AI-powered per l'ottimizzazione…'). Target vago ('per tutti', 'per chi vuole crescere'). Verbo astratto ('migliora', 'ottimizza', 'rivoluziona').

## Quando puoi passare alla lezione successiva
Quando una persona estranea, dopo aver letto la frase, ti ripete con parole sue cosa fa l'app e ci azzecca.$$,
  updated_at = now()
WHERE module_id = '9c3b3de1-a27a-45a4-b46a-39bdb7475898' AND order_index = 1;

UPDATE public.course_lessons SET
  title = $$Capire a chi serve davvero$$,
  description = $$Scegli UN target primario. Non 'tutti'. Non 'aziende'. Una persona specifica.$$,
  objective = $$Definire il target principale, i primi utenti ideali, chi pagherebbe, e — fondamentale — chi NON è il target ora.$$,
  recommended_agent = $$Agente Validatore$$,
  recommended_tools = $$["ChatGPT", "Perplexity"]$$::jsonb,
  prompt_text = $$Agisci come Agente Validatore.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: scegliere un target primario specifico per la mia prima versione.
Aiutami a produrre: 4 sezioni: 1) Target principale (descrizione concreta: ruolo, contesto, età, situazione), 2) Primi 10 utenti ideali (chi sono, dove li trovo), 3) Chi pagherebbe davvero (e quanto), 4) Chi NON è il target ora e perché.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Compila le 4 sezioni nelle note. Poi rispondi a voce: 'se domani dovessi trovare 3 persone reali a cui mostrare l'app, dove le cercherei?'. Se non sai rispondere, il target è ancora troppo vago.$$,
  checklist_items = $$["Ho un target principale descritto in 2-3 righe concrete", "So dove trovare i primi 10 utenti reali", "So chi pagherebbe (e quanto, indicativamente)", "Ho scritto chi NON è il target ora", "Ho salvato tutto nel Workbook (sezione Target)"]$$::jsonb,
  content = $$## Cosa imparerai
Perché 'tutti' è il peggior target possibile, come scegliere un target primario, differenza tra utente, cliente e pagante.

## Perché è importante
Senza un target specifico ogni decisione di prodotto è arbitraria. Con un target chiaro, il 70% delle decisioni si risponde da sole.

## Cosa devi fare adesso
Lancia il prompt, compila le 4 sezioni, fai il test 'dove trovo 3 persone reali'.

## Errori comuni da evitare
Mettere 'PMI' o 'professionisti' senza specificare. Includere 5 target diversi 'perché tanto serve a tutti'. Confondere utente che usa con utente che paga.

## Quando puoi passare alla lezione successiva
Quando puoi nominare almeno 3 persone reali (anche solo nomi di profili LinkedIn) che corrispondono al tuo target.$$,
  updated_at = now()
WHERE module_id = '9c3b3de1-a27a-45a4-b46a-39bdb7475898' AND order_index = 2;

UPDATE public.course_lessons SET
  title = $$Problema, soluzione, risultato$$,
  description = $$Lega problema concreto → soluzione specifica → risultato misurabile. Senza questo collegamento, l'idea non sta in piedi.$$,
  objective = $$Creare la scheda problema/soluzione/risultato del tuo progetto, con dati concreti e verificabili.$$,
  recommended_agent = $$Agente Product Manager$$,
  recommended_tools = $$["ChatGPT", "Claude"]$$::jsonb,
  prompt_text = $$Agisci come Agente Product Manager.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: definire chiaramente problema, soluzione e risultato promesso dal mio progetto.
Aiutami a produrre: una scheda con 4 blocchi: 1) Problema concreto (cosa fa oggi il target per gestire questo problema, e perché è doloroso), 2) Soluzione proposta (cosa fa la mia app, in massimo 3 punti), 3) Risultato misurabile (cosa cambia per l'utente: tempo, soldi, stress, errori), 4) Perché ora (perché dovrebbero usarla oggi e non tra 6 mesi).

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Compila la scheda. Per il risultato, sii numerico: 'risparmia 2 ore a settimana', 'riduce 80% errori di trascrizione', non 'migliora la produttività'.$$,
  checklist_items = $$["Il problema è concreto e descritto dal punto di vista dell'utente", "La soluzione sta in 3 punti massimo", "Il risultato è misurabile (numeri, tempi, soldi)", "Ho una risposta convincente al 'perché ora'", "Ho salvato la scheda nel Workbook (sezioni Problema, Soluzione, Risultato)"]$$::jsonb,
  content = $$## Cosa imparerai
Il triangolo problema-soluzione-risultato e come ogni vertice si verifica.

## Perché è importante
Le prime conversazioni con utenti reali, gli investitori, le pagine di vendita: tutto si basa su questa scheda.

## Cosa devi fare adesso
Lancia il prompt, compila la scheda, rendi misurabile il risultato.

## Errori comuni da evitare
Problemi generici ('le aziende sono inefficienti'). Soluzioni che sono in realtà funzioni ('una dashboard'). Risultati senza numeri.

## Quando puoi passare alla lezione successiva
Quando la scheda regge alla domanda 'e quindi?' ripetuta 3 volte di fila.$$,
  updated_at = now()
WHERE module_id = '9c3b3de1-a27a-45a4-b46a-39bdb7475898' AND order_index = 3;

UPDATE public.course_lessons SET
  title = $$Ridurre l'idea a una prima versione costruibile$$,
  description = $$Taglia. Poi taglia ancora. La prima versione deve essere imbarazzantemente piccola.$$,
  objective = $$Definire la prima versione semplificata della tua idea, quella che potresti costruire e mostrare in 1-2 settimane.$$,
  recommended_agent = $$Agente MVP Specialist$$,
  recommended_tools = $$["ChatGPT"]$$::jsonb,
  prompt_text = $$Agisci come Agente MVP Specialist.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: ridurre la mia idea a una prima versione minima realmente costruibile in 1-2 settimane.
Aiutami a produrre: 1) Lista delle funzioni attualmente immaginate, 2) Per ognuna: tieni / rimanda / elimina (con motivo), 3) La descrizione della prima versione semplificata in 5 righe, 4) Cosa potrai imparare da questa prima versione.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Riscrivi nelle note la descrizione della prima versione in 5 righe. Deve avere MASSIMO 3 funzioni principali. Se sono 4, ne togli una.$$,
  checklist_items = $$["Ho una descrizione della prima versione in 5 righe", "Ha massimo 3 funzioni principali", "So cosa imparerò mostrandola ai primi utenti", "Ho salvato la prima versione nel Workbook (sezione MVP)"]$$::jsonb,
  content = $$## Cosa imparerai
Il principio del 'taglia il 50% e poi taglia ancora', e come riconoscere le funzioni che sembrano essenziali ma non lo sono.

## Perché è importante
Una prima versione piccola si costruisce, una grande si rimanda all'infinito. L'unica versione che genera apprendimento è quella che esiste.

## Cosa devi fare adesso
Lancia il prompt, classifica le funzioni, riscrivi la prima versione in 5 righe con massimo 3 funzioni.

## Errori comuni da evitare
Tenere funzioni 'perché non costa nulla aggiungerle'. Includere login social, notifiche, analytics, ruoli, esportazioni nell'MVP. Pensare che 'minimo' significhi 'fatto male'.

## Quando puoi passare alla lezione successiva
Quando la descrizione della prima versione sta in 5 righe e ha 3 funzioni o meno.$$,
  updated_at = now()
WHERE module_id = '9c3b3de1-a27a-45a4-b46a-39bdb7475898' AND order_index = 4;

UPDATE public.course_lessons SET
  title = $$Trovare competitor con Perplexity$$,
  description = $$I competitor non sono solo app uguali alla tua. Sono tutti i modi in cui oggi le persone risolvono lo stesso problema.$$,
  objective = $$Mappare competitor diretti, indiretti e alternative manuali al tuo prodotto.$$,
  recommended_agent = $$Agente Ricercatore$$,
  recommended_tools = $$["Perplexity"]$$::jsonb,
  prompt_text = $$Agisci come Agente Ricercatore.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: trovare tutti i competitor reali del mio progetto, non solo le app simili.
Aiutami a produrre: 4 liste con almeno 3 voci ciascuna: 1) Competitor diretti (app/SaaS che fanno la stessa cosa), 2) Competitor indiretti (prodotti diversi ma che risolvono lo stesso problema), 3) Alternative manuali (Excel, WhatsApp, agenzie, consulenti, processi manuali), 4) 'Non fare nulla' (perché molte persone semplicemente convivono con il problema). Per ogni voce: nome, link, in 1 riga cosa fa, punto forte, punto debole.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Apri Perplexity, lancia il prompt, copia il risultato nelle note. Aggiungi tu almeno 1 alternativa manuale che l'AI non ha visto.$$,
  checklist_items = $$["Ho almeno 3 competitor diretti", "Ho almeno 3 alternative manuali (non solo app)", "Ho considerato il 'non fare nulla' come opzione reale", "Per ogni competitor ho punto forte + punto debole", "Ho salvato la mappa nel Workbook (sezione Competitor)"]$$::jsonb,
  content = $$## Cosa imparerai
Perché Excel e WhatsApp sono i competitor più forti, e come riconoscere alternative invisibili.

## Perché è importante
Se non conosci i competitor reali, ricostruisci qualcosa che esiste già o, peggio, qualcosa che le persone hanno già scartato.

## Cosa devi fare adesso
Apri Perplexity, lancia il prompt, integra a mano almeno 1 alternativa manuale.

## Errori comuni da evitare
Considerare solo app patinate come competitor. Ignorare i processi manuali. Dire 'non ho competitor' (vuol dire che non c'è mercato, o che non hai cercato).

## Quando puoi passare alla lezione successiva
Quando hai una mappa con almeno 8 voci totali e per ognuna sai dire forte/debole.$$,
  updated_at = now()
WHERE module_id = 'b17e572c-7208-4a6a-be35-d96dd89474d7' AND order_index = 1;

UPDATE public.course_lessons SET
  title = $$Capire se esiste domanda$$,
  description = $$Prima di costruire, verifica che il problema sia abbastanza doloroso da farlo risolvere a qualcuno.$$,
  objective = $$Trovare prove concrete che esiste domanda reale per quello che vuoi costruire.$$,
  recommended_agent = $$Agente Business Analyst$$,
  recommended_tools = $$["Perplexity", "ChatGPT"]$$::jsonb,
  prompt_text = $$Agisci come Agente Business Analyst.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: trovare prove concrete che esiste domanda reale per il mio progetto.
Aiutami a produrre: 5 tipi di prove con esempi reali e link dove possibile: 1) Ricerche Google rilevanti (con keyword), 2) Discussioni in forum/community (Reddit, Facebook, LinkedIn), 3) Aziende che già pagano per soluzioni simili, 4) Trend di mercato (in crescita/calo), 5) Casi d'uso reali documentati. Alla fine: un giudizio onesto su quanto è forte la domanda (debole / media / forte) e perché.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Apri Perplexity, lancia il prompt, salva le prove. Poi cerca tu su Reddit o LinkedIn UNA discussione reale di persone che parlano del problema. Incollala nelle note.$$,
  checklist_items = $$["Ho almeno 3 ricerche Google rilevanti", "Ho trovato almeno 1 discussione reale in una community", "So se aziende pagano già per soluzioni simili", "Ho un giudizio onesto sulla forza della domanda", "Ho salvato le prove nel Workbook (sezione Validazione)"]$$::jsonb,
  content = $$## Cosa imparerai
Dove cercare prove di domanda reale (Google Trends, Reddit, forum di settore, ProductHunt, ricerche LinkedIn).

## Perché è importante
Costruire senza domanda significa costruire per nessuno. Una pomeriggio di ricerca onesta evita mesi di lavoro inutile.

## Cosa devi fare adesso
Lancia il prompt, cerca tu almeno una discussione reale, scrivi il tuo giudizio onesto sulla forza della domanda.

## Errori comuni da evitare
Cercare conferme invece di smentite. Accontentarsi di 'il mercato è grande'. Confondere interesse generico con disponibilità a pagare.

## Quando puoi passare alla lezione successiva
Quando hai almeno 3 prove concrete e un giudizio onesto (anche 'debole' va bene: lo sai prima).$$,
  updated_at = now()
WHERE module_id = 'b17e572c-7208-4a6a-be35-d96dd89474d7' AND order_index = 2;

UPDATE public.course_lessons SET
  title = $$Analizzare punti deboli della tua idea$$,
  description = $$Cerca le crepe ora, prima che le trovi il mercato. È la lezione più scomoda e più utile.$$,
  objective = $$Mettere in discussione la tua idea con un agente critico per scoprire rischi e assunzioni nascoste.$$,
  recommended_agent = $$Agente Critico$$,
  recommended_tools = $$["Claude", "ChatGPT"]$$::jsonb,
  prompt_text = $$Agisci come Agente Critico.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: individuare onestamente i punti deboli della mia idea prima di iniziare a costruirla.
Aiutami a produrre: 1) 5 assunzioni che sto facendo senza prove, 2) 5 rischi concreti (mercato, tecnologia, esecuzione, soldi, tempi), 3) 3 motivi per cui questa idea potrebbe fallire, 4) Per ogni rischio: come potrei verificarlo in massimo 1 settimana.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Leggi la risposta dell'AI senza difenderti. Per ogni rischio scrivi nelle note: 'come lo verifico questa settimana?'. Se non sai rispondere, il rischio resta lì e ti farà male dopo.$$,
  checklist_items = $$["Ho letto le critiche senza difendermi", "Ho una lista di almeno 5 rischi concreti", "Per ogni rischio so come potrei verificarlo", "Ho scelto 2 rischi da verificare subito", "Ho salvato rischi e assunzioni nel Workbook (sezione Rischi)"]$$::jsonb,
  content = $$## Cosa imparerai
Come usare un 'agente critico' senza farsi scoraggiare, differenza tra rischio (probabile) e assunzione (da verificare).

## Perché è importante
Ogni rischio non affrontato ora diventa un problema costoso dopo. Meglio scoprirlo a costo zero adesso.

## Cosa devi fare adesso
Usa Claude o ChatGPT, lancia il prompt, accetta le critiche, scegli 2 rischi da verificare subito.

## Errori comuni da evitare
Cercare conforto invece di critiche vere. Difendersi davanti all'AI. Salvare i rischi e poi ignorarli.

## Quando puoi passare alla lezione successiva
Quando hai almeno 5 rischi scritti e 2 che inizi a verificare nella settimana.$$,
  updated_at = now()
WHERE module_id = 'b17e572c-7208-4a6a-be35-d96dd89474d7' AND order_index = 3;

UPDATE public.course_lessons SET
  title = $$Scegliere una nicchia iniziale$$,
  description = $$Non parti per tutti. Parti per un sottoinsieme così piccolo da poterlo raggiungere a mano.$$,
  objective = $$Scegliere una nicchia iniziale specifica da cui partire per la prima versione del prodotto.$$,
  recommended_agent = $$Agente Stratega$$,
  recommended_tools = $$["ChatGPT", "Perplexity"]$$::jsonb,
  prompt_text = $$Agisci come Agente Stratega.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: scegliere una nicchia iniziale piccola e raggiungibile per partire.
Aiutami a produrre: 1) 3 possibili nicchie iniziali partendo dal mio target generale (per settore, ruolo, dimensione, geografia, contesto), 2) Per ognuna: dimensione stimata, dove trovo queste persone, perché potrebbero essere i primi adottanti, 3) Suggerimento finale: quale nicchia consigli e perché.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Scegli UNA nicchia. Scrivi nelle note: 'la mia prima versione è per [nicchia precisa]'. Scrivi anche 3 luoghi reali dove troverai queste persone (un gruppo LinkedIn, una community, un evento, un partner).$$,
  checklist_items = $$["Ho scelto UNA sola nicchia iniziale", "La nicchia è descritta in modo specifico (non 'PMI italiane')", "Conosco 3 luoghi dove trovare queste persone", "Ho salvato la nicchia nel Workbook (sezione Target)"]$$::jsonb,
  content = $$## Cosa imparerai
Perché nicchie piccole vincono in fase iniziale, come passare da target generico a nicchia operativa.

## Perché è importante
Una nicchia chiara rende possibili le prime 10 conversazioni reali con utenti. Senza nicchia, non sai nemmeno chi chiamare.

## Cosa devi fare adesso
Lancia il prompt, scegli UNA nicchia, identifica 3 luoghi reali dove trovarla.

## Errori comuni da evitare
Sceglierne 3 'per sicurezza'. Scegliere una nicchia troppo grande ('startup italiane'). Non sapere dove trovare le persone della nicchia.

## Quando puoi passare alla lezione successiva
Quando puoi completare la frase: 'questa settimana cerco 5 persone della nicchia X nel posto Y'.$$,
  updated_at = now()
WHERE module_id = 'b17e572c-7208-4a6a-be35-d96dd89474d7' AND order_index = 4;

UPDATE public.course_lessons SET
  title = $$Cos'è davvero un MVP$$,
  description = $$MVP non significa 'app brutta'. Significa 'app minima per imparare qualcosa di vero'.$$,
  objective = $$Definire l'MVP del tuo progetto: l'unica versione che ti farà imparare se l'idea funziona davvero.$$,
  recommended_agent = $$Agente Product Manager$$,
  recommended_tools = $$["ChatGPT"]$$::jsonb,
  prompt_text = $$Agisci come Agente Product Manager.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: definire l'MVP del mio progetto come strumento di apprendimento, non come 'prodotto piccolo'.
Aiutami a produrre: 1) Definizione operativa dell'MVP per il MIO progetto in 4 righe, 2) Quale singola ipotesi voglio verificare con l'MVP, 3) Quale comportamento dell'utente mi dimostrerà che l'ipotesi è vera, 4) Cosa NON deve esserci nell'MVP (anche se sarebbe bello).

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Scrivi nelle note: 'il mio MVP serve a verificare che [ipotesi]. Lo capirò se gli utenti [comportamento]'. Una frase, 25 parole massime.$$,
  checklist_items = $$["Ho una definizione dell'MVP del mio progetto in 4 righe", "So qual è l'ipotesi che voglio verificare", "So quale comportamento mi dirà che l'ipotesi è vera", "Ho salvato la definizione MVP nel Workbook (sezione MVP)"]$$::jsonb,
  content = $$## Cosa imparerai
MVP come esperimento di apprendimento, non come prodotto in miniatura. Cosa significa 'minimo' e cosa 'viable'.

## Perché è importante
Senza un'ipotesi chiara, costruisci a casaccio e non saprai se l'MVP è andato bene o male.

## Cosa devi fare adesso
Lancia il prompt, scrivi la frase ipotesi+comportamento, salvala.

## Errori comuni da evitare
Pensare 'MVP = prodotto fatto male'. Non avere un'ipotesi da verificare. Dichiarare l'MVP 'riuscito' solo perché è stato pubblicato.

## Quando puoi passare alla lezione successiva
Quando hai una frase chiara su cosa vuoi imparare dall'MVP e come capirai il risultato.$$,
  updated_at = now()
WHERE module_id = '5a4741f2-2ced-4e6b-9f32-8757e000f09f' AND order_index = 1;

UPDATE public.course_lessons SET
  title = $$Scegliere le funzioni essenziali$$,
  description = $$Must-have, nice-to-have, future. Tre liste. Niente di mezzo.$$,
  objective = $$Classificare ogni funzione possibile in must-have, nice-to-have, future, per costruire solo le must-have.$$,
  recommended_agent = $$Agente MVP Specialist$$,
  recommended_tools = $$["ChatGPT", "Claude"]$$::jsonb,
  prompt_text = $$Agisci come Agente MVP Specialist.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: classificare tutte le funzioni possibili del mio progetto in must-have, nice-to-have, future.
Aiutami a produrre: una tabella a 3 colonne (Must-have / Nice-to-have / Future) con tutte le funzioni del progetto, e per ogni 'must-have' una giustificazione: senza questa funzione l'MVP non può verificare l'ipotesi.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$La colonna Must-have deve avere MASSIMO 5 voci. Se sono di più, sposta in nice-to-have. Riscrivi a mano la lista finale must-have nelle note.$$,
  checklist_items = $$["Ho una tabella a 3 colonne completa", "Le funzioni must-have sono massimo 5", "Ogni must-have ha una giustificazione legata all'ipotesi MVP", "Ho salvato la lista must-have nel Workbook (sezione MVP)"]$$::jsonb,
  content = $$## Cosa imparerai
Il criterio rigoroso per definire 'must-have' (senza questa, l'MVP non verifica l'ipotesi).

## Perché è importante
Più funzioni = più tempo, più bug, più costo, più ritardo nel feedback reale. Le must-have sono il filtro più importante del progetto.

## Cosa devi fare adesso
Lancia il prompt, classifica, taglia la colonna must-have a 5 massimo.

## Errori comuni da evitare
Mettere 'login social' o 'profilo utente' tra i must-have per abitudine. Includere 'analytics' nell'MVP. Confondere 'utile' con 'essenziale'.

## Quando puoi passare alla lezione successiva
Quando la lista must-have ha 5 voci o meno e ognuna è giustificata.$$,
  updated_at = now()
WHERE module_id = '5a4741f2-2ced-4e6b-9f32-8757e000f09f' AND order_index = 2;

UPDATE public.course_lessons SET
  title = $$Decidere cosa NON costruire subito$$,
  description = $$L'elenco delle cose che NON farai è più importante di quello delle cose che farai. È la tua difesa contro lo scope creep.$$,
  objective = $$Creare la lista 'anti-scope-creep': tutto ciò che NON costruirai in questa prima versione, con motivo.$$,
  recommended_agent = $$Agente Critico$$,
  recommended_tools = $$["ChatGPT"]$$::jsonb,
  prompt_text = $$Agisci come Agente Critico.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: decidere chiaramente cosa NON costruirò nella prima versione del mio MVP.
Aiutami a produrre: una lista 'NOT NOW' con almeno 10 voci di funzioni / sezioni / integrazioni che sarebbero belle ma NON entreranno nell'MVP. Per ognuna: nome funzione + 1 riga di motivo + quando potrebbe rientrare (mai / dopo validazione / V2).

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Stampa o tieni visibile la lista 'NOT NOW'. Ogni volta che pensi 'però potrei aggiungere…', controlla se è nella lista. Se sì: non aggiungere.$$,
  checklist_items = $$["Ho una lista NOT NOW con almeno 10 voci", "Per ognuna ho il motivo e il 'quando rientra'", "Ho deciso almeno 3 cose che NON costruirò MAI", "Ho salvato la lista NOT NOW nel Workbook (sezione MVP, sotto-sezione 'Fuori scope')"]$$::jsonb,
  content = $$## Cosa imparerai
Lo scope creep: come riconoscerlo, perché è il killer #1 dei progetti, come prevenirlo con una lista NOT NOW.

## Perché è importante
Le funzioni che aggiungi 'al volo' sono il 90% delle ore perse. Una lista NOT NOW visibile ti salva da te stesso.

## Cosa devi fare adesso
Lancia il prompt, riempi la lista, tienila visibile.

## Errori comuni da evitare
Non scrivere una lista NOT NOW ('tanto mi ricordo'). Tenerla in un file che non apri mai. Aggiungere comunque le funzioni 'tanto è veloce'.

## Quando puoi passare alla lezione successiva
Quando hai una lista visibile con almeno 10 voci e ti dà fastidio quanto è lunga.$$,
  updated_at = now()
WHERE module_id = '5a4741f2-2ced-4e6b-9f32-8757e000f09f' AND order_index = 3;

UPDATE public.course_lessons SET
  title = $$Creare la prima roadmap$$,
  description = $$5-7 step concreti da qui all'MVP testato. Niente di più, niente di meno.$$,
  objective = $$Trasformare tutto il lavoro dei moduli 1-4 in una roadmap di 5-7 step operativi.$$,
  recommended_agent = $$Agente Product Manager$$,
  recommended_tools = $$["ChatGPT", "Obsidian"]$$::jsonb,
  prompt_text = $$Agisci come Agente Product Manager.

Sto lavorando al progetto: [progetto].
Descrizione: [descrizione].
Target: [target].
Problema: [problema].
Soluzione: [soluzione].

Il mio obiettivo in questa lezione è: trasformare tutto quello che ho deciso finora in una roadmap concreta di 5-7 step fino all'MVP testato.
Aiutami a produrre: una roadmap numerata di 5-7 step, ognuno con: titolo, output concreto, tempo stimato (in giorni), tool da usare, agente da chiamare. La roadmap deve coprire: chiarire idea (già fatto), definire schermate, definire dati, creare prompt per Lovable, costruire prima versione, testare con utenti reali, correggere.

Prima controlla le mie assunzioni e dimmi cosa non torna.
Poi proponi una versione semplice, concreta e realizzabile.
Evita teoria generica e frasi astratte.
Scrivi in modo chiaro per una persona non tecnica.

Alla fine dammi sempre, in questo ordine:
1) Risultato finale (pronto da copiare)
2) Rischi e assunzioni da verificare
3) Cosa salvare nel Workbook
4) Prossimo passo operativo.$$,
  exercise_text = $$Riscrivi la roadmap nelle note in 5-7 righe numerate. Per ogni step indica una data realistica. Mettila in cima al Workbook.$$,
  checklist_items = $$["Ho una roadmap di 5-7 step (non di più)", "Per ogni step ho tempo stimato e tool", "Ho una data realistica per ogni step", "La roadmap finisce con 'testato con utenti reali', non con 'pubblicato'", "Ho salvato la roadmap nel Workbook (sezione Roadmap, in cima)"]$$::jsonb,
  content = $$## Cosa imparerai
Come si scrive una roadmap operativa (non una lista di desideri), perché finire la roadmap con 'test utenti' e non 'lancio'.

## Perché è importante
Senza roadmap, ogni giorno reinventi cosa fare. Con la roadmap, sai sempre qual è il prossimo passo concreto.

## Cosa devi fare adesso
Lancia il prompt, riscrivi a mano in 5-7 step con date, mettila in cima al Workbook.

## Errori comuni da evitare
Roadmap di 15 step (è una lista di task, non una roadmap). Step vaghi ('migliorare prodotto'). Roadmap che finisce con 'pubblicato su Product Hunt' invece che 'testato con 5 utenti'.

## Quando puoi passare alla lezione successiva
Quando hai una roadmap stampabile in mezza pagina con date realistiche.$$,
  updated_at = now()
WHERE module_id = '5a4741f2-2ced-4e6b-9f32-8757e000f09f' AND order_index = 4;

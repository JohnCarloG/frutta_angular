# Registro degli studenti

Esercitazione **03.14 — Servizi: il registro degli studenti**, in una cartella Angular autonoma. I progetti `angular-fruit` e `hamburgeria-servizi` restano separati.

## Avvio

Richiede Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` e npm 11.19.0.

```bash
cd registro-studenti
npm ci
npm start -- --port 4202
```

Sul tuo computer apri `http://localhost:4202`; in un editor remoto inoltra la porta 4202. La porta è diversa da quelle degli altri due progetti.

Nell'ambiente cloud la cartella completa è `/workspace/frutta_angular/registro-studenti`. Per usare npm 11.19.0 già installato sostituisci `npm` con `node /workspace/.cloud-tools/npm-11.19.0/node_modules/npm/bin/npm-cli.js`. Se serve una cache scrivibile imposta `npm_config_cache=/workspace/.npm-cache`.

```bash
npm run build
npm test -- --watch=false
npm test -- --include src/app/services --watch=false
```

## Funzioni e struttura

- `modelli/studente.ts`: interfaccia Studente.
- `services/studenti-service.ts`: `@Service()`, signal privato, lettura tramite `asReadonly()`, quantità, migliore, aggiunta, eliminazione, ricerca, successivo e modifica.
- `/home`: totale e scheda dello studente con media più alta, senza azioni.
- `/elenco`: tabella con medie verdi/rosse, filtro per classe con `ngModel` e `computed`, dettaglio, modifica e rimozione.
- `/inserimento`: form con campi obbligatori, media da 1 a 10 e redirect all'elenco dopo il salvataggio. Sono rifiutati anche nome o classe costituiti soltanto da spazi.
- `/elenco/:id`: scheda riutilizzabile con input e output, navigazione circolare allo studente successivo e redirect se l'id non esiste.
- `/modifica/:id`: copia dei dati nel form; salvataggio tramite il servizio e ritorno al dettaglio.
- Radice e URL sconosciuti: redirect alla home.

Bootstrap 5.3.8 è incluso localmente tramite `angular.json`, senza CDN o backend. Il progetto usa Angular 22, TypeScript in modalità strict e Vitest.

## Prove in autonomia

1. **Media della classe:** computed sul gruppo filtrato, protezione dalla divisione per zero, due decimali. Per 4A: `7.30`. Se non ci sono studenti la media non viene mostrata.
2. **Ordinamento:** pulsanti Per nome e Per media; `visibili` ordina una copia, senza modificare l'elenco del servizio.
3. **Modifica:** `aggiorna` usa `map` e sostituisce solo lo studente con lo stesso id. Il form non cambia il servizio finché non salvi. La sottoscrizione a `paramMap` funziona anche passando direttamente tra due URL di modifica.

## Verifica manuale

1. La home mostra 5 studenti e Marco Verdi, media 8.2, senza pulsante di rimozione.
2. Nell'elenco Sara Rossi e Paolo Russo hanno medie rosse. Filtra `4a`: restano Marco e Giulia, media `7.30`. Con `5C` appare l'avviso; con filtro vuoto tornano tutti.
3. Ordina per media: Marco è primo. Elimina Sara e torna alla home: il contatore scende a 4.
4. Con nome vuoto, soli spazi o media 11, Salva è disabilitato. Inserisci uno studente valido: torna all'elenco e ottiene id 6 anche dopo aver eliminato Sara.
5. Apri il dettaglio; Studente successivo aggiorna la scheda e dopo l'ultimo torna al primo. Rimuovi dal registro elimina lo studente e torna all'elenco. `/elenco/99` rimanda all'elenco.
6. Modifica nome, classe e media, poi salva: il dettaglio e la home mostrano i nuovi dati. Annulla non salva.
7. Elimina tutti: home ed elenco gestiscono il registro vuoto. Un nuovo inserimento riparte dall'id 1, secondo l'algoritmo massimo degli id attualmente presenti + 1 del laboratorio.

I dati restano durante la navigazione ma **si ripristinano ai cinque studenti iniziali ricaricando la pagina**: il servizio vive in memoria, come richiesto.

La cronologia contiene gli otto commit dei passi e un commit per ogni livello “Prova tu”. Le [dieci risposte](RISPOSTE.md) sono nella radice di questo progetto. La consegna a Classroom e la creazione di un repository GitHub nominativo sono operazioni esterne non eseguite da questa esercitazione.

## Verifiche automatiche

Build di produzione completata. Suite Vitest: **18 test passati in 3 file**, con controlli sul servizio, sugli input/output della card e sui flussi delle pagine con DOM e routing. Questi controlli non sostituiscono una prova visuale nel browser.

La build segnala un avviso sul bundle iniziale: 523,39 kB contro la soglia di avviso di 500 kB, per Angular e Bootstrap completo. La soglia di errore di 1 MB è rispettata; le soglie originali restano invariate.

# HTTP e API REST — Cose da fare

Progetto Angular autonomo per la dispensa **03.15**, nella cartella `http-api-rest`. Gli altri progetti del repository restano separati.

## Avvio

Richiede Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` e npm 11.19.0.

```bash
cd http-api-rest
npm ci
npm start -- --port 4203
```

Sul proprio computer si apre `http://localhost:4203`. In un editor remoto occorre inoltrare la porta 4203. Nell'ambiente cloud il percorso è `/workspace/frutta_angular/http-api-rest`; npm 11.19.0 è disponibile anche con `node /workspace/.cloud-tools/npm-11.19.0/node_modules/npm/bin/npm-cli.js`. Per una cache scrivibile: `export npm_config_cache=/workspace/.npm-cache`.

```bash
npm run build
npm test -- --watch=false
```

## Contenuto

- `Todo` con userId, id, title e completed.
- `provideHttpClient()` nella configurazione dell'app.
- `TodoService` con `@Service()`, `inject(HttpClient)`, GET lista con params, GET dettaglio, POST tipizzata con `Omit<Todo, 'id'>` e DELETE.
- Dati, caricamento, errori e risposta POST nei signal; conteggio delle completate con computed.
- Utenti 1, 2 e 99; spinner, elenco vuoto, badge delle completate, errore e Riprova.
- Form che invia un oggetto JSON per l'utente selezionato. Il titolo viene ripulito e non può essere vuoto. La risposta viene mostrata con JsonPipe; non viene aggiunta artificiosamente alla lista.
- “Prova tu” DELETE: riga rimossa solo dopo successo, errori visibili e protezione dai doppi click.
- “Prova tu” 404: pulsante che richiede `/todos/999` e distingue il risultato atteso da un problema di rete.
- Richieste annullate alla distruzione del componente; un cambio utente cancella la precedente GET, evitando risposte fuori ordine.
- [Dodici risposte e spiegazioni dei Prova tu](RISPOSTE.md).

Bootstrap è installato localmente e registrato in `angular.json`. Non servono backend locale, account o chiavi API. L'app usa **la vera API pubblica** `https://jsonplaceholder.typicode.com`; non sostituisce gli errori reali con dati finti.

## API dimostrativa

JSONPlaceholder simula le scritture: la POST normalmente restituisce 201 con id 201, ma non salva la nuova attività. DELETE normalmente restituisce 200 con `{}`, ma la risorsa riappare caricando nuovamente l'elenco. Un risultato vuoto per utente 99 è un successo 200 con `[]`, non un 404.

## Verifica manuale con Network

1. Apri gli strumenti del browser, scheda Network, filtro Fetch/XHR, quindi ricarica. Compare `GET /todos?userId=1`; con API raggiungibile mostra 20 attività.
2. Seleziona Utente 2 e poi 99: verifica la query string e lo stato 200; per 99 compare l'elenco vuoto.
3. Inserisci “Studiare HTTP” e premi Invia o Invio. Verifica POST, payload JSON senza id e risposta 201; viene mostrata la risposta formattata. Ricaricando, la nuova attività non compare.
4. Elimina una riga: verifica DELETE e lo stato restituito; soltanto dopo il successo la riga sparisce e il conteggio cambia. Ricaricando ricompare.
5. Premi Verifica HTTP 404: controlla il GET `/todos/999`, stato 404 e body `{}`. L'elenco rimane visibile.
6. Con rete offline verifica errore 0, fine del caricamento e recupero con Riprova dopo il ripristino della connessione. Il titolo della POST non viene cancellato se l'invio fallisce.

I test con HttpTestingController verificano metodi, URL, query, body, risposte, loading, errori, cancellazione e interazioni con i form. Sono test con risposte simulate, separati dall'accesso al servizio pubblico e dalla verifica visuale del browser.

## Rete dell'ambiente cloud

Durante lo sviluppo il proxy cloud ha rifiutato la connessione a JSONPlaceholder con `CONNECT tunnel failed, response 403`. Questo è un blocco del proxy prima dell'API, non un 403 ricevuto da JSONPlaceholder. La verifica reale GET/POST/DELETE resta distinta dai test simulati.

È stata salvata una bozza che aggiunge solo `jsonplaceholder.typicode.com` ai domini consentiti, preservando i preset esistenti. Per attivarla occorre rivedere e salvare le modifiche nelle impostazioni dell'ambiente, poi pubblicare l'ambiente. Un normale browser sul proprio computer usa la propria connessione.

## Chiavi API: esempio teorico

JSONPlaceholder non richiede chiavi. `src/environments/environment.example.ts` contiene solo un segnaposto didattico per l'esempio NASA; non è importato e non è necessario per avviare l'app. I file locali `environment.ts` ed `environment.development.ts` sono esclusi da Git. Per un futuro progetto che richieda quegli ambienti, usare `ng generate environments` e configurare/importare i file generati. Non inserire segreti reali nell'esempio; una chiave inclusa nel frontend rimane leggibile nel browser. Non viene implementata l'API NASA, che la dispensa rinvia al laboratorio successivo.

## Esito delle verifiche

- Build di produzione completata senza avvisi di budget: bundle iniziale 433,43 kB.
- **19 test passati in 2 file**, con backend HTTP simulato di Angular.
- La raggiungibilità reale di JSONPlaceholder dal cloud rimane bloccata dalla policy del proxy; non è stata verificata una chiamata reale riuscita.

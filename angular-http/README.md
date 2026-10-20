# Angular HTTP — Laboratorio 03.16

Progetto Angular autonomo in `angular-http`, con Post, Gatti, NASA APOD e Pokédex. I progetti precedenti restano separati.

## Avvio

Richiede Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` e npm 11.19.0.

```bash
cd angular-http
npm ci
npm start
```

Sul proprio computer si apre `http://localhost:4204`. In un editor remoto occorre inoltrare la porta **4204**. Nell'ambiente cloud la cartella è `/workspace/frutta_angular/angular-http`; npm 11.19.0 è disponibile anche tramite `node /workspace/.cloud-tools/npm-11.19.0/node_modules/npm/bin/npm-cli.js`. Per una cache scrivibile: `export npm_config_cache=/workspace/.npm-cache`.

```bash
npm run build
npm test -- --watch=false
```

Bootstrap è incluso dal pacchetto npm tramite `angular.json`, senza CDN. Le richieste alle API sono reali; l'app non sostituisce gli errori con dati fittizi. I dati simulati sono usati esclusivamente nei test.

## Funzioni

- `/posts`: GET di un post scelto per id con JsonPipe, GET dell'elenco completo e POST dell'oggetto della dispensa. Loading, errori e dati nei signal; gli id non validi vengono rifiutati. JSONPlaceholder restituisce id 101 senza salvare il post.
- `/gatti`: curiosità caricata all'apertura e pulsante Nuovo fatto disabilitato durante la richiesta.
- `/nasa`: APOD del giorno con immagine o link per video, titolo, data, copyright facoltativo e spiegazione. Messaggi per 403, 429, 0 e altri status.
- `/pokedex`: tipi come badge, ricerca per nome o numero, immagine, altezza in metri e peso in kg, messaggio Pokémon non trovato per 404 e gestione dello sprite mancante.
- Radice e wildcard rimandano ai post; menu con voce attiva. Le richieste vengono annullate quando si lascia la pagina.

Tutti e tre i “Prova tu” sono implementati: paginazione dei post con `_page`/`_limit` e limiti 1–10, Pokédex e foto NASA per data. Il file [RISPOSTE.md](RISPOSTE.md) contiene le dieci risposte, la tabella HTTP del Passo 6 e la distinzione tra risultati reali e simulati.

## NASA e configurazione locale

`npm ci` esegue uno script che crea **solo i file mancanti** `src/environments/environment.ts` ed `environment.development.ts`, entrambi ignorati da Git. Usa la chiave dimostrativa pubblica **DEMO_KEY**, con limiti bassi condivisi per IP. È versionato solo `environment.example.ts`, con un segnaposto. La compilazione è riproducibile dopo un clone senza dover pubblicare i file locali.

Per usare una chiave personale, richiedila su `https://api.nasa.gov` e inseriscila nei **due file locali**, senza modificarne l'esempio e senza incollarla in chat o nel repository. Se i file non esistono ancora, lo script può leggere NASA_API_KEY dall'ambiente del processo. Per un file già esistente il valore va aggiornato manualmente: il setup non lo sovrascrive. Se usi `npm ci --ignore-scripts`, esegui `npm run prepare:env` prima di avviare o compilare.

La configurazione `development` usa `fileReplacements` per sostituire environment.ts con environment.development.ts. La chiave frontend è comunque leggibile nel browser: per segreti reali serve un backend. Non sono state richieste registrazioni o chiavi personali per conto dell'utente.

## Prova manuale e scheda Network

1. Nella pagina Post apri Network → Fetch/XHR. Carica il post 1 e poi 42: GET e risposta 200; con 999, 404. Il JSON appare con tutti i campi.
2. Carica tutti: mostra 100 post. Invia un post: controlla POST, payload oggetto senza id, stato 201 e risposta con id 101. Un secondo invio restituisce ancora 101, e l'elenco rimane di 100 post.
3. Carica pagina e usa Successiva: verifica `_page=2&_limit=10`, id 11–20. Precedente è disabilitato alla prima pagina, Successiva alla decima.
4. Apri Gatti: arriva un fatto in inglese. Nuovo fatto ne carica un altro; il pulsante è bloccato durante il caricamento. In caso di errore puoi riprovare.
5. Apri NASA: immagine con alt uguale al titolo, oppure link per un video. Una chiave non valida produce il messaggio 403, un limite esaurito il messaggio 429. Questi casi sono già coperti dai test senza modificare chiavi reali.
6. Nel campo data NASA scegli un giorno passato; Mostra usa il parametro `date`. Una data futura viene inviata all'API e il previsto 400 viene spiegato in pagina.
7. Apri Pokédex: compaiono i tipi; cerca `PiKaChu` o `25`, e controlla 0.4 m e 6 kg. Con un nome inesistente compare Pokémon non trovato.
8. Con DevTools in modalità Offline, una chiamata genera un errore di rete con status 0; tornando online ripeti l'azione. Il caricamento termina anche in errore.

## Verifiche eseguite

- **30 test passati in 6 file**: contratti dei servizi, query e payload, componenti e routing, form, errori HTTP, paginazione e media NASA.
- Build di produzione riuscita. Avviso: bundle iniziale circa 541,79 kB contro la soglia di avviso 500 kB; sotto la soglia di errore 1 MB. Le soglie non sono state alzate per nascondere l'avviso.
- Setup dei file di ambiente verificato in una cartella temporanea: creazione da zero e preservazione dei file già presenti.
- Chiamate reali JSONPlaceholder verificate dal terminale: GET post 1 → 200, GET 999 → 404, GET tutti → 200 con 100 post, POST → 201 con id 101, pagina 2 → 200 con id 11–20.
- Le verifiche di componenti usano il backend HTTP simulato di Angular; non sostituiscono una prova visuale del browser.

## Rete cloud: azione ancora necessaria

JSONPlaceholder è raggiungibile. catfact.ninja, api.nasa.gov e pokeapi.co sono attualmente bloccati dal proxy cloud prima dell'API; nessuna risposta live riuscita di questi tre servizi è stata dichiarata. È stata salvata una bozza che aggiunge **catfact.ninja**, **api.nasa.gov**, **apod.nasa.gov** e **pokeapi.co**, mantenendo **jsonplaceholder.typicode.com** e i preset esistenti.

Per attivare i domini, rivedi e salva le modifiche nelle impostazioni dell'ambiente, poi pubblica l'ambiente. La bozza da sola non cambia la rete della macchina in esecuzione. Un browser sul proprio computer usa invece la propria connessione.

La cronologia include i nove passi e un commit per ogni “Prova tu”. Creazione di un repository nominativo e invio a Classroom restano a carico dell'utente; il progetto viene mantenuto nel repository già usato per gli altri esercizi.

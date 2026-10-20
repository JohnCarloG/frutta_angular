# Risposte — Laboratorio 03.16

## Passo 6 — Verifiche delle richieste

Le righe seguenti sono state osservate dal terminale cloud con curl tramite il proxy, **non dalla scheda Network di un browser**. La procedura per ripeterle nel browser è nel README.

| Operazione      | Metodo | Endpoint   | Stato reale osservato | Risposta                             |
| --------------- | ------ | ---------- | --------------------- | ------------------------------------ |
| Carica post 1   | GET    | /posts/1   | 200                   | Oggetto con userId, id, title e body |
| Carica post 999 | GET    | /posts/999 | 404                   | `{}`                                 |
| Carica tutti    | GET    | /posts     | 200                   | Lista di 100 post                    |
| Invia un post   | POST   | /posts     | 201                   | Oggetto inviato con id 101           |

La prova offline (status 0) è coperta dai test Angular con errore di rete simulato; non è stata eseguita una disconnessione reale del browser. Il preflight OPTIONS dipende dal browser e non viene osservato da curl.

## Le dieci risposte

1. **provideHttpClient.** Configura il servizio HTTP nei providers di `src/app/app.config.ts`, insieme a router e gestione degli errori globali. Si importa da `@angular/common/http`.
2. **Iniezione.** Il costruttore `constructor(public http: HttpClient) {}` dichiara e riceve la dipendenza come parametro, esponendola pubblicamente. `private readonly http = inject(HttpClient)` la richiede nell'inizializzazione della proprietà, limitandone accesso e riassegnazione. Entrambe ottengono il servizio dall'iniettore, ma nelle classi Angular 22 decorate con `@Service()` non è supportata l'iniezione tramite parametri del costruttore: si usa `inject()`.
3. **Observable.** È una sorgente che può emettere valori nel tempo. Gli Observable di HttpClient sono cold: `getPosts()` restituisce l'Observable, la richiesta parte quando viene sottoscritto con `subscribe`. Due sottoscrizioni senza condivisione generano due richieste.
4. **next ed error.** `next` riceve i dati di una risposta riuscita; `error` riceve l'errore HTTP o di rete. Con `/posts/999`, verificato sul servizio reale, viene chiamato `error` con status 404. Con errori di rete o CORS Angular può esporre status 0, che non è un codice restituito dal server.
5. **Signal.** I dati arrivano in callback asincroni. I signal notificano ad Angular zoneless che la vista deve aggiornarsi. Assegnare una semplice proprietà nel callback non fornisce quella notifica: la pagina potrebbe rimanere allo stato precedente fino a un altro aggiornamento. Anche caricamento ed errore cambiano dopo la richiesta e per questo sono signal.
6. **Interfacce.** Rendono visibile il contratto dei dati, abilitano autocompletamento e intercettano errori come `p.titolo` invece di `p.title`, o `f.testo` invece di `f.fact`. Con `any` passerebbero inosservati alla compilazione. Le interfacce non validano il JSON a runtime.
7. **JsonPipe.** Converte un oggetto in una rappresentazione JSON indentata. In un elemento `<pre>` permette di leggere tutti i campi ricevuti senza trasformarli manualmente; va importato negli imports del componente.
8. **POST simulata.** JSONPlaceholder ha 100 post e simula la creazione restituendo id 101; non memorizza l'oggetto, quindi invii successivi ottengono ancora 101 e l'elenco rimane di 100 elementi. HttpClient serializza automaticamente l'oggetto e riconosce `application/json`; passando una stringa con `JSON.stringify`, il tipo di contenuto automatico sarebbe testo semplice.
9. **File di ambiente.** Prima di committare sono stati ignorati `environment.ts` ed `environment.development.ts`; la build development sostituisce il primo con il secondo. È versionato solo `environment.example.ts` con segnaposto. Lo script di preparazione crea i due file mancanti con la chiave pubblica DEMO_KEY, oppure con NASA_API_KEY se fornita nel processo locale, senza sovrascrivere file esistenti e senza stampare il valore. Non era disponibile una chiave personale NASA: non ne è stata inventata né pubblicata una. I controlli Git confermano che i due file locali non sono tracciati.
10. **Limite del frontend.** Gitignore evita la pubblicazione nel sorgente Git, ma la chiave usata dal browser è nel bundle e nelle richieste, quindi è visibile all'utente. Una credenziale realmente segreta deve restare su un server che interroga l'API al posto del client. Se una chiave personale finisce su GitHub va revocata: rimuovere il file non basta a cancellarla dalla cronologia.

## Prove in autonomia

- **Livello 1:** `GET /posts?_page=2&_limit=10`, verificato sul servizio reale: status 200, dieci elementi con id dall'11 al 20. I pulsanti sono disabilitati ai limiti 1 e 10 e la pagina corrente cambia solo dopo il successo.
- **Livello 2:** PokeAPI fornisce tipi come `{ count, next, previous, results }` e Pokémon con `sprites.front_default`, height in decimetri e weight in ettogrammi. Si divide per 10 per metri e chilogrammi. Il codice tipizza i campi utilizzati e distingue il 404 dagli errori di rete. Le risposte sono verificate nei test simulati; la chiamata reale dal cloud è attualmente bloccata dal proxy.
- **Livello 3:** Il metodo aggiunge `date` nei params APOD. Per una data futura il comportamento atteso dell'API è 400 Bad Request; l'app lo mostra in pagina senza nascondere la richiesta dietro una validazione che la impedisca. Questo caso è testato con una risposta simulata. La verifica reale NASA è bloccata dalla policy di rete, quindi il 400 non è presentato come osservazione reale.

## Limiti delle osservazioni

Le chiamate a catfact.ninja, api.nasa.gov e pokeapi.co dal cloud hanno ricevuto un rifiuto del proxy (`CONNECT tunnel failed, response 403`) prima di raggiungere l'API. Non è un errore 403 della chiave NASA. Le verifiche automatiche di queste API usano HttpTestingController; nessuna chiamata live riuscita è stata dichiarata per questi tre servizi. La bozza di rete con i domini necessari è salvata ma richiede attivazione nelle impostazioni dell'ambiente.

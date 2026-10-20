# Risposte — 03.15 HTTP e API REST

1. **Client-server.** In un'app meteo il browser è il client: invia una richiesta con la località. Il server legge i dati meteo dalle proprie fonti o archivi e risponde; il client li presenta. I dati non devono essere scritti nel componente.
2. **Parti HTTP.** Richiesta: metodo, URL, header e, quando previsto, body. Risposta: codice di stato, header e body facoltativo. POST, PUT e PATCH inviano normalmente un body; GET non lo usa, DELETE normalmente non lo richiede. Una risposta 204 non ha body.
3. **CRUD libri.** `GET /libri` legge la collezione, `GET /libri/5` legge il libro 5; `POST /libri` crea; `PUT /libri/5` sostituisce integralmente; `PATCH /libri/5` aggiorna alcuni campi; `DELETE /libri/5` elimina. Gli URL identificano risorse, il metodo indica l'azione.
4. **Codici.** 201 Created = risorsa creata; 204 No Content = riuscita senza body; 403 Forbidden = accesso non consentito; 404 Not Found = risorsa non trovata; 500 Internal Server Error = problema interno del server. Un 4xx indica un problema relativo alla richiesta o ai permessi del client, un 5xx un problema del server. Il 403 da solo non prova che l'utente sia autenticato.
5. **JSON e interfaccia.**

   ```json
   {
     "titolo": "Il piccolo principe",
     "autori": ["Antoine de Saint-Exupéry"],
     "anno": 1943,
     "disponibile": true
   }
   ```

   ```ts
   export interface Libro {
     titolo: string;
     autori: string[];
     anno: number;
     disponibile: boolean;
   }
   ```

6. **Configurazione Angular.** Si importa `provideHttpClient` da `@angular/common/http` e si aggiunge `provideHttpClient()` ai providers di `app.config.ts`. Nelle versioni meno recenti, l'assenza della configurazione causava `No provider for HttpClient`. In questo progetto la configurazione è esplicita.
7. **Observable.** Rappresenta una sequenza di valori nel tempo. Gli Observable di HttpClient sono cold: la chiamata parte alla sottoscrizione. Due subscribe allo stesso Observable HTTP, senza condivisione/cache, producono due richieste indipendenti. Un Observable in generale può produrre più valori; una normale richiesta HTTP qui emette il body e completa.
8. **next ed error.** `next` riceve la risposta riuscita; `error` gestisce risposte HTTP non riuscite e problemi di rete, CORS o connessione. In questi ultimi casi lo status esposto può essere 0. Lo status 0 non è un codice inviato dal server e da solo non identifica la causa precisa.
9. **Signal.** Dati, caricamento ed errore cambiano quando termina una richiesta asincrona. In un'app zoneless i signal notificano ad Angular quali viste aggiornare. Assegnare soltanto una proprietà normale nel callback non fornisce quella notifica: la vista potrebbe restare al precedente stato finché non avviene un altro aggiornamento. Esistono altre forme di notifica, ma qui si usano i signal.
10. **Tipizzazione.** `http.get<Todo[]>()` permette a TypeScript di verificare l'uso dei dati nel codice e di offrire autocompletamento. Non valida il JSON del server a runtime: l'interfaccia deve corrispondere alla risposta reale; per dati non attendibili serve una validazione esplicita.
11. **Stile moderno.**

    ```ts
    private readonly http = inject(HttpClient);
    readonly data = signal<Todo[]>([]);
    readonly errore = signal<string | null>(null);

    carica(): void {
      this.http.get<Todo[]>('https://jsonplaceholder.typicode.com/todos').subscribe({
        next: dati => this.data.set(dati),
        error: (err: HttpErrorResponse) => this.errore.set(`Errore ${err.status}`),
      });
    }
    ```

    Servono gli import di `inject` e `signal` da `@angular/core`, `HttpClient` e `HttpErrorResponse` da `@angular/common/http` e il modello Todo. La funzione arrow conserva il `this` lessicale; passando un metodo ordinario come callback si può perdere il riferimento all'istanza.

12. **Chiavi API.** Per un esercizio si possono tenere in `environment.ts` ed `environment.development.ts`, esclusi da Git, e versionare solo `environment.example.ts` con un segnaposto. `ng g environments` configura le sostituzioni di build. Le chiavi non devono apparire nei commit; se sono state pubblicate occorre revocarle, non basta aggiungere `.gitignore`. Il bundle frontend e le richieste sono visibili agli utenti: una chiave realmente segreta deve restare su un backend, che effettua la richiesta per il client. JSONPlaceholder non richiede chiavi; l'esempio NASA è teorico e non viene chiamato dall'app.

## Prova tu: risorsa inesistente

Il comportamento atteso per `GET /todos/999` è **404 Not Found**, body `{}`: manca la singola risorsa. È diverso da `GET /todos?userId=99`, che risponde **200 OK** con `[]`: la ricerca è riuscita ma non trova attività. I test automatici verificano entrambi i casi con il backend HTTP di test; non costituiscono una misura del servizio pubblico in tempo reale.

## Prova tu: eliminazione

`deleteTodo` restituisce `Observable<unknown>`; il componente esegue subscribe e, soltanto in `next`, usa `update` e `filter` per togliere la riga. Il metodo è DELETE. JSONPlaceholder normalmente risponde 200 con `{}`; altre API possono rispondere 204 senza contenuto. Il codice gestisce entrambi. La modifica dell'API dimostrativa non è persistente.

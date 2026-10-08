# Domande di verifica

1. Il router distrugge il componente quando cambi pagina. Lo stato va conservato in un servizio condiviso, che vive più a lungo del componente.
2. Un servizio è una classe che raccoglie dati e logica riutilizzabili: per esempio l'ordine del cliente o l'utente autenticato.
3. `ng g s services/carrello-service` crea `carrello-service.ts` e il relativo `.spec.ts`, con classe `CarrelloService`. Il suffisso distingue il servizio da modelli e componenti.
4. In Angular 22 `@Service()` registra il servizio nell'iniettore radice, come `@Injectable({ providedIn: 'root' })`. Con il solo `@Injectable()` serve un provider esplicito; se manca, chi richiede il servizio riceve NG0201.
5. Singleton significa una sola istanza nel relativo ambito di iniezione. Il log nel costruttore compare una volta mentre navighi; due richieste all'iniettore restituiscono lo stesso oggetto. Provider locali possono creare istanze separate.
6. Come una biblioteca: chiedi al bibliotecario una risorsa, non costruisci una biblioteca personale ogni volta. L'iniettore gestisce gli oggetti richiesti e li consegna ai componenti.
7. Con `new OrdineService()` ogni componente avrebbe un ordine diverso e dovrebbe procurarsi manualmente eventuali altre dipendenze del servizio.
8. Proprietà: `readonly ordine = inject(OrdineService);`. Costruttore del componente: `constructor(readonly ordine: OrdineService) {}`. La seconda forma non è ammessa dentro una classe decorata con `@Service()`; lì si usa `inject()`.
9. `asReadonly()` espone il signal senza `set` e `update`, obbligando a usare i metodi del servizio. Non congela in profondità gli oggetti: in questo progetto anche array e campi sono dichiarati readonly per proteggerli nel codice TypeScript.
10. Aggiornamento senza mutazione:

    ```ts
    aggiorna(id: number, nuovoPrezzo: number): void {
      this.piatti.update(lista => lista.map(p =>
        p.id === id ? { ...p, prezzo: nuovoPrezzo } : p,
      ));
    }
    ```

11. F5 avvia una nuova app con un nuovo servizio in memoria. Si può salvare l'ordine in localStorage e ripristinarlo all'avvio, oppure conservarlo su un server associato all'utente.
12. Per un menu remoto si introduce o modifica `MenuService` e si configura `provideHttpClient()`. Se il componente prima usava direttamente `MENU`, va aggiornato una volta per leggere il signal del servizio; dopo questa separazione, cambiare la fonte dei dati non richiede modificare il template o la logica dei componenti. I modelli e il servizio dell'ordine possono restare uguali se il contratto dei dati non cambia.

# Hamburgeria — Servizi e dependency injection

Progetto Angular 22 autonomo per la dispensa **03.13 — I servizi e la dependency injection**. L'applicazione precedente `angular-fruit` resta separata.

## Avvio

Richiede Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` e npm 11.19.0. Nell'ambiente cloud sono stati verificati Node 24.19.0 e npm 11.19.0.

```bash
cd /workspace/frutta_angular/hamburgeria-servizi
npm ci
npm start -- --port 4201
```

Se il comando `npm` locale ha una versione diversa, nell'ambiente preparato puoi usare `node /workspace/.cloud-tools/npm-11.19.0/node_modules/npm/bin/npm-cli.js` al posto di `npm`. Per una cache scrivibile imposta `npm_config_cache=/workspace/.npm-cache`. La porta 4201 evita conflitti con il progetto precedente.

```bash
npm run build
npm test -- --watch=false
npm test -- --include src/app/services --watch=false
```

## Esercitazione realizzata

- Modelli `Piatto`, `RigaOrdine` e i cinque piatti della dispensa in `src/app/modelli/piatto.ts`.
- `OrdineService` con `@Service()`, signal privato e `elenco` di sola lettura. Gli aggiornamenti creano nuovi array e nuove righe.
- `aggiungi`, `rimuovi`, `trova`, `svuota`; quantità complessiva e totale con `computed`.
- Pagine Menu e Riepilogo, navigazione e contatore condiviso tramite `inject()`; redirect iniziale e wildcard.
- Tutti i “Prova tu”: log del costruttore, `togliUno` con pulsante −1, `piattoPiuOrdinato` visualizzato con `@if (...; as r)`.
- Test del servizio e del flusso con routing, click, contatore, subtotali e persistenza durante la navigazione.

Bootstrap Reboot viene incluso dal pacchetto npm locale. Nessuna chiamata a server o CDN è necessaria. Prezzi formattati in italiano. Il riferimento a `HttpClient` nel PDF è un'anteprima teorica: non è richiesto un backend per questa esercitazione.

## Prova manuale e singleton

1. Apri la console del browser: appare `OrdineService creato`.
2. Aggiungi due hamburger classici e delle patatine: il contatore mostra 3 e il totale è 20,50 €.
3. Passa al riepilogo e torna al menu: le quantità restano e non appare un nuovo messaggio del costruttore. I tre componenti condividono il servizio dell'iniettore radice.
4. Usa −1: diminuisce la quantità; l'ultimo pezzo elimina la riga. “Togli” elimina tutta la riga, “Svuota l'ordine” azzera tutto.
5. Il più ordinato si aggiorna; a parità viene scelto il primo piatto inserito. Con ordine vuoto non viene mostrato.
6. Ricarica la pagina: l'ordine si svuota e il costruttore viene eseguito di nuovo. Non è prevista persistenza in localStorage, come nella dispensa.

I test creano un nuovo iniettore per ogni caso, quindi il log appare più volte durante la suite. Anche un riavvio dovuto allo sviluppo può ricreare l'applicazione.

Le risposte alle domande della dispensa sono in [RISPOSTE.md](RISPOSTE.md).

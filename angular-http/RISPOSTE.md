# Risposte — Laboratorio 03.16

## Passo 6 — Verifiche delle richieste

Le righe seguenti sono state osservate dal terminale cloud con curl tramite il proxy, **non dalla scheda Network di un browser**. La procedura per ripeterle nel browser è nel README.

| Operazione | Metodo | Endpoint | Stato reale osservato | Risposta |
| --- | --- | --- | --- | --- |
| Carica post 1 | GET | /posts/1 | 200 | Oggetto con userId, id, title e body |
| Carica post 999 | GET | /posts/999 | 404 | `{}` |
| Carica tutti | GET | /posts | 200 | Lista di 100 post |
| Invia un post | POST | /posts | 201 | Oggetto inviato con id 101 |

La prova offline (status 0) è coperta dai test Angular con errore di rete simulato; non è stata eseguita una disconnessione reale del browser. Il preflight OPTIONS dipende dal browser e non viene osservato da curl.

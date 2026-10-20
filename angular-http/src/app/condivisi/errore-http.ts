import { HttpErrorResponse } from '@angular/common/http';
// Non mostra URL tecnici: potrebbero contenere una chiave API nella query string.
export function erroreHttp(err: HttpErrorResponse): string {
  return err.status === 0
    ? 'Errore 0: server non raggiungibile. Controlla rete, CORS o blocchi del proxy.'
    : `Errore ${err.status}: richiesta non riuscita. Riprova più tardi.`;
}

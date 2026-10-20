import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize } from 'rxjs';
import { Todo } from '../modelli/todo';
import { TodoService } from '../services/todo-service';

@Component({
  selector: 'app-todos',
  imports: [JsonPipe, FormsModule],
  templateUrl: './todos.html',
})
export class Todos implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly destroyRef = inject(DestroyRef);
  private richiestaElenco?: Subscription;

  readonly utenti = [1, 2, 99];
  readonly utente = signal(1);
  readonly todos = signal<readonly Todo[]>([]);
  readonly loading = signal(false);
  readonly errore = signal<string | null>(null);
  readonly creato = signal<Todo | null>(null);
  readonly completate = computed(
    () => this.todos().filter((t) => t.completed).length,
  );
  readonly titolo = signal('');
  readonly invio = signal(false);
  readonly erroreInvio = signal<string | null>(null);
  readonly eliminando = signal<ReadonlySet<number>>(new Set());
  readonly erroreEliminazione = signal<string | null>(null);
  readonly messaggioEliminazione = signal<string | null>(null);
  readonly operazioneInCorso = computed(
    () => this.invio() || this.eliminando().size > 0,
  );
  readonly provaInCorso = signal(false);
  readonly risultatoProva = signal<string | null>(null);

  ngOnInit(): void {
    this.carica(1);
  }

  carica(userId: number): void {
    if (this.operazioneInCorso()) return;
    // Annulla la richiesta precedente: una risposta lenta non deve sovrascrivere l'utente nuovo.
    this.richiestaElenco?.unsubscribe();
    this.utente.set(userId);
    this.loading.set(true);
    this.errore.set(null);
    this.todos.set([]);
    this.creato.set(null);
    this.erroreInvio.set(null);
    this.erroreEliminazione.set(null);
    this.messaggioEliminazione.set(null);
    this.richiestaElenco = this.todoService
      .getTodos(userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (dati) => this.todos.set(dati),
        error: (err: HttpErrorResponse) => this.errore.set(this.descrivi(err)),
      });
  }

  aggiungi(): void {
    const title = this.titolo().trim();
    if (!title || this.loading() || this.operazioneInCorso()) return;
    this.invio.set(true);
    this.erroreInvio.set(null);
    this.creato.set(null);
    this.todoService
      .addTodo({ userId: this.utente(), title, completed: false })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.invio.set(false)),
      )
      .subscribe({
        next: (risposta) => {
          this.creato.set(risposta);
          this.titolo.set('');
        },
        error: (err: HttpErrorResponse) =>
          this.erroreInvio.set(`Invio non riuscito. ${this.descrivi(err)}`),
      });
  }

  elimina(todo: Todo): void {
    if (this.loading() || this.invio() || this.eliminando().has(todo.id))
      return;
    this.erroreEliminazione.set(null);
    this.messaggioEliminazione.set(null);
    this.eliminando.update((ids) => new Set([...ids, todo.id]));
    this.todoService
      .deleteTodo(todo.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() =>
          this.eliminando.update((ids) => {
            const aggiornati = new Set(ids);
            aggiornati.delete(todo.id);
            return aggiornati;
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.todos.update((lista) => lista.filter((t) => t.id !== todo.id));
          this.messaggioEliminazione.set(
            `Attività «${todo.title}» eliminata dalla lista locale.`,
          );
        },
        error: (err: HttpErrorResponse) =>
          this.erroreEliminazione.set(
            `Eliminazione non riuscita. ${this.descrivi(err)}`,
          ),
      });
  }

  prova404(): void {
    if (this.provaInCorso()) return;
    this.provaInCorso.set(true);
    this.risultatoProva.set(null);
    this.todoService
      .getTodo(999)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.provaInCorso.set(false)),
      )
      .subscribe({
        next: (todo) =>
          this.risultatoProva.set(
            `Risposta ricevuta: ${todo.title}. Era atteso un errore 404.`,
          ),
        error: (err: HttpErrorResponse) =>
          this.risultatoProva.set(
            err.status === 404
              ? 'HTTP 404 Not Found: l’attività 999 non esiste. JSONPlaceholder restituisce {}.'
              : this.descrivi(err),
          ),
      });
  }

  private descrivi(err: HttpErrorResponse): string {
    return err.status === 0
      ? 'Errore 0: impossibile raggiungere l’API. Controlla rete, CORS o blocchi del proxy.'
      : `Errore ${err.status}: ${err.message}`;
  }
}

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Post } from '../modelli/post';
import { PostService } from '../services/post-service';
import { erroreHttp } from '../condivisi/errore-http';
@Component({
  selector: 'app-posts',
  imports: [JsonPipe],
  templateUrl: './posts.html',
})
export class Posts {
  private readonly postService = inject(PostService);
  private readonly destroyRef = inject(DestroyRef);
  readonly post = signal<Post | null>(null);
  readonly posts = signal<readonly Post[]>([]);
  readonly pagina = signal(1);
  readonly paginato = signal(false);
  readonly elencoCaricato = signal(false);
  readonly loading = signal(false);
  readonly errore = signal<string | null>(null);

  caricaUno(numero: string): void {
    const id = Number(numero);
    if (!Number.isInteger(id) || id < 1) {
      this.errore.set('Inserisci un numero intero positivo.');
      return;
    }
    if (!this.inizia()) return;
    this.postService
      .getPost(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (dato) => this.post.set(dato),
        error: (err: HttpErrorResponse) => this.gestisciErrore(err),
      });
  }

  caricaTutti(): void {
    if (!this.inizia()) return;
    this.postService
      .getPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (dati) => {
          this.posts.set(dati);
          this.paginato.set(false);
          this.elencoCaricato.set(true);
        },
        error: (err: HttpErrorResponse) => this.gestisciErrore(err),
      });
  }

  caricaPagina(pagina: number): void {
    if (
      !Number.isInteger(pagina) ||
      pagina < 1 ||
      pagina > 10 ||
      !this.inizia()
    )
      return;
    this.postService
      .getPagina(pagina)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (dati) => {
          this.posts.set(dati);
          this.pagina.set(pagina);
          this.paginato.set(true);
          this.elencoCaricato.set(true);
        },
        error: (err: HttpErrorResponse) => this.gestisciErrore(err),
      });
  }

  invia(): void {
    if (!this.inizia()) return;
    const nuovo = {
      userId: 1,
      title: 'Primo post da Angular',
      body: 'Inviato con HttpClient',
    };
    this.postService
      .addPost(nuovo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (risposta) => this.post.set(risposta),
        error: (err: HttpErrorResponse) => this.gestisciErrore(err),
      });
  }

  private inizia(): boolean {
    if (this.loading()) return false;
    this.loading.set(true);
    this.errore.set(null);
    return true;
  }
  private gestisciErrore(err: HttpErrorResponse): void {
    this.errore.set(erroreHttp(err));
  }
}

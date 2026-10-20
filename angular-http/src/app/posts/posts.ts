import { Component, DestroyRef, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Post } from '../modelli/post';
import { PostService } from '../services/post-service';
import { erroreHttp } from '../condivisi/errore-http';
@Component({ selector: 'app-posts', imports: [JsonPipe], templateUrl: './posts.html' })
export class Posts {
  private readonly postService = inject(PostService);
  private readonly destroyRef = inject(DestroyRef);
  readonly post = signal<Post | null>(null);
  readonly posts = signal<readonly Post[]>([]);
  readonly loading = signal(false);
  readonly errore = signal<string | null>(null);

  caricaUno(numero: string): void {
    const id = Number(numero);
    if (!Number.isInteger(id) || id < 1) { this.errore.set('Inserisci un numero intero positivo.'); return; }
    if (!this.inizia()) return;
    this.postService.getPost(id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: dato => this.post.set(dato),
      error: (err: HttpErrorResponse) => this.gestisciErrore(err),
    });
  }

  private inizia(): boolean {
    if (this.loading()) return false;
    this.loading.set(true); this.errore.set(null); return true;
  }
  private gestisciErrore(err: HttpErrorResponse): void { this.errore.set(erroreHttp(err)); }
}

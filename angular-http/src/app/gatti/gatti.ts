import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CatFact } from '../modelli/cat-fact';
import { CatService } from '../services/cat-service';
import { erroreHttp } from '../condivisi/errore-http';
@Component({ selector: 'app-gatti', templateUrl: './gatti.html' })
export class Gatti implements OnInit {
  private readonly catService = inject(CatService);
  private readonly destroyRef = inject(DestroyRef);
  readonly fatto = signal<CatFact | null>(null);
  readonly loading = signal(false);
  readonly errore = signal<string | null>(null);
  ngOnInit(): void {
    this.nuovoFatto();
  }
  nuovoFatto(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errore.set(null);
    this.catService
      .getRandomFact()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (dato) => this.fatto.set(dato),
        error: (err: HttpErrorResponse) => this.errore.set(erroreHttp(err)),
      });
  }
}

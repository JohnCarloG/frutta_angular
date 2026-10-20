import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Apod } from '../modelli/apod';
import { NasaService } from '../services/nasa-service';
@Component({
  selector: 'app-nasa',
  imports: [FormsModule],
  templateUrl: './nasa.html',
})
export class Nasa implements OnInit {
  private readonly nasaService = inject(NasaService);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = signal('');
  readonly apod = signal<Apod | null>(null);
  readonly loading = signal(false);
  readonly errore = signal<string | null>(null);
  ngOnInit(): void {
    this.carica();
  }
  carica(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errore.set(null);
    this.apod.set(null);
    this.nasaService
      .getApod()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (dati) => this.apod.set(dati),
        error: (err: HttpErrorResponse) =>
          this.errore.set(this.messaggio(err.status)),
      });
  }
  mostra(): void {
    const data = this.data();
    if (this.loading()) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      this.errore.set('Scegli una data valida.');
      return;
    }
    this.loading.set(true);
    this.errore.set(null);
    this.apod.set(null);
    this.nasaService
      .getApodDel(data)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (dati) => this.apod.set(dati),
        error: (err: HttpErrorResponse) =>
          this.errore.set(this.messaggio(err.status)),
      });
  }
  private messaggio(status: number): string {
    switch (status) {
      case 403:
        return 'Chiave API mancante o non valida: controlla i file in src/environments.';
      case 429:
        return 'Troppe richieste con questa chiave: riprova più tardi. DEMO_KEY ha limiti ridotti.';
      case 0:
        return 'Il server non è raggiungibile: controlla connessione, CORS o blocchi del proxy.';
      case 400:
        return 'Errore 400: data non valida o futura. APOD accetta date dal 16 giugno 1995 fino a oggi.';
      default:
        return `Errore ${status} dal server della NASA.`;
    }
  }
}

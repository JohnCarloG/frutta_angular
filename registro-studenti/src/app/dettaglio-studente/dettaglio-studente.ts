import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Studente } from '../modelli/studente';
import { StudentiService } from '../services/studenti-service';
import { StudenteCard } from '../studente-card/studente-card';
@Component({ selector: 'app-dettaglio-studente', imports: [RouterLink, StudenteCard], templateUrl: './dettaglio-studente.html' })
export class DettaglioStudente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentiService = inject(StudentiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly studente = signal<Studente | undefined>(undefined);

  ngOnInit(): void {
    // La sottoscrizione aggiorna la scheda anche se il router riusa il componente.
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(parametri => {
      const trovato = this.studentiService.trova(Number(parametri.get('id')));
      this.studente.set(trovato);
      if (!trovato) void this.router.navigate(['/elenco'], { replaceUrl: true });
    });
  }

  successivo(): void {
    const attuale = this.studente();
    if (!attuale) return;
    const prossimo = this.studentiService.successivo(attuale.id);
    if (prossimo) void this.router.navigate(['/elenco', prossimo.id]);
  }

  rimuovi(s: Studente): void {
    this.studentiService.rimuovi(s.id);
    void this.router.navigate(['/elenco']);
  }
}

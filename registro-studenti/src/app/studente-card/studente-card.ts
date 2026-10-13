import { Component, input, output } from '@angular/core';
import { Studente } from '../modelli/studente';
@Component({ selector: 'app-studente-card', templateUrl: './studente-card.html', host: { class: 'card shadow-sm' } })
export class StudenteCard {
  readonly studente = input.required<Studente>();
  readonly azioni = input(true);
  readonly rimosso = output<Studente>();
  rimuovi(): void { this.rimosso.emit(this.studente()); }
}

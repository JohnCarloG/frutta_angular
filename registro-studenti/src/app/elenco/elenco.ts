import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentiService } from '../services/studenti-service';
@Component({ selector: 'app-elenco', imports: [FormsModule, RouterLink], templateUrl: './elenco.html' })
export class Elenco {
  private readonly studentiService = inject(StudentiService);
  readonly filtroClasse = signal('');
  readonly filtrati = computed(() => {
    const filtro = this.filtroClasse().trim().toUpperCase();
    const tutti = this.studentiService.studenti();
    return filtro === '' ? tutti : tutti.filter(s => s.classe.toUpperCase() === filtro);
  });
  rimuovi(id: number): void { this.studentiService.rimuovi(id); }
}

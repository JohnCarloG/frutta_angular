import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentiService } from '../services/studenti-service';
@Component({
  selector: 'app-elenco',
  imports: [FormsModule, RouterLink],
  templateUrl: './elenco.html',
})
export class Elenco {
  private readonly studentiService = inject(StudentiService);
  readonly filtroClasse = signal('');
  readonly filtrati = computed(() => {
    const filtro = this.filtroClasse().trim().toUpperCase();
    const tutti = this.studentiService.studenti();
    return filtro === ''
      ? tutti
      : tutti.filter((s) => s.classe.toUpperCase() === filtro);
  });
  readonly ordine = signal<'nome' | 'media'>('nome');
  readonly visibili = computed(() =>
    [...this.filtrati()].sort(
      this.ordine() === 'nome'
        ? (a, b) => a.nome.localeCompare(b.nome, 'it')
        : (a, b) => b.mediaVoti - a.mediaVoti,
    ),
  );
  readonly mediaClasse = computed(() => {
    const lista = this.filtrati();
    return lista.length === 0
      ? 0
      : lista.reduce((somma, s) => somma + s.mediaVoti, 0) / lista.length;
  });
  rimuovi(id: number): void {
    this.studentiService.rimuovi(id);
  }
}

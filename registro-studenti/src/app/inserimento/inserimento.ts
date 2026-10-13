import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentiService } from '../services/studenti-service';
@Component({ selector: 'app-inserimento', imports: [FormsModule, RouterLink], templateUrl: './inserimento.html' })
export class Inserimento {
  private readonly studentiService = inject(StudentiService);
  private readonly router = inject(Router);
  readonly nome = signal('');
  readonly classe = signal('4B');
  readonly media = signal<number | null>(6);

  salva(): void {
    const nome = this.nome().trim();
    const classe = this.classe().trim().toUpperCase();
    const media = this.media();
    // Verifica anche il submit con Invio o una chiamata diretta al metodo.
    if (!nome || !classe || media === null || !Number.isFinite(media) || media < 1 || media > 10) return;
    this.studentiService.aggiungi(nome, classe, Number(media));
    void this.router.navigate(['/elenco']);
  }
}

import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentiService } from '../services/studenti-service';
@Component({
  selector: 'app-modifica-studente',
  imports: [FormsModule, RouterLink],
  templateUrl: './modifica-studente.html',
})
export class ModificaStudente implements OnInit {
  private readonly studentiService = inject(StudentiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private id: number | undefined;
  readonly nome = signal('');
  readonly classe = signal('');
  readonly media = signal<number | null>(6);

  ngOnInit(): void {
    // Lo snapshot basterebbe entrando sempre dall'elenco. La sottoscrizione
    // gestisce anche navigazioni dirette tra due URL di modifica.
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parametri) => {
        const s = this.studentiService.trova(Number(parametri.get('id')));
        if (!s) {
          void this.router.navigate(['/elenco'], { replaceUrl: true });
          return;
        }
        this.id = s.id;
        this.nome.set(s.nome);
        this.classe.set(s.classe);
        this.media.set(s.mediaVoti);
      });
  }

  salva(): void {
    const nome = this.nome().trim();
    const classe = this.classe().trim().toUpperCase();
    const media = this.media();
    if (
      this.id === undefined ||
      !this.studentiService.trova(this.id) ||
      !nome ||
      !classe ||
      media === null ||
      !Number.isFinite(media) ||
      media < 1 ||
      media > 10
    )
      return;
    this.studentiService.aggiorna({
      id: this.id,
      nome,
      classe,
      mediaVoti: Number(media),
    });
    void this.router.navigate(['/elenco', this.id]);
  }
}

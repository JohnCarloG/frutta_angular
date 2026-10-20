import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Pokemon, TipoPokemon } from '../modelli/pokemon';
import { PokemonService } from '../services/pokemon-service';
import { erroreHttp } from '../condivisi/errore-http';
@Component({ selector: 'app-pokedex', imports: [FormsModule], templateUrl: './pokedex.html' })
export class Pokedex implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);
  readonly tipi = signal<readonly TipoPokemon[]>([]);
  readonly loadingTipi = signal(false);
  readonly erroreTipi = signal<string | null>(null);
  readonly ricerca = signal('');
  readonly pokemon = signal<Pokemon | null>(null);
  readonly loading = signal(false);
  readonly errore = signal<string | null>(null);
  ngOnInit(): void { this.caricaTipi(); }
  caricaTipi(): void {
    if (this.loadingTipi()) return;
    this.loadingTipi.set(true); this.erroreTipi.set(null);
    this.pokemonService.getTipi().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingTipi.set(false))).subscribe({
      next: dati => this.tipi.set(dati.results),
      error: (err: HttpErrorResponse) => this.erroreTipi.set(erroreHttp(err)),
    });
  }
  cerca(): void {
    const ricerca = this.ricerca().trim();
    if (!ricerca || this.loading()) return;
    this.loading.set(true); this.errore.set(null); this.pokemon.set(null);
    this.pokemonService.cerca(ricerca).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: dato => this.pokemon.set(dato),
      error: (err: HttpErrorResponse) => this.errore.set(err.status === 404 ? 'Pokémon non trovato' : erroreHttp(err)),
    });
  }
}

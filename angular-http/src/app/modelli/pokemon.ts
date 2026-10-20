export interface TipoPokemon { readonly name: string; readonly url: string; }
export interface PaginaTipi {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly TipoPokemon[];
}
export interface Pokemon {
  readonly id: number;
  readonly name: string;
  readonly height: number;
  readonly weight: number;
  readonly sprites: { readonly front_default: string | null };
}

import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginaTipi, Pokemon } from '../modelli/pokemon';
@Service()
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  getTipi(): Observable<PaginaTipi> {
    return this.http.get<PaginaTipi>(`${this.baseUrl}/type`);
  }
  cerca(nomeONumero: string): Observable<Pokemon> {
    const ricerca = encodeURIComponent(nomeONumero.trim().toLowerCase());
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${ricerca}`);
  }
}

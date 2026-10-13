import { Service, computed, signal } from '@angular/core';
import { Studente } from '../modelli/studente';

@Service()
export class StudentiService {
  private readonly dati = signal<readonly Studente[]>([
    { id: 1, nome: 'Luca Bianchi', classe: '4B', mediaVoti: 7.5 },
    { id: 2, nome: 'Sara Rossi', classe: '4B', mediaVoti: 5.8 },
    { id: 3, nome: 'Marco Verdi', classe: '4A', mediaVoti: 8.2 },
    { id: 4, nome: 'Giulia Neri', classe: '4A', mediaVoti: 6.4 },
    { id: 5, nome: 'Paolo Russo', classe: '4B', mediaVoti: 4.9 },
  ]);
  readonly studenti = this.dati.asReadonly();
  readonly numero = computed(() => this.dati().length);
  readonly migliore = computed(() =>
    this.dati().reduce<Studente | undefined>(
      (m, s) => (!m || s.mediaVoti > m.mediaVoti ? s : m),
      undefined,
    ),
  );

  aggiungi(nome: string, classe: string, mediaVoti: number): Studente {
    const nuovo: Studente = { id: this.prossimoId(), nome, classe, mediaVoti };
    this.dati.update((lista) => [...lista, nuovo]);
    return nuovo;
  }

  rimuovi(id: number): void {
    this.dati.update((lista) => lista.filter((s) => s.id !== id));
  }

  trova(id: number): Studente | undefined {
    return this.dati().find((s) => s.id === id);
  }

  successivo(id: number): Studente | undefined {
    const lista = this.dati();
    const i = lista.findIndex((s) => s.id === id);
    return i === -1 ? undefined : lista[(i + 1) % lista.length];
  }

  aggiorna(modificato: Studente): void {
    this.dati.update((lista) =>
      lista.map((s) => (s.id === modificato.id ? { ...modificato } : s)),
    );
  }

  private prossimoId(): number {
    return Math.max(0, ...this.dati().map((s) => s.id)) + 1;
  }
}

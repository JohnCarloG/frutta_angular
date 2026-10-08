import { Service, computed, signal } from '@angular/core';
import { Piatto, RigaOrdine } from '../modelli/piatto';

@Service()
export class OrdineService {
  // Il signal scrivibile resta privato: i componenti usano soltanto i metodi.
  private readonly righe = signal<readonly RigaOrdine[]>([]);
  readonly elenco = this.righe.asReadonly();
  readonly numeroPezzi = computed(() =>
    this.righe().reduce((somma, r) => somma + r.quantita, 0),
  );
  readonly totale = computed(() =>
    this.righe().reduce((somma, r) => somma + r.piatto.prezzo * r.quantita, 0),
  );
  // A parità di quantità mantiene il primo piatto inserito.
  readonly piattoPiuOrdinato = computed(() =>
    this.righe().reduce<RigaOrdine | undefined>(
      (massimo, r) => (!massimo || r.quantita > massimo.quantita ? r : massimo),
      undefined,
    ),
  );

  constructor() {
    console.log('OrdineService creato');
  }

  aggiungi(piatto: Piatto): void {
    if (this.trova(piatto.id)) {
      this.righe.update((lista) =>
        lista.map((r) =>
          r.piatto.id === piatto.id ? { ...r, quantita: r.quantita + 1 } : r,
        ),
      );
    } else {
      this.righe.update((lista) => [
        ...lista,
        { piatto: { ...piatto }, quantita: 1 },
      ]);
    }
  }

  rimuovi(idPiatto: number): void {
    this.righe.update((lista) => lista.filter((r) => r.piatto.id !== idPiatto));
  }

  togliUno(idPiatto: number): void {
    this.righe.update((lista) =>
      lista
        .map((r) =>
          r.piatto.id === idPiatto ? { ...r, quantita: r.quantita - 1 } : r,
        )
        .filter((r) => r.quantita > 0),
    );
  }

  trova(idPiatto: number): RigaOrdine | undefined {
    return this.righe().find((r) => r.piatto.id === idPiatto);
  }

  svuota(): void {
    this.righe.set([]);
  }
}

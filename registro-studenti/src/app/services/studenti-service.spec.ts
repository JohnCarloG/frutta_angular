import { TestBed } from '@angular/core/testing';
import { StudentiService } from './studenti-service';

describe('StudentiService', () => {
  let service: StudentiService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentiService);
  });

  it('inizializza cinque studenti e trova la media più alta', () => {
    expect(service.numero()).toBe(5);
    expect(service.migliore()?.nome).toBe('Marco Verdi');
    expect(service.migliore()?.mediaVoti).toBe(8.2);
    expect(TestBed.inject(StudentiService)).toBe(service);
  });

  it('calcola l’id dal massimo dopo una rimozione', () => {
    service.rimuovi(2);
    const prima = service.studenti();
    const nuovo = service.aggiungi('Anna Blu', '4C', 9);
    expect(nuovo.id).toBe(6);
    expect(service.numero()).toBe(5);
    expect(prima).toHaveLength(4);
    expect(new Set(service.studenti().map((s) => s.id)).size).toBe(5);
    expect(service.migliore()).toEqual(nuovo);
  });

  it('trova uno studente e gestisce un id sconosciuto', () => {
    expect(service.trova(2)?.nome).toBe('Sara Rossi');
    expect(service.trova(999)).toBeUndefined();
    service.rimuovi(999);
    expect(service.numero()).toBe(5);
  });

  it('scorre circolarmente anche con id non consecutivi', () => {
    service.rimuovi(2);
    expect(service.successivo(1)?.id).toBe(3);
    expect(service.successivo(5)?.id).toBe(1);
    expect(service.successivo(999)).toBeUndefined();
  });

  it('gestisce un solo studente e il registro vuoto', () => {
    [2, 3, 4, 5].forEach((id) => service.rimuovi(id));
    expect(service.successivo(1)?.id).toBe(1);
    service.rimuovi(1);
    expect(service.numero()).toBe(0);
    expect(service.migliore()).toBeUndefined();
    expect(service.successivo(1)).toBeUndefined();
    expect(service.aggiungi('Primo Studente', '4A', 6).id).toBe(1);
  });

  it('aggiorna senza mutare il precedente elenco e ricalcola il migliore', () => {
    const prima = service.studenti();
    const modificato = {
      ...service.trova(2)!,
      nome: 'Sara Aggiornata',
      mediaVoti: 9.5,
    };
    service.aggiorna(modificato);
    expect(service.numero()).toBe(5);
    expect(service.trova(2)?.nome).toBe('Sara Aggiornata');
    expect(prima.find((s) => s.id === 2)?.nome).toBe('Sara Rossi');
    expect(service.migliore()?.id).toBe(2);
    expect(service.trova(2)).not.toBe(modificato);
  });

  it('non aggiunge uno studente quando aggiorna un id inesistente', () => {
    service.aggiorna({ id: 999, nome: 'Assente', classe: '4A', mediaVoti: 10 });
    expect(service.numero()).toBe(5);
    expect(service.trova(999)).toBeUndefined();
  });
});

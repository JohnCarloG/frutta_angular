import { TestBed } from '@angular/core/testing';
import { MENU } from '../modelli/piatto';
import { OrdineService } from './ordine-service';

describe('OrdineService', () => {
  let service: OrdineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdineService);
  });

  it('parte con un ordine vuoto', () => {
    expect(service.elenco()).toEqual([]);
    expect(service.numeroPezzi()).toBe(0);
    expect(service.totale()).toBe(0);
    expect(service.piattoPiuOrdinato()).toBeUndefined();
  });

  it('restituisce la stessa istanza dall’iniettore', () => {
    expect(TestBed.inject(OrdineService)).toBe(service);
  });

  it('somma le quantità dello stesso piatto e calcola il totale', () => {
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[3]);
    expect(service.elenco()).toHaveLength(2);
    expect(service.numeroPezzi()).toBe(3);
    expect(service.totale()).toBe(20.5);
    expect(service.trova(MENU[0].id)?.quantita).toBe(2);
  });

  it('rimuove tutta la riga e aggiorna i valori derivati', () => {
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[3]);
    service.rimuovi(MENU[0].id);
    expect(service.trova(MENU[0].id)).toBeUndefined();
    expect(service.numeroPezzi()).toBe(1);
    expect(service.totale()).toBe(3.5);
  });

  it('toglie un pezzo senza mutare la riga precedente', () => {
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[0]);
    const prima = service.elenco();
    service.togliUno(MENU[0].id);
    expect(prima[0].quantita).toBe(2);
    expect(service.trova(MENU[0].id)?.quantita).toBe(1);
    expect(service.totale()).toBe(8.5);
  });

  it('elimina la riga quando la quantità raggiunge zero', () => {
    service.aggiungi(MENU[0]);
    service.togliUno(MENU[0].id);
    expect(service.elenco()).toEqual([]);
    expect(service.numeroPezzi()).toBe(0);
    expect(service.piattoPiuOrdinato()).toBeUndefined();
  });

  it('ignora identificativi sconosciuti', () => {
    service.aggiungi(MENU[0]);
    service.togliUno(999);
    service.rimuovi(999);
    expect(service.totale()).toBe(8.5);
    expect(service.trova(999)).toBeUndefined();
  });

  it('ricalcola il più ordinato e risolve le parità con il primo inserito', () => {
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[1]);
    expect(service.piattoPiuOrdinato()?.piatto.id).toBe(1);
    service.aggiungi(MENU[1]);
    expect(service.piattoPiuOrdinato()?.piatto.id).toBe(2);
    service.togliUno(2);
    expect(service.piattoPiuOrdinato()?.piatto.id).toBe(1);
    service.rimuovi(1);
    expect(service.piattoPiuOrdinato()?.piatto.id).toBe(2);
  });

  it('svuota ordine, totale e piatto più ordinato', () => {
    MENU.forEach((p) => service.aggiungi(p));
    service.svuota();
    expect(service.elenco()).toEqual([]);
    expect(service.numeroPezzi()).toBe(0);
    expect(service.totale()).toBe(0);
    expect(service.piattoPiuOrdinato()).toBeUndefined();
  });
});

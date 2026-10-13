import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { StudentiService } from './services/studenti-service';

describe('Registro: flussi tra pagine', () => {
  let fixture: ComponentFixture<App>;
  let root: HTMLElement;
  let router: Router;
  let service: StudentiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    root = fixture.nativeElement;
    router = TestBed.inject(Router);
    service = TestBed.inject(StudentiService);
    fixture.detectChanges();
  });

  async function aggiorna(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function naviga(url: string): Promise<void> {
    await router.navigateByUrl(url);
    await aggiorna();
  }
  async function scrivi(id: string, valore: string): Promise<void> {
    const input = root.querySelector<HTMLInputElement>('#' + id)!;
    expect(input).not.toBeNull();
    input.value = valore;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await aggiorna();
  }
  async function premi(testo: string): Promise<void> {
    const button = Array.from(root.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === testo,
    );
    expect(button, testo).toBeDefined();
    button!.click();
    await aggiorna();
  }
  function righe(): HTMLTableRowElement[] {
    return Array.from(root.querySelectorAll('tbody tr'));
  }

  it('mostra home, conteggio e migliore senza pulsante, con redirect iniziale e wildcard', async () => {
    await naviga('/');
    expect(router.url).toBe('/home');
    expect(root.querySelector('[data-testid="numero"]')?.textContent).toBe('5');
    expect(root.querySelector('app-studente-card')?.textContent).toContain(
      'Marco Verdi',
    );
    expect(root.querySelector('app-studente-card button')).toBeNull();
    expect(root.querySelector('nav a.active')?.textContent).toBe('Home');
    await naviga('/non-esiste');
    expect(router.url).toBe('/home');
  });

  it('filtra ignorando spazi e maiuscole, calcola la media e gestisce zero risultati', async () => {
    await naviga('/elenco');
    expect(righe()).toHaveLength(5);
    expect(root.querySelectorAll('tbody .text-danger')).toHaveLength(2);
    expect(root.querySelectorAll('tbody .text-success')).toHaveLength(3);
    await scrivi('filtro', ' 4a ');
    expect(righe()).toHaveLength(2);
    expect(
      root.querySelector('[data-testid="media-classe"]')?.textContent,
    ).toBe('7.30');
    await scrivi('filtro', '5C');
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Nessuno studente trovato',
    );
    expect(root.querySelector('[data-testid="media-classe"]')).toBeNull();
    await scrivi('filtro', '');
    expect(righe()).toHaveLength(5);
  });

  it('ordina una copia e propaga la rimozione alla home', async () => {
    await naviga('/elenco');
    const ids = service.studenti().map((s) => s.id);
    expect(righe()[0].textContent).toContain('Giulia Neri');
    await premi('Per media');
    expect(righe()[0].textContent).toContain('Marco Verdi');
    expect(service.studenti().map((s) => s.id)).toEqual(ids);
    righe()[0].querySelector('button')!.click();
    await aggiorna();
    expect(righe()).toHaveLength(4);
    await naviga('/home');
    expect(root.querySelector('[data-testid="numero"]')?.textContent).toBe('4');
    expect(root.querySelector('app-studente-card')?.textContent).toContain(
      'Luca Bianchi',
    );
  });

  it('valida il form, normalizza i dati e torna all’elenco dopo inserimento', async () => {
    service.rimuovi(2);
    await naviga('/inserimento');
    const salva = () =>
      root.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(salva().disabled).toBe(true);
    await scrivi('nome', '   ');
    expect(salva().disabled).toBe(true);
    await scrivi('nome', ' Anna Blu ');
    await scrivi('classe', ' 4c ');
    await scrivi('media', '11');
    expect(salva().disabled).toBe(true);
    // Anche un submit diretto invalido non salva.
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await aggiorna();
    expect(service.numero()).toBe(4);
    await scrivi('media', '');
    expect(salva().disabled).toBe(true);
    await scrivi('media', '9.1');
    expect(salva().disabled).toBe(false);
    await premi('Salva');
    expect(router.url).toBe('/elenco');
    expect(service.trova(6)).toEqual({
      id: 6,
      nome: 'Anna Blu',
      classe: '4C',
      mediaVoti: 9.1,
    });
    expect(root.textContent).toContain('Anna Blu');
  });

  it('aggiorna il dettaglio al cambio di parametro, ricomincia dal primo e rimuove tramite output', async () => {
    await naviga('/elenco/2');
    expect(root.querySelector('app-studente-card')?.textContent).toContain(
      'Sara Rossi',
    );
    await premi('Studente successivo');
    expect(router.url).toBe('/elenco/3');
    expect(root.querySelector('app-studente-card')?.textContent).toContain(
      'Marco Verdi',
    );
    await naviga('/elenco/5');
    await premi('Studente successivo');
    expect(router.url).toBe('/elenco/1');
    await premi('Rimuovi dal registro');
    expect(router.url).toBe('/elenco');
    expect(service.trova(1)).toBeUndefined();
  });

  it('reindirizza dettagli e modifiche con id inesistenti o non numerici', async () => {
    for (const url of ['/elenco/99', '/elenco/abc', '/modifica/99']) {
      await naviga(url);
      expect(router.url).toBe('/elenco');
    }
  });

  it('copia i dati nel form, non modifica prima del submit e salva tornando al dettaglio', async () => {
    await naviga('/modifica/2');
    expect(root.querySelector<HTMLInputElement>('#nome')?.value).toBe(
      'Sara Rossi',
    );
    await scrivi('nome', ' Sara Nuova ');
    await scrivi('classe', '4a');
    await scrivi('media', '9.5');
    expect(service.trova(2)?.nome).toBe('Sara Rossi');
    await premi('Salva');
    expect(router.url).toBe('/elenco/2');
    expect(root.querySelector('app-studente-card')?.textContent).toContain(
      'Sara Nuova',
    );
    expect(service.trova(2)?.classe).toBe('4A');
    await naviga('/home');
    expect(root.querySelector('app-studente-card')?.textContent).toContain(
      'Sara Nuova',
    );
  });

  it('aggiorna il form anche passando direttamente a un altro id di modifica', async () => {
    await naviga('/modifica/1');
    await scrivi('nome', 'Modifica non salvata');
    await naviga('/modifica/3');
    expect(root.querySelector<HTMLInputElement>('#nome')?.value).toBe(
      'Marco Verdi',
    );
    expect(service.trova(1)?.nome).toBe('Luca Bianchi');
  });

  it('gestisce il registro vuoto senza medie non finite', async () => {
    service.studenti().forEach((s) => service.rimuovi(s.id));
    await naviga('/home');
    expect(root.querySelector('[data-testid="numero"]')?.textContent).toBe('0');
    expect(root.querySelector('app-studente-card')).toBeNull();
    await naviga('/elenco');
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'Il registro è vuoto',
    );
    expect(root.textContent).not.toContain('NaN');
  });
});

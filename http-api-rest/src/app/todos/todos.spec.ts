import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Todos } from './todos';

const base = 'https://jsonplaceholder.typicode.com/todos';
const dati = [
  { id: 1, userId: 1, title: 'Studiare HTTP', completed: false },
  { id: 2, userId: 1, title: 'Ripassare JSON', completed: true },
];

describe('Todos: interfaccia e richieste HTTP', () => {
  let fixture: ComponentFixture<Todos>;
  let root: HTMLElement;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Todos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Todos);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });
  afterEach(() => http.verify());
  function click(testo: string): void {
    const button = Array.from(root.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === testo,
    );
    expect(button, testo).toBeDefined();
    button!.click();
    fixture.detectChanges();
  }
  async function aggiorna(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function caricato(): Promise<void> {
    http.expectOne(base + '?userId=1').flush(dati);
    await aggiorna();
  }
  async function titolo(value: string): Promise<void> {
    const input = root.querySelector<HTMLInputElement>('#titolo')!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await aggiorna();
  }

  it('mostra caricamento, elenco, badge e conteggio', async () => {
    expect(root.textContent).toContain('Caricamento attività');
    await caricato();
    expect(root.querySelectorAll('li')).toHaveLength(2);
    expect(root.querySelectorAll('.badge')).toHaveLength(1);
    expect(
      root.querySelector('[data-testid="conteggio"]')?.textContent,
    ).toContain('1 su 2');
    expect(root.querySelector('.spinner-border')).toBeNull();
  });

  it('mostra una lista vuota con HTTP 200 per utente 99', async () => {
    await caricato();
    click('Utente 99');
    http.expectOne(base + '?userId=99').flush([]);
    await aggiorna();
    expect(root.textContent).toContain('Nessuna attività per questo utente');
    expect(root.querySelector('[role="alert"]')).toBeNull();
  });

  it('annulla un caricamento precedente quando cambia utente', async () => {
    const prima = http.expectOne(base + '?userId=1');
    click('Utente 2');
    expect(prima.cancelled).toBe(true);
    http
      .expectOne(base + '?userId=2')
      .flush([{ ...dati[0], userId: 2, title: 'Solo utente due' }]);
    await aggiorna();
    expect(root.textContent).toContain('Solo utente due');
    expect(fixture.componentInstance.utente()).toBe(2);
  });

  it('mostra un errore GET e consente di riprovare', async () => {
    http
      .expectOne(base + '?userId=1')
      .flush({}, { status: 500, statusText: 'Internal Server Error' });
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Errore 500',
    );
    expect(fixture.componentInstance.loading()).toBe(false);
    click('Riprova');
    http.expectOne(base + '?userId=1').flush(dati);
    await aggiorna();
    expect(root.querySelectorAll('li')).toHaveLength(2);
    expect(root.querySelector('[role="alert"]')).toBeNull();
  });

  it('distingue gli errori di rete con status 0', async () => {
    http.expectOne(base + '?userId=1').error(new ProgressEvent('error'));
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Errore 0',
    );
    expect(root.textContent).toContain('proxy');
  });

  it('rifiuta titoli vuoti o di soli spazi senza POST', async () => {
    await caricato();
    await titolo('   ');
    expect(
      root.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled,
    ).toBe(true);
    fixture.componentInstance.aggiungi();
    http.expectNone((req) => req.method === 'POST');
  });

  it('invia POST per l’utente selezionato, mostra JSON e non finge persistenza', async () => {
    await caricato();
    click('Utente 2');
    http.expectOne(base + '?userId=2').flush([{ ...dati[0], userId: 2 }]);
    await aggiorna();
    await titolo('  Studiare REST  ');
    click('Invia');
    const post = http.expectOne(base);
    expect(post.request.body).toEqual({
      userId: 2,
      title: 'Studiare REST',
      completed: false,
    });
    expect(fixture.componentInstance.invio()).toBe(true);
    post.flush(
      { ...post.request.body, id: 201 },
      { status: 201, statusText: 'Created' },
    );
    await aggiorna();
    expect(root.querySelector('pre')?.textContent).toContain('201');
    expect(root.querySelector<HTMLInputElement>('#titolo')?.value).toBe('');
    expect(root.querySelectorAll('li')).toHaveLength(1);
    expect(fixture.componentInstance.invio()).toBe(false);
    click('Utente 1');
    http.expectOne(base + '?userId=1').flush(dati);
    await aggiorna();
    expect(root.querySelector('pre')).toBeNull();
  });

  it('evita POST duplicate e conserva il titolo dopo un fallimento', async () => {
    await caricato();
    await titolo('Non perdere questo titolo');
    click('Invia');
    fixture.componentInstance.aggiungi();
    const richieste = http.match((req) => req.method === 'POST');
    expect(richieste).toHaveLength(1);
    richieste[0].flush({}, { status: 400, statusText: 'Bad Request' });
    await aggiorna();
    expect(root.textContent).toContain('Invio non riuscito');
    expect(root.querySelector<HTMLInputElement>('#titolo')?.value).toBe(
      'Non perdere questo titolo',
    );
    expect(fixture.componentInstance.invio()).toBe(false);
  });

  it('rimuove con filter soltanto dopo il successo DELETE e aggiorna il conteggio', async () => {
    await caricato();
    root
      .querySelector<HTMLButtonElement>(
        '[aria-label="Elimina Ripassare JSON"]',
      )!
      .click();
    fixture.detectChanges();
    const req = http.expectOne(base + '/2');
    expect(req.request.method).toBe('DELETE');
    expect(fixture.componentInstance.todos()).toHaveLength(2);
    fixture.componentInstance.elimina(dati[1]);
    http.expectNone(base + '/2');
    req.flush({});
    await aggiorna();
    expect(root.querySelectorAll('li')).toHaveLength(1);
    expect(
      root.querySelector('[data-testid="conteggio"]')?.textContent,
    ).toContain('0 su 1');
    expect(fixture.componentInstance.eliminando().size).toBe(0);
  });

  it('mantiene la riga dopo un errore DELETE e permette di riprovare', async () => {
    await caricato();
    fixture.componentInstance.elimina(dati[0]);
    http
      .expectOne(base + '/1')
      .flush({}, { status: 403, statusText: 'Forbidden' });
    await aggiorna();
    expect(root.querySelectorAll('li')).toHaveLength(2);
    expect(root.textContent).toContain('Eliminazione non riuscita');
    fixture.componentInstance.elimina(dati[0]);
    http
      .expectOne(base + '/1')
      .flush(null, { status: 204, statusText: 'No Content' });
    await aggiorna();
    expect(root.querySelectorAll('li')).toHaveLength(1);
    expect(fixture.componentInstance.erroreEliminazione()).toBeNull();
  });

  it('verifica il 404 separatamente senza nascondere l’elenco', async () => {
    await caricato();
    click('Verifica HTTP 404');
    http
      .expectOne(base + '/999')
      .flush({}, { status: 404, statusText: 'Not Found' });
    await aggiorna();
    expect(root.textContent).toContain('HTTP 404 Not Found');
    expect(root.querySelectorAll('li')).toHaveLength(2);
    expect(fixture.componentInstance.provaInCorso()).toBe(false);
  });

  it('non scambia un problema di rete della prova per un 404', async () => {
    await caricato();
    click('Verifica HTTP 404');
    http.expectOne(base + '/999').error(new ProgressEvent('error'));
    await aggiorna();
    expect(fixture.componentInstance.risultatoProva()).toContain('Errore 0');
    expect(fixture.componentInstance.risultatoProva()).not.toContain(
      'HTTP 404',
    );
  });

  it('annulla la richiesta quando il componente viene distrutto', () => {
    const req = http.expectOne(base + '?userId=1');
    fixture.destroy();
    expect(req.cancelled).toBe(true);
  });
});

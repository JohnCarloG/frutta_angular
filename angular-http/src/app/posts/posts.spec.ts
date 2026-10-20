import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Posts } from './posts';
const base = 'https://jsonplaceholder.typicode.com/posts';
const post = { id: 1, userId: 1, title: 'Titolo di prova', body: 'Contenuto' };

describe('Pagina Post', () => {
  let fixture: ComponentFixture<Posts>;
  let root: HTMLElement;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Posts],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Posts);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });
  afterEach(() => http.verify());
  function button(testo: string): HTMLButtonElement {
    return Array.from(root.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === testo,
    )!;
  }
  async function aggiorna(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('carica un singolo post e mostra JSON dopo lo spinner', async () => {
    button('Carica un post').click();
    fixture.detectChanges();
    expect(root.querySelector('[role="status"]')).not.toBeNull();
    expect(button('Carica tutti').disabled).toBe(true);
    http.expectOne(base + '/1').flush(post);
    await aggiorna();
    expect(root.querySelector('pre')?.textContent).toContain('Titolo di prova');
    expect(root.querySelector('[role="status"]')).toBeNull();
  });

  it('mostra errore 404 e consente un nuovo caricamento', async () => {
    fixture.componentInstance.caricaUno('999');
    http
      .expectOne(base + '/999')
      .flush({}, { status: 404, statusText: 'Not Found' });
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('404');
    button('Carica tutti').click();
    http.expectOne(base).flush([post]);
    await aggiorna();
    expect(root.querySelector('[role="alert"]')).toBeNull();
    expect(
      root.querySelector('[data-testid="titolo-lista"]')?.textContent,
    ).toContain('Tutti i post: 1');
  });

  it('rifiuta id vuoti, negativi o non interi senza HTTP', () => {
    for (const id of ['', '0', '-2', '1.5', 'abc'])
      fixture.componentInstance.caricaUno(id);
    http.expectNone(() => true);
    expect(fixture.componentInstance.errore()).toContain('intero positivo');
  });

  it('mostra tutti i post e gestisce anche la lista vuota', async () => {
    button('Carica tutti').click();
    http
      .expectOne(base)
      .flush(Array.from({ length: 100 }, (_, i) => ({ ...post, id: i + 1 })));
    await aggiorna();
    expect(root.querySelectorAll('.list-group-item')).toHaveLength(100);
    button('Carica tutti').click();
    http.expectOne(base).flush([]);
    await aggiorna();
    expect(root.textContent).toContain('Nessun post trovato');
  });

  it('mostra id 101 senza aggiungere artificialmente il post alla lista', async () => {
    button('Invia un post').click();
    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    req.flush(
      { ...req.request.body, id: 101 },
      { status: 201, statusText: 'Created' },
    );
    await aggiorna();
    expect(root.querySelector('pre')?.textContent).toContain('101');
    expect(fixture.componentInstance.posts()).toHaveLength(0);
  });

  it('disabilita i bordi della paginazione e aggiorna solo dopo il successo', async () => {
    expect(button('Precedente').disabled).toBe(true);
    button('Successiva').click();
    const req = http.expectOne(
      (r) => r.url === base && r.params.get('_page') === '2',
    );
    expect(fixture.componentInstance.pagina()).toBe(1);
    req.flush([{ ...post, id: 11 }]);
    await aggiorna();
    expect(fixture.componentInstance.pagina()).toBe(2);
    expect(
      root.querySelector('[data-testid="titolo-lista"]')?.textContent,
    ).toContain('pagina 2');
    fixture.componentInstance.caricaPagina(10);
    http
      .expectOne((r) => r.params.get('_page') === '10')
      .flush([{ ...post, id: 91 }]);
    await aggiorna();
    expect(button('Successiva').disabled).toBe(true);
    fixture.componentInstance.caricaPagina(11);
    fixture.componentInstance.caricaPagina(0);
    http.expectNone(() => true);
  });

  it('gestisce errori di rete senza lasciare loading attivo', async () => {
    fixture.componentInstance.caricaTutti();
    http.expectOne(base).error(new ProgressEvent('error'));
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Errore 0',
    );
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('annulla la richiesta quando si lascia la pagina', () => {
    fixture.componentInstance.caricaTutti();
    const req = http.expectOne(base);
    fixture.destroy();
    expect(req.cancelled).toBe(true);
  });
});

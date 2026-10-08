import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { OrdineService } from './services/ordine-service';

registerLocaleData(localeIt);

describe('Hamburgeria: componenti e routing', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    router = TestBed.inject(Router);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  async function naviga(url: string): Promise<void> {
    await router.navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function premi(label: string): Promise<void> {
    const button = Array.from(root.querySelectorAll('button')).find(
      (b) =>
        b.getAttribute('aria-label') === label ||
        b.textContent?.trim() === label,
    );
    expect(button, `Pulsante ${label}`).toBeDefined();
    button!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('reindirizza la radice e le route sconosciute al menu', async () => {
    await naviga('/');
    expect(router.url).toBe('/menu');
    expect(root.querySelector('h1')?.textContent).toBe('Il nostro menu');
    expect(root.querySelectorAll('.menu-list > li')).toHaveLength(5);
    await naviga('/pagina-inesistente');
    expect(router.url).toBe('/menu');
  });

  it('condivide ordine e contatore tra pagine, anche dopo aver ricreato il menu', async () => {
    await naviga('/menu');
    await premi('Aggiungi Hamburger classico');
    await premi('Aggiungi Hamburger classico');
    await premi('Aggiungi Patatine');
    expect(
      root.querySelector('[data-testid="numero-pezzi"]')?.textContent,
    ).toBe('3');
    await naviga('/riepilogo');
    expect(root.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(root.querySelector('[data-testid="totale"]')?.textContent).toContain(
      '20,50',
    );
    expect(root.querySelector('.highlight')?.textContent).toContain(
      'Hamburger classico',
    );
    await naviga('/menu');
    expect(root.querySelector('.selected')?.textContent).toContain('2');
    expect(fixture.componentInstance.ordine).toBe(
      TestBed.inject(OrdineService),
    );
  });

  it('gestisce −1, rimozione e svuotamento dal riepilogo', async () => {
    await naviga('/menu');
    await premi('Aggiungi Hamburger classico');
    await premi('Aggiungi Hamburger classico');
    await premi('Aggiungi Patatine');
    await naviga('/riepilogo');
    await premi('Togli un pezzo di Hamburger classico');
    expect(
      root.querySelector('[data-testid="numero-pezzi"]')?.textContent,
    ).toBe('2');
    await premi('Togli un pezzo di Hamburger classico');
    expect(root.querySelectorAll('tbody tr')).toHaveLength(1);
    await premi('Rimuovi Patatine');
    expect(root.textContent).toContain('Il tuo ordine è vuoto');
    await naviga('/menu');
    await premi('Aggiungi Bibita');
    await naviga('/riepilogo');
    await premi("Svuota l'ordine");
    expect(
      root.querySelector('[data-testid="numero-pezzi"]')?.textContent,
    ).toBe('0');
    expect(root.querySelector('a.button')?.getAttribute('href')).toBe('/menu');
  });
});

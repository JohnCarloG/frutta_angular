import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Pokedex } from './pokedex';
const base = 'https://pokeapi.co/api/v2';
const pikachu = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  sprites: {
    front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  },
};
describe('Pagina Pokédex', () => {
  let fixture: ComponentFixture<Pokedex>;
  let root: HTMLElement;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pokedex],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Pokedex);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });
  afterEach(() => http.verify());
  async function aggiorna(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function tipi(): Promise<void> {
    http
      .expectOne(base + '/type')
      .flush({
        count: 1,
        next: null,
        previous: null,
        results: [{ name: 'electric', url: base + '/type/13' }],
      });
    await aggiorna();
  }
  it('mostra i tipi e converte altezza e peso', async () => {
    await tipi();
    expect(root.querySelector('.badge')?.textContent).toBe('electric');
    const input = root.querySelector<HTMLInputElement>('#ricerca')!;
    input.value = ' PiKaChu ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await aggiorna();
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    http.expectOne(base + '/pokemon/pikachu').flush(pikachu);
    await aggiorna();
    expect(root.querySelector('img')?.getAttribute('src')).toBe(
      pikachu.sprites.front_default,
    );
    expect(root.textContent).toContain('0.4 m');
    expect(root.textContent).toContain('6 kg');
  });
  it('mostra Pokémon non trovato con 404 e distingue gli altri errori', async () => {
    await tipi();
    fixture.componentInstance.ricerca.set('inesistente');
    fixture.componentInstance.cerca();
    http
      .expectOne(base + '/pokemon/inesistente')
      .flush({}, { status: 404, statusText: 'Not Found' });
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Pokémon non trovato',
    );
    fixture.componentInstance.cerca();
    http
      .expectOne(base + '/pokemon/inesistente')
      .error(new ProgressEvent('error'));
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Errore 0',
    );
  });
  it('ricerca per numero e gestisce sprite mancante', async () => {
    await tipi();
    fixture.componentInstance.ricerca.set('25');
    fixture.componentInstance.cerca();
    http
      .expectOne(base + '/pokemon/25')
      .flush({ ...pikachu, sprites: { front_default: null } });
    await aggiorna();
    expect(root.querySelector('img')).toBeNull();
    expect(root.textContent).toContain('Immagine non disponibile');
  });
  it('gestisce errore dei tipi e ricerca indipendente', async () => {
    http
      .expectOne(base + '/type')
      .flush({}, { status: 500, statusText: 'Server Error' });
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('500');
    fixture.componentInstance.ricerca.set('25');
    fixture.componentInstance.cerca();
    http.expectOne(base + '/pokemon/25').flush(pikachu);
    await aggiorna();
    expect(root.textContent).toContain('pikachu');
  });
});

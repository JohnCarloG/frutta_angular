import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PostService } from './post-service';
import { CatService } from './cat-service';
import { NasaService } from './nasa-service';
import { PokemonService } from './pokemon-service';

const posts = 'https://jsonplaceholder.typicode.com/posts';
const apod = 'https://api.nasa.gov/planetary/apod';
const poke = 'https://pokeapi.co/api/v2';

describe('Servizi: contratto HTTP', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('PostService espone Observable cold e GET tipizzate', () => {
    const service = TestBed.inject(PostService);
    const risposta = service.getPosts();
    http.expectNone(posts);
    const next = vi.fn();
    risposta.subscribe(next);
    const req = http.expectOne(posts);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, userId: 1, title: 'Titolo', body: 'Testo' }]);
    expect(next.mock.calls[0][0][0].title).toBe('Titolo');
    service.getPost(42).subscribe();
    const singolo = http.expectOne(posts + '/42');
    expect(singolo.request.method).toBe('GET');
    singolo.flush({ id: 42, userId: 1, title: '42', body: 'Testo' });
  });

  it('POST invia un oggetto senza id e riceve 201', () => {
    const nuovo = {
      userId: 1,
      title: 'Primo post da Angular',
      body: 'Inviato con HttpClient',
    };
    const next = vi.fn();
    TestBed.inject(PostService).addPost(nuovo).subscribe(next);
    const req = http.expectOne(posts);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuovo);
    expect(req.request.detectContentTypeHeader()).toBe('application/json');
    req.flush({ ...nuovo, id: 101 }, { status: 201, statusText: 'Created' });
    expect(next.mock.calls[0][0].id).toBe(101);
  });

  it('la paginazione costruisce _page e _limit', () => {
    TestBed.inject(PostService).getPagina(2).subscribe();
    const req = http.expectOne(
      (r) =>
        r.url === posts &&
        r.params.get('_page') === '2' &&
        r.params.get('_limit') === '10',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('CatService richiede il fatto casuale', () => {
    const next = vi.fn();
    TestBed.inject(CatService).getRandomFact().subscribe(next);
    const req = http.expectOne('https://catfact.ninja/fact');
    expect(req.request.method).toBe('GET');
    req.flush({ fact: 'Cats purr.', length: 10 });
    expect(next).toHaveBeenCalledWith({ fact: 'Cats purr.', length: 10 });
  });

  it('NASA inserisce la chiave nei params e non nel body', () => {
    TestBed.inject(NasaService).getApod().subscribe();
    const req = http.expectOne((r) => r.url === apod);
    expect(req.request.params.has('api_key')).toBe(true);
    expect(req.request.params.has('date')).toBe(false);
    expect(req.request.body).toBeNull();
    req.flush({});
  });

  it('NASA aggiunge la data richiesta', () => {
    TestBed.inject(NasaService).getApodDel('2020-01-01').subscribe();
    const req = http.expectOne(
      (r) => r.url === apod && r.params.get('date') === '2020-01-01',
    );
    expect(req.request.params.has('api_key')).toBe(true);
    req.flush({});
  });

  it('PokemonService legge tipi e normalizza nome o numero', () => {
    const service = TestBed.inject(PokemonService);
    service.getTipi().subscribe();
    http
      .expectOne(poke + '/type')
      .flush({
        count: 1,
        next: null,
        previous: null,
        results: [{ name: 'electric', url: poke + '/type/13' }],
      });
    for (const [query, atteso] of [
      [' PiKaChu ', 'pikachu'],
      ['25', '25'],
      ['a/b', 'a%2Fb'],
    ]) {
      service.cerca(query).subscribe();
      const req = http.expectOne(poke + '/pokemon/' + atteso);
      expect(req.request.method).toBe('GET');
      req.flush({});
    }
  });
});

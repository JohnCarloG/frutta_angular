import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Nasa } from './nasa';
const url = 'https://api.nasa.gov/planetary/apod';
const apod = {
  date: '2020-01-01',
  title: 'Una galassia',
  explanation: 'Spiegazione',
  url: 'https://apod.nasa.gov/apod/image/test.jpg',
  media_type: 'image',
};
describe('Pagina NASA', () => {
  let fixture: ComponentFixture<Nasa>;
  let root: HTMLElement;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nasa],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Nasa);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });
  afterEach(() => http.verify());
  async function aggiorna(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }
  it('mostra immagine, titolo, data e copyright opzionale', async () => {
    http
      .expectOne((r) => r.url === url)
      .flush({ ...apod, copyright: 'Autore' });
    await aggiorna();
    const img = root.querySelector('img')!;
    expect(img.getAttribute('src')).toBe(apod.url);
    expect(img.alt).toBe(apod.title);
    expect(root.textContent).toContain('2020-01-01');
    expect(root.textContent).toContain('© Autore');
  });
  it('mostra un link sicuro per un video senza un tag immagine', async () => {
    http
      .expectOne((r) => r.url === url)
      .flush({
        ...apod,
        media_type: 'video',
        url: 'https://www.youtube.com/embed/example',
      });
    await aggiorna();
    expect(root.querySelector('img')).toBeNull();
    expect(
      root.querySelector('a[target="_blank"]')?.getAttribute('rel'),
    ).toContain('noopener');
  });
  it.each([
    [403, 'Chiave API'],
    [429, 'Troppe richieste'],
    [500, 'Errore 500'],
    [400, 'data non valida o futura'],
  ])(
    'gestisce status %s senza mostrare URL o chiavi',
    async (status, testo) => {
      http
        .expectOne((r) => r.url === url)
        .flush({}, { status: Number(status), statusText: 'Errore' });
      await aggiorna();
      expect(root.querySelector('[role="alert"]')?.textContent).toContain(
        String(testo),
      );
      expect(root.querySelector('[role="alert"]')?.textContent).not.toContain(
        'api_key',
      );
      expect(fixture.componentInstance.loading()).toBe(false);
    },
  );
  it('gestisce status 0', async () => {
    http.expectOne((r) => r.url === url).error(new ProgressEvent('error'));
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'non è raggiungibile',
    );
  });
  it('invia la data scelta, anche futura, e mostra la risposta 400', async () => {
    http.expectOne((r) => r.url === url).flush(apod);
    await aggiorna();
    const input = root.querySelector<HTMLInputElement>('#data')!;
    input.value = '2099-01-01';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await aggiorna();
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const req = http.expectOne(
      (r) => r.url === url && r.params.get('date') === '2099-01-01',
    );
    req.flush(
      { msg: 'Date must be before today' },
      { status: 400, statusText: 'Bad Request' },
    );
    await aggiorna();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Errore 400',
    );
    expect(root.querySelector('img')).toBeNull();
  });
});

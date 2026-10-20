import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Gatti } from './gatti';
const url = 'https://catfact.ninja/fact';
describe('Pagina Gatti', () => {
  let fixture: ComponentFixture<Gatti>;
  let root: HTMLElement;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gatti],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Gatti);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });
  afterEach(() => http.verify());
  it('carica subito un fatto e blocca richieste duplicate', async () => {
    expect(root.querySelector('button')!.disabled).toBe(true);
    fixture.componentInstance.nuovoFatto();
    const richieste = http.match(url);
    expect(richieste).toHaveLength(1);
    richieste[0].flush({ fact: 'Cats sleep.', length: 11 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.textContent).toContain('Cats sleep.');
    expect(root.textContent).toContain('11 caratteri');
    expect(root.querySelector('button')!.disabled).toBe(false);
    root.querySelector('button')!.click();
    http.expectOne(url).flush({ fact: 'Another fact.', length: 13 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.textContent).toContain('Another fact.');
  });
  it('consente di riprovare dopo un errore', async () => {
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('500');
    root.querySelector('button')!.click();
    http.expectOne(url).flush({ fact: 'Recovered', length: 9 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.querySelector('[role="alert"]')).toBeNull();
  });
});

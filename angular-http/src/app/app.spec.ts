import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { routes } from './app.routes';
import { App } from './app';
it('naviga tra le quattro pagine, attiva il menu e applica i redirect', async () => {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(App);
  const root: HTMLElement = fixture.nativeElement;
  const router = TestBed.inject(Router);
  const http = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  await router.navigateByUrl('/');
  fixture.detectChanges();
  expect(router.url).toBe('/posts');
  expect(root.querySelector('nav a.active')?.textContent).toBe('Post');
  await router.navigateByUrl('/gatti');
  fixture.detectChanges();
  http
    .expectOne('https://catfact.ninja/fact')
    .flush({ fact: 'Cats', length: 4 });
  await fixture.whenStable();
  fixture.detectChanges();
  expect(root.querySelector('h1')?.textContent).toBe('Fatti sui gatti');
  await router.navigateByUrl('/nasa');
  fixture.detectChanges();
  http
    .expectOne((r) => r.url === 'https://api.nasa.gov/planetary/apod')
    .flush({}, { status: 429, statusText: 'Too Many Requests' });
  await fixture.whenStable();
  fixture.detectChanges();
  expect(root.querySelector('nav a.active')?.textContent).toBe('NASA');
  await router.navigateByUrl('/pokedex');
  fixture.detectChanges();
  http
    .expectOne('https://pokeapi.co/api/v2/type')
    .flush({ count: 0, next: null, previous: null, results: [] });
  await fixture.whenStable();
  fixture.detectChanges();
  expect(root.querySelector('nav a.active')?.textContent).toBe('Pokédex');
  await router.navigateByUrl('/non-esiste');
  expect(router.url).toBe('/posts');
  http.verify();
});

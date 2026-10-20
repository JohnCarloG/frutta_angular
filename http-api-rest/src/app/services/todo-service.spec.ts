import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TodoService } from './todo-service';

const base = 'https://jsonplaceholder.typicode.com/todos';
const todo = { id: 1, userId: 1, title: 'Studiare HTTP', completed: false };

describe('TodoService: contratto HTTP', () => {
  let service: TodoService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TodoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('costruisce la query string userId e restituisce gli oggetti', () => {
    const next = vi.fn();
    service.getTodos(2).subscribe(next);
    const req = http.expectOne(base + '?userId=2');
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeNull();
    req.flush([{ ...todo, userId: 2 }]);
    expect(next).toHaveBeenCalledWith([{ ...todo, userId: 2 }]);
  });

  it('non invia richieste senza subscribe e ne invia due con due subscribe', () => {
    const risposta = service.getTodos(1);
    http.expectNone(base + '?userId=1');
    risposta.subscribe();
    risposta.subscribe();
    const richieste = http.match(base + '?userId=1');
    expect(richieste).toHaveLength(2);
    richieste.forEach((req) => req.flush([]));
  });

  it('legge il dettaglio dall’endpoint corretto', () => {
    const next = vi.fn();
    service.getTodo(1).subscribe(next);
    const req = http.expectOne(base + '/1');
    expect(req.request.method).toBe('GET');
    req.flush(todo);
    expect(next).toHaveBeenCalledWith(todo);
  });

  it('propaga 404 al gestore error', () => {
    const error = vi.fn();
    service.getTodo(999).subscribe({ error });
    http
      .expectOne(base + '/999')
      .flush({}, { status: 404, statusText: 'Not Found' });
    expect(error.mock.calls[0][0]).toBeInstanceOf(HttpErrorResponse);
    expect(error.mock.calls[0][0].status).toBe(404);
  });

  it('invia un oggetto POST senza id e legge la risposta 201', () => {
    const nuovo = { userId: 2, title: 'Studiare REST', completed: false };
    const next = vi.fn();
    service.addTodo(nuovo).subscribe(next);
    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuovo);
    expect(typeof req.request.body).toBe('object');
    expect(req.request.detectContentTypeHeader()).toBe('application/json');
    req.flush({ ...nuovo, id: 201 }, { status: 201, statusText: 'Created' });
    expect(next).toHaveBeenCalledWith({ ...nuovo, id: 201 });
  });

  it('invia DELETE senza body e gestisce risposta 200 o 204', () => {
    for (const status of [200, 204]) {
      const next = vi.fn();
      service.deleteTodo(1).subscribe(next);
      const req = http.expectOne(base + '/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      req.flush(status === 204 ? null : {}, {
        status,
        statusText: status === 204 ? 'No Content' : 'OK',
      });
      expect(next).toHaveBeenCalledOnce();
    }
  });
});

import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../modelli/todo';

@Service()
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com/todos';

  getTodos(userId: number): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.baseUrl, { params: { userId } });
  }

  getTodo(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`);
  }

  addTodo(nuovo: Omit<Todo, 'id'>): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, nuovo);
  }

  deleteTodo(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';

const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private url = 'http://localhost:3000';
  private apiUrl = this.url + '/api';

  constructor(private http: HttpClient, private router: Router) {}

  dashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`).pipe(catchError(error => {
      this.router.navigate(['/error', { queryParams: { error: error.message } }]);
      return of({})
    }));
  }

  tickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets`).pipe(catchError(error => {
      this.router.navigate(['/error', { queryParams: { error: error.message } }]);
      return of({})
    }));
  }

  ticket(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets/${id}`).pipe(catchError(error => {
      this.router.navigate(['/error', { queryParams: { error: error.message } }]);
      return of({})
    }));
  }

  profile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`).pipe(catchError(error => {
      this.router.navigate(['/error', { queryParams: { error: error.message } }]);
      return of({})
    }))
  }

  profileUpdate(name: string, email: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, { name, email }, { headers }).pipe(catchError(error => {
      this.router.navigate(['/error', { queryParams: { error: error.message } }]);
      return of({})
    }))
  }
}

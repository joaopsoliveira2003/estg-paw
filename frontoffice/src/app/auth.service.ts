import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private tokenKey = 'jwt';

  constructor(private http: HttpClient, private router : Router) {}

  login(credentials: { username: string; password: string }): Observable<string> {
    return this.http.post<{ error: string, token?: string, user: any }>(`${this.apiUrl}/login`, credentials, { headers }).pipe(
      map(res => {
        if (res.token && res.user) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem('name', res.user.name);
          localStorage.setItem('id', res.user._id);
          return '';
        }
        return res.error;
      }),
      catchError(error => {
        return of(error)
      })
    );
  }

  register(credentials: { name: string, email: string, nif: string; password: string }): Observable<string> {
    return this.http.post<{ error: string }>(`${this.apiUrl}/register`, credentials, { headers }).pipe(
      map(res => {
        return res.error;
      }),
      catchError(res => {
        return of(res.error)
      })
    );
  }

  password(credentials: { oldPassword: string, newPassword: string }): Observable<string> {
    return this.http.post<{ error: string }>(`${this.apiUrl}/password`, credentials, { headers }).pipe(
      map(res => {
        return res.error;
      }),
      catchError(res => {
        return of(res.error.error)
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('name');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}

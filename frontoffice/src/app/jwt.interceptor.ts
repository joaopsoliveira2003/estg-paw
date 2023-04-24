import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let jwt = localStorage.getItem('jwt')
    if (jwt) {
      request = request.clone({
        setHeaders: {
          "Authorization": `Bearer ${jwt}`
        }
      });
    }
    return next.handle(request);
  }
}

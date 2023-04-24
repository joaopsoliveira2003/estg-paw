import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.css',
    '../../assets/css/login.css'
  ]
})
export class LoginComponent {
  error: string;
  nif: string;
  password: string;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.error = '';
    this.nif = '';
    this.password = '';
  }

  login(): void {
    this.authService.login({ username: this.nif, password: this.password }).pipe().subscribe((error) => {
      if (error !== '') {
        this.error = error;
        return;
      }
      this.router.navigate(['/dashboard']);
    });
  }

}

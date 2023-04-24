import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css',
  '../../assets/css/login.css']
})

export class RegisterComponent{
  error: string;
  name: string;
  email: string;
  nif: string;
  password: string;

  constructor(private authService: AuthService, private router: Router) {
    this.error = '';
    this.name = '';
    this.email = '';
    this.nif = '';
    this.password = '';
  }

  register(): void {
    this.authService.register({ name: this.name, email: this.email, nif: this.nif, password: this.password }).pipe().subscribe((error) => {
      if (error !== '') {
        this.error = error;
        return;
      }
      this.authService.login({ username: this.nif, password: this.password }).pipe().subscribe((error) => {
        this.router.navigate(['/dashboard']);
      });
    });
  }
}

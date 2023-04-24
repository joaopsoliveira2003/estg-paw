import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: [
    './password.component.css',
    '../../assets/css/login.css'
  ]
})
export class PasswordComponent {
  error: string;
  oldPassword: string;
  newPassword: string;

  constructor(private authService: AuthService, private router: Router) {
    this.error = '';
    this.oldPassword = '';
    this.newPassword = '';
  }

  password() : void {
    this.authService.password({ oldPassword: this.oldPassword, newPassword: this.newPassword }).subscribe((error) => {
      if (error !== '') {
        this.error = error;
        return;
      }
      this.router.navigate(['/dashboard']);
    });
  }
}

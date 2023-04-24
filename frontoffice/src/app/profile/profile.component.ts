import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user: {
    name: string;
    email: string;
    nif: number;
    points: number;
    totalMoney: number;
  }
  tickets: any[];

  constructor(private api : ApiService) {
    this.user = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      nif: 123456789,
      points: 0,
      totalMoney: 0
    };
    this.tickets = [];
    this.api.profile().subscribe((data: any) => {
      this.user = data.user;
      this.user.totalMoney = 0;
      if (data.totalMoney.length > 0) {
        this.user.totalMoney = data.totalMoney[0].total;
      }
      this.tickets = data.tickets;

      console.log(data);
    });
  }

  updateProfile() {
    this.api.profileUpdate(this.user.name, this.user.email).subscribe((data: any) => {
      if (data.error == '') {
        localStorage.setItem('name', this.user.name);
        window.location.reload();
      }
    });
  }
}

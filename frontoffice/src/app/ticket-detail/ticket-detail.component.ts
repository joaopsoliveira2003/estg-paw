import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent {
  ticket: any = {};
  userID: string = '';
  userPoints: number = 0;
  fidelity: any = {};
  years: number = 0;
  finalPrice: number = 0;
  age: string = '';
  points: number = 0;
  acquisitions: number = 0;

  pointsDiscount: number = 0;
  clientYearsDiscount: number = 0;
  ageDiscount: number = 0;
  acquisitionsDiscount: number = 0;


  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {
    if (localStorage.getItem('id') == null) {
      this.router.navigate(['/login']);
      return;
    }
    this.userID = localStorage.getItem('id') || '';
    this.route.params.subscribe(params => {
      this.api.ticket(params['id']).pipe(catchError(error => {
        alert('Erro ao carregar ticket');
        return error;
      })).subscribe((data: any) => {
        this.ticket = data.ticket;
        this.finalPrice = this.ticket.price;
        this.userPoints = data.points;
        this.fidelity = data.fidelity;
        this.years = data.years;
        this.acquisitions = data.acquisitions;
      });
    });
  }

  calculateFinalPrice() {
    if (this.ticket.price == 0) {
      this.finalPrice = 0;
      return;
    }

    this.pointsDiscount = this.points / 100 * this.fidelity.points;
    this.clientYearsDiscount = this.years / 100 * this.fidelity.years;
    this.ageDiscount = this.fidelity.age[this.age] / 100 * this.ticket.price;
    this.acquisitionsDiscount = this.acquisitions / 100 * this.fidelity.acquisitions;
    if (isNaN(this.ageDiscount)) {
      this.ageDiscount = 0;
    }
    if (isNaN(this.clientYearsDiscount)) {
      this.clientYearsDiscount = 0;
    }
    if (this.points > this.userPoints) {
      alert('Não tem pontos suficientes');
      this.points = this.userPoints;
    }

    console.log("Points: " + this.pointsDiscount);
    console.log("Client Years: " + this.clientYearsDiscount);
    console.log("Age: " + this.ageDiscount);
    console.log("Acquisitions: " + this.acquisitionsDiscount);

    this.finalPrice = this.ticket.price - this.pointsDiscount - this.clientYearsDiscount - this.ageDiscount - this.acquisitionsDiscount;
    this.finalPrice = Math.round(this.finalPrice * 100) / 100;
    if (this.finalPrice < 0) {
      this.finalPrice = 0;
    } else if (this.finalPrice < 0.50) {
      alert("O preço final não pode ser inferior a 0.50€, tem de ser superior ou 0€");
    }
  }

  formatDate(inputValue: any): string {
    const data = new Date(inputValue);
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const hora = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia} ${hora}:${minutos}`;
  }
}

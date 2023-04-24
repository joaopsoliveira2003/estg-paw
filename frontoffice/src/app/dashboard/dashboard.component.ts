import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css']
})
export class DashboardComponent {
  acquiredTickets: number;
  availableEvents: number;
  todayEvents: number;
  futureEvents: number;
  ticketList: any[];

  constructor(private api: ApiService) {
    this.acquiredTickets = 0;
    this.availableEvents = 0;
    this.todayEvents = 0;
    this.futureEvents = 0;
    this.ticketList = [];
    api.dashboard().subscribe(res => {
      this.acquiredTickets = res.acquiredTickets;
      this.availableEvents = res.availableEvents;
      this.todayEvents = res.todayEvents;
      this.futureEvents = res.futureEvents;
      this.ticketList = res.ticketList;
    });
  }
}




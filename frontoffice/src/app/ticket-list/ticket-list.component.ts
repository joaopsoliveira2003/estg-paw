import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { TicketDetailComponent } from '../ticket-detail/ticket-detail.component';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent {
  ticketList: any[];
  searchTerm: string;
  ticketFilter: any[]

  constructor(private api : ApiService) {
    this.ticketList = [];
    this.ticketFilter = [];
    this.searchTerm = '';
    this.api.tickets().subscribe((data: any) => {
      this.ticketList = data.tickets;
      this.ticketFilter = data.tickets;
    });
  }

  search() {
    this.ticketFilter = this.ticketList.filter(item => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || item.event.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || item.patrimony.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    }
    );
  }
}

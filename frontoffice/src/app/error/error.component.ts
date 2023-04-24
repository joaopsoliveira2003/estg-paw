import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  error: any;

  constructor(private route: ActivatedRoute) {
    this.error = "Erro Desconhecido"
    this.route.params.subscribe(params => {
      this.error = params['error'];
    });
  }
}

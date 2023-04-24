import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth.guard';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordComponent } from './password/password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { ErrorComponent } from './error/error.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register'
  },
  {
    path: 'password',
    component: PasswordComponent,
    title: 'Password'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard',
    canActivate:[AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Perfil',
    canActivate:[AuthGuard]
  },
  {
    path: 'tickets',
    component: TicketListComponent,
    title: 'Bilhetes',
    canActivate:[AuthGuard]
  },
  {
    path: 'tickets/:id',
    component: TicketDetailComponent,
    title: 'Info Bilhete',
    canActivate:[AuthGuard]
  },
  {
    path: 'error/:error',
    component: ErrorComponent,
    title: 'Ocorreu um erro ao processar a sua solicitação.',
    canActivate:[AuthGuard]
  },
  {
    path: '**', redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

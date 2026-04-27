import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/appointments/appointments-list/appointments-list.component').then(
            m => m.AppointmentsListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/appointments/appointments-form/appointments-form.component').then(
            m => m.AppointmentsFormComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/appointments/appointments-form/appointments-form.component').then(
            m => m.AppointmentsFormComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/appointments' },
];

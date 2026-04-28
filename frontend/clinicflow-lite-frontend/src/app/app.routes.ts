import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Rutas públicas (auth)
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

  // Rutas protegidas — dentro del shell (sidebar + topbar)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/patients/patients-list/patients-list.component').then(
            m => m.PatientsListComponent
          ),
      },
      {
        path: 'appointments',
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
    ],
  },

  { path: '**', redirectTo: '/dashboard' },
];

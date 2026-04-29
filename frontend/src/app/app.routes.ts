import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Pública — acceso sin sesión
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

  // 403 — acceso denegado (fuera del shell para que se vea completa)
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/forbidden/forbidden.component').then(m => m.ForbiddenComponent),
  },

  // Rutas protegidas — dentro del shell
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

      // ── Pacientes ────────────────────────────────────────────────
      {
        path: 'patients',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/patients/patients-list/patients-list.component').then(
                m => m.PatientsListComponent
              ),
          },
          {
            path: 'new',
            canActivate: [roleGuard(['admin', 'receptionist'])],
            loadComponent: () =>
              import('./features/patients/patients-form/patients-form.component').then(
                m => m.PatientsFormComponent
              ),
          },
          {
            path: ':id/edit',
            canActivate: [roleGuard(['admin', 'receptionist'])],
            loadComponent: () =>
              import('./features/patients/patients-form/patients-form.component').then(
                m => m.PatientsFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/patients/patient-detail/patient-detail.component').then(
                m => m.PatientDetailComponent
              ),
          },
          {
            path: ':id/notes',
            loadComponent: () =>
              import('./features/clinical-notes/clinical-notes.component').then(
                m => m.ClinicalNotesComponent
              ),
          },
        ],
      },

      // ── Citas ────────────────────────────────────────────────────
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
            canActivate: [roleGuard(['admin', 'receptionist'])],
            loadComponent: () =>
              import('./features/appointments/appointments-form/appointments-form.component').then(
                m => m.AppointmentsFormComponent
              ),
          },
          {
            path: ':id/edit',
            canActivate: [roleGuard(['admin', 'receptionist'])],
            loadComponent: () =>
              import('./features/appointments/appointments-form/appointments-form.component').then(
                m => m.AppointmentsFormComponent
              ),
          },
        ],
      },

      // ── Admin exclusivo ──────────────────────────────────────────
      {
        path: 'reports',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'settings',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/settings.component').then(m => m.SettingsComponent),
      },
    ],
  },

  { path: '**', redirectTo: '/dashboard' },
];

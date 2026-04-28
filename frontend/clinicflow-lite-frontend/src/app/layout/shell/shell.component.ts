import { Component, inject } from '@angular/core';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="shell">
      <nav class="sidebar">
        <div class="sidebar-logo">
          <mat-icon class="logo-icon">medical_services</mat-icon>
          <span class="logo-text">ClinicFlow</span>
        </div>

        <ul class="nav-list">
          <li>
            <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
              <mat-icon>today</mat-icon>
              <span>Agenda hoy</span>
            </a>
          </li>
          <li>
            <a class="nav-item" routerLink="/patients" routerLinkActive="active">
              <mat-icon>people</mat-icon>
              <span>Pacientes</span>
            </a>
          </li>
          <li>
            <a class="nav-item" routerLink="/appointments" routerLinkActive="active">
              <mat-icon>event_note</mat-icon>
              <span>Historial</span>
            </a>
          </li>
          <li>
            <a class="nav-item nav-item--disabled">
              <mat-icon>healing</mat-icon>
              <span>Tratamientos</span>
            </a>
          </li>
          <li>
            <a class="nav-item nav-item--disabled">
              <mat-icon>bar_chart</mat-icon>
              <span>Informes</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <a class="nav-item nav-item--disabled">
            <mat-icon>settings</mat-icon>
            <span>Ajustes</span>
          </a>
          <button class="nav-item nav-item--logout" (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            <span>Salir</span>
          </button>
        </div>
      </nav>

      <div class="main-area">
        <header class="topbar">
          <span class="topbar-brand">ClinicFlow Lite</span>
          <div class="topbar-right">
            <span class="topbar-user">{{ auth.currentUser()?.name }}</span>
            <button mat-raised-button color="primary" routerLink="/appointments/new">
              <mat-icon>add</mat-icon> Nueva cita
            </button>
            <div class="user-avatar">{{ userInitial() }}</div>
          </div>
        </header>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px; min-width: 220px;
      background: var(--cf-dark);
      display: flex; flex-direction: column;
    }
    .sidebar-logo {
      display: flex; align-items: center; gap: 10px;
      padding: 22px 18px 20px;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .logo-icon { color: var(--cf-sky); font-size: 26px; height: 26px; width: 26px; }
    .logo-text { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: .3px; }

    .nav-list { list-style: none; padding: 8px 0; margin: 0; flex: 1; }
    .nav-list li { margin: 1px 8px; }

    .nav-item {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 14px;
      border-radius: 8px;
      color: rgba(255,255,255,.65);
      text-decoration: none;
      font-size: 14px; font-weight: 500;
      cursor: pointer;
      transition: background .15s, color .15s;
      border: none; background: none;
      width: 100%; text-align: left;
    }
    .nav-item mat-icon { font-size: 20px; height: 20px; width: 20px; flex-shrink: 0; }
    .nav-item:hover { background: rgba(255,255,255,.09); color: #fff; }
    .nav-item.active { background: var(--cf-primary); color: #fff; }
    .nav-item--disabled { opacity: .4; cursor: default; pointer-events: none; }
    .nav-item--disabled:hover { background: none; color: rgba(255,255,255,.65); }

    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid rgba(255,255,255,.1);
      display: flex; flex-direction: column; gap: 1px;
    }
    .nav-item--logout { color: rgba(255,255,255,.5); }
    .nav-item--logout:hover { color: #ff7b7b; background: rgba(255,80,80,.12); }

    /* ── Main area ── */
    .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    .topbar {
      height: 60px; min-height: 60px;
      background: #fff;
      border-bottom: 1px solid var(--cf-lighter);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px; gap: 16px;
    }
    .topbar-brand { font-weight: 700; font-size: 15px; color: var(--cf-dark); }
    .topbar-right { display: flex; align-items: center; gap: 14px; }
    .topbar-user { font-size: 13px; color: var(--cf-mid-dark); font-weight: 500; }

    .user-avatar {
      width: 36px; height: 36px;
      background: var(--cf-primary);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 14px;
      flex-shrink: 0;
    }

    .content { flex: 1; overflow-y: auto; background: var(--cf-bg); }
  `],
})
export class ShellComponent {
  auth = inject(AuthService);

  userInitial(): string {
    return (this.auth.currentUser()?.name ?? 'U').charAt(0).toUpperCase();
  }
}

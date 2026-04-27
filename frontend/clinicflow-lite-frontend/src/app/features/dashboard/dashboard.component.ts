import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentsService, DashboardStats } from '../../core/services/appointments.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Bienvenido, {{ auth.currentUser()?.name }}</h1>
          <p class="subtitle">Aquí tienes un resumen de tu actividad</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/appointments/new">
            <mat-icon>add</mat-icon> Nueva cita
          </button>
          <button mat-stroked-button routerLink="/appointments">
            <mat-icon>list</mat-icon> Ver todas las citas
          </button>
          <button mat-stroked-button (click)="auth.logout()">Salir</button>
        </div>
      </div>

      @if (stats()) {
        <div class="metrics-grid">
          <mat-card class="metric-card accent-blue">
            <mat-card-content>
              <mat-icon>event_note</mat-icon>
              <span class="metric-value">{{ stats()!.total }}</span>
              <span class="metric-label">Total citas</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card accent-green">
            <mat-card-content>
              <mat-icon>calendar_today</mat-icon>
              <span class="metric-value">{{ stats()!.thisWeek }}</span>
              <span class="metric-label">Próximos 7 días</span>
            </mat-card-content>
          </mat-card>

          @for (s of stats()!.byStatus; track s.status) {
            <mat-card class="metric-card">
              <mat-card-content>
                <span class="status-badge status-{{ s.status }}">{{ statusLabel(s.status) }}</span>
                <span class="metric-value">{{ s.count }}</span>
                <span class="metric-label">citas</span>
              </mat-card-content>
            </mat-card>
          }
        </div>

        @if (stats()!.recent.length > 0) {
          <mat-card class="recent-card">
            <mat-card-header>
              <mat-card-title>Actividad reciente</mat-card-title>
              <button mat-button routerLink="/appointments">Ver todas</button>
            </mat-card-header>
            <mat-card-content>
              @for (item of stats()!.recent; track item.id) {
                <div class="recent-item">
                  <div class="recent-info">
                    <span class="recent-title">{{ item.type || 'Sin tipo' }}</span>
                    <span class="recent-date">{{ item.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <span class="status-badge status-{{ item.status }}">{{ statusLabel(item.status) }}</span>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      }

    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 960px; margin: 0 auto; padding: 28px 16px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .dashboard-header h1 { margin: 0; }
    .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .subtitle { color: var(--cf-soft); margin-top: 4px; font-size: 15px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metric-card mat-card-content { display: flex; flex-direction: column; align-items: center; padding: 24px 16px; gap: 6px; }
    .metric-card mat-icon { font-size: 34px; height: 34px; width: 34px; }
    .accent-blue { background: linear-gradient(135deg, #e8f6fd, #d0eefa) !important; }
    .accent-blue mat-icon { color: var(--cf-primary); }
    .accent-green { background: linear-gradient(135deg, #e0f7fa, #b2ebf2) !important; }
    .accent-green mat-icon { color: var(--cf-bright); }
    .metric-value { font-size: 2.2rem; font-weight: 700; line-height: 1; color: var(--cf-dark); }
    .metric-label { font-size: 12px; color: var(--cf-mid-dark); font-weight: 500; }
    .recent-card { margin-bottom: 24px; background: #fff !important; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 0; }
    .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--cf-bg); }
    .recent-item:last-child { border-bottom: none; }
    .recent-info { display: flex; flex-direction: column; gap: 2px; }
    .recent-title { font-weight: 600; color: var(--cf-mid-dark); text-transform: capitalize; }
    .recent-date { font-size: 12px; color: var(--cf-soft); }
  `],
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private appointmentsService = inject(AppointmentsService);

  stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    this.appointmentsService.getDashboardStats().subscribe({
      next: (data) => this.stats.set(data),
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Programada', confirmed: 'Confirmada',
      completed: 'Completada', cancelled: 'Cancelada', no_show: 'No presentado',
    };
    return labels[status] ?? status;
  }
}

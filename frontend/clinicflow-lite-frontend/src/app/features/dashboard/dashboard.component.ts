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
        <button mat-stroked-button (click)="auth.logout()">Salir</button>
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

      <div class="quick-actions">
        <button mat-raised-button color="primary" routerLink="/appointments/new">
          <mat-icon>add</mat-icon> Nueva cita
        </button>
        <button mat-stroked-button routerLink="/appointments">
          <mat-icon>list</mat-icon> Ver todas las citas
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .subtitle { color: #666; margin-top: 4px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metric-card mat-card-content { display: flex; flex-direction: column; align-items: center; padding: 20px 16px; gap: 4px; }
    .metric-card mat-icon { font-size: 32px; height: 32px; width: 32px; color: #666; }
    .accent-blue mat-icon { color: #1565c0; }
    .accent-green mat-icon { color: #2e7d32; }
    .metric-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .metric-label { font-size: 13px; color: #666; }
    .recent-card { margin-bottom: 24px; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 0; }
    .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .recent-item:last-child { border-bottom: none; }
    .recent-info { display: flex; flex-direction: column; gap: 2px; }
    .recent-title { font-weight: 500; }
    .recent-date { font-size: 12px; color: #888; }
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    .status-badge { font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 500; }
    .status-scheduled { background: #e3f2fd; color: #1565c0; }
    .status-confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-completed { background: #f3e5f5; color: #6a1b9a; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
    .status-no_show { background: #fff3e0; color: #e65100; }
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

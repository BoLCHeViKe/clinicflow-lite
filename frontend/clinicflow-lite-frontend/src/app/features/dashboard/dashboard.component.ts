import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppointmentsService, DashboardStats, TodayAppointment, RecentPatient } from '../../core/services/appointments.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Agenda</h1>
          <p class="dashboard-date">{{ todayLabel() }}</p>
        </div>
      </div>

      @if (stats()) {
        <!-- Métricas -->
        <div class="metrics-row">
          <div class="metric-card metric-blue">
            <mat-icon>event_note</mat-icon>
            <div class="metric-info">
              <span class="metric-value">{{ stats()!.todayCount }}</span>
              <span class="metric-label">Citas hoy</span>
            </div>
          </div>
          <div class="metric-card metric-green">
            <mat-icon>check_circle</mat-icon>
            <div class="metric-info">
              <span class="metric-value">{{ stats()!.confirmedCount }}</span>
              <span class="metric-label">Confirmadas</span>
            </div>
          </div>
          <div class="metric-card metric-amber">
            <mat-icon>schedule</mat-icon>
            <div class="metric-info">
              <span class="metric-value">{{ stats()!.pendingCount }}</span>
              <span class="metric-label">Pendientes</span>
            </div>
          </div>
          <div class="metric-card metric-purple">
            <mat-icon>people</mat-icon>
            <div class="metric-info">
              <span class="metric-value">{{ stats()!.activePatientsCount }}</span>
              <span class="metric-label">Pacientes activos</span>
            </div>
          </div>
        </div>

        <!-- Dos columnas -->
        <div class="two-col">
          <!-- Citas de hoy -->
          <section class="panel">
            <div class="panel-header">
              <h2>Citas de hoy</h2>
              <button mat-button routerLink="/appointments">Ver historial</button>
            </div>

            @if (stats()!.todayAppointments.length === 0) {
              <div class="empty-state">
                <mat-icon>event_available</mat-icon>
                <p>No hay citas para hoy</p>
                <button mat-stroked-button routerLink="/appointments/new">Crear cita</button>
              </div>
            } @else {
              <ul class="appt-list">
                @for (appt of stats()!.todayAppointments; track appt.id) {
                  <li class="appt-item">
                    <div class="appt-time">
                      <span class="appt-hour">{{ appt.appointmentDate | date:'HH:mm' }}</span>
                      <span class="appt-dur">{{ appt.duration }} min</span>
                    </div>
                    <div class="appt-info">
                      <span class="appt-patient">{{ appt.patientName }}</span>
                      <span class="appt-type">{{ appt.type || 'Sin tipo' }}</span>
                    </div>
                    <span class="status-chip status-{{ appt.status }}">{{ statusLabel(appt.status) }}</span>
                  </li>
                }
              </ul>
            }
          </section>

          <!-- Pacientes recientes -->
          <section class="panel">
            <div class="panel-header">
              <h2>Pacientes recientes</h2>
              <button mat-button routerLink="/patients">Ver todos</button>
            </div>

            @if (stats()!.recentPatients.length === 0) {
              <div class="empty-state">
                <mat-icon>person_search</mat-icon>
                <p>Sin pacientes aún</p>
              </div>
            } @else {
              <ul class="patient-list">
                @for (p of stats()!.recentPatients; track p.id) {
                  <li class="patient-item">
                    <div class="patient-avatar">{{ p.name.charAt(0) }}</div>
                    <div class="patient-info">
                      <span class="patient-name">{{ p.name }}</span>
                      <span class="patient-meta">
                        {{ calcAge(p.birthDate) }} años · {{ p.lastType || 'Sin tipo' }}
                      </span>
                      @if (p.nextAppointment) {
                        <span class="patient-next">
                          <mat-icon>event</mat-icon>
                          Próx. {{ p.nextAppointment | date:'dd/MM HH:mm' }}
                        </span>
                      }
                    </div>
                  </li>
                }
              </ul>
            }
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 28px 32px; max-width: 1100px; }

    .dashboard-header { margin-bottom: 24px; }
    .dashboard-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--cf-dark); }
    .dashboard-date { margin: 4px 0 0; font-size: 14px; color: var(--cf-mid-dark); text-transform: capitalize; }

    /* Metrics */
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    @media (max-width: 820px) { .metrics-row { grid-template-columns: repeat(2, 1fr); } }

    .metric-card {
      display: flex; align-items: center; gap: 16px;
      background: #fff; border-radius: 12px; padding: 20px 18px;
      border: 1px solid var(--cf-lighter);
    }
    .metric-card mat-icon { font-size: 34px; height: 34px; width: 34px; flex-shrink: 0; }
    .metric-info { display: flex; flex-direction: column; }
    .metric-value { font-size: 28px; font-weight: 700; line-height: 1; color: var(--cf-dark); }
    .metric-label { font-size: 12px; color: var(--cf-mid-dark); margin-top: 2px; }
    .metric-blue mat-icon  { color: var(--cf-primary); }
    .metric-green mat-icon { color: #2e7d32; }
    .metric-amber mat-icon { color: #f57c00; }
    .metric-purple mat-icon { color: #7b1fa2; }

    /* Two-column layout */
    .two-col { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
    @media (max-width: 820px) { .two-col { grid-template-columns: 1fr; } }

    /* Panel */
    .panel { background: #fff; border-radius: 12px; border: 1px solid var(--cf-lighter); overflow: hidden; }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--cf-bg);
    }
    .panel-header h2 { margin: 0; font-size: 15px; font-weight: 600; color: var(--cf-dark); }

    .empty-state { text-align: center; padding: 32px 16px; color: var(--cf-pale); }
    .empty-state mat-icon { font-size: 40px; height: 40px; width: 40px; }
    .empty-state p { margin: 8px 0 12px; font-size: 14px; }

    /* Appointments list */
    .appt-list { list-style: none; padding: 0; margin: 0; }
    .appt-item {
      display: flex; align-items: center; gap: 14px;
      padding: 13px 20px;
      border-bottom: 1px solid var(--cf-bg);
    }
    .appt-item:last-child { border-bottom: none; }

    .appt-time { display: flex; flex-direction: column; align-items: center; min-width: 48px; }
    .appt-hour { font-size: 15px; font-weight: 600; color: var(--cf-dark); }
    .appt-dur { font-size: 11px; color: var(--cf-pale); }

    .appt-info { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
    .appt-patient { font-weight: 600; font-size: 14px; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-type { font-size: 12px; color: var(--cf-mid-dark); text-transform: capitalize; }

    /* Status chips */
    .status-chip {
      font-size: 11px; font-weight: 600; padding: 3px 9px;
      border-radius: 20px; white-space: nowrap; flex-shrink: 0;
    }
    .status-scheduled  { background: #e3f2fd; color: #1565c0; }
    .status-confirmed  { background: #e8f5e9; color: #2e7d32; }
    .status-completed  { background: #f3e5f5; color: #7b1fa2; }
    .status-cancelled  { background: #fce4ec; color: #c62828; }
    .status-no_show    { background: #fff3e0; color: #e65100; }

    /* Patients list */
    .patient-list { list-style: none; padding: 0; margin: 0; }
    .patient-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 13px 20px;
      border-bottom: 1px solid var(--cf-bg);
    }
    .patient-item:last-child { border-bottom: none; }

    .patient-avatar {
      width: 38px; height: 38px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--cf-primary), var(--cf-bright));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 15px;
    }
    .patient-info { display: flex; flex-direction: column; gap: 2px; }
    .patient-name { font-weight: 600; font-size: 14px; color: #1a1a2e; }
    .patient-meta { font-size: 12px; color: var(--cf-mid-dark); }
    .patient-next {
      display: flex; align-items: center; gap: 3px;
      font-size: 11px; color: var(--cf-primary); font-weight: 500; margin-top: 2px;
    }
    .patient-next mat-icon { font-size: 13px; height: 13px; width: 13px; }
  `],
})
export class DashboardComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    this.appointmentsService.getDashboardStats().subscribe({
      next: (data) => this.stats.set(data),
    });
  }

  todayLabel(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  calcAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'Programada', confirmed: 'Confirmada',
      completed: 'Completada', cancelled: 'Cancelada', no_show: 'No presentado',
    };
    return map[status] ?? status;
  }
}

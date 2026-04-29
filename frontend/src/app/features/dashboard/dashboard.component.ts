import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  AppointmentsService, DashboardStats,
  TodayAppointment, Next2hAppointment, TopProfessional, RecentPatient,
} from '../../core/services/appointments.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard">

      <!-- Cabecera -->
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard Operativo</h1>
          <p class="dashboard-date">{{ todayLabel() }}</p>
        </div>
      </div>

      @if (stats()) {
        <!-- ── Métricas de hoy ── -->
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
          <div class="metric-card metric-red">
            <mat-icon>cancel</mat-icon>
            <div class="metric-info">
              <span class="metric-value">{{ stats()!.cancelledCount }}</span>
              <span class="metric-label">Canceladas / No asistió</span>
            </div>
          </div>
          <div class="metric-card metric-purple">
            <mat-icon>person_add</mat-icon>
            <div class="metric-info">
              <span class="metric-value">{{ stats()!.newPatientsThisWeek }}</span>
              <span class="metric-label">Pacientes nuevos esta semana</span>
            </div>
          </div>
          <div class="metric-card" [class]="cancellationClass()">
            <mat-icon>trending_down</mat-icon>
            <div class="metric-info">
              <span class="metric-value">{{ stats()!.cancellationRate }}%</span>
              <span class="metric-label">Tasa de cancelación (mes)</span>
            </div>
          </div>
        </div>

        <!-- ── Alerta: citas próximas 2 horas ── -->
        @if (stats()!.next2hAppointments.length > 0) {
          <div class="alert-2h">
            <div class="alert-2h-header">
              <mat-icon>alarm</mat-icon>
              <strong>Próximas 2 horas</strong>
              <span class="alert-badge">{{ stats()!.next2hAppointments.length }}</span>
            </div>
            <ul class="alert-2h-list">
              @for (a of stats()!.next2hAppointments; track a.id) {
                <li class="alert-2h-item">
                  <span class="a2h-time">{{ a.appointmentDate | date:'HH:mm' }}</span>
                  <span class="a2h-patient">{{ a.patientName }}</span>
                  <span class="a2h-type">{{ a.type || '—' }}</span>
                  <span class="a2h-dur">{{ a.duration }} min</span>
                  <span class="a2h-prof">{{ a.professionalName }}</span>
                  <span class="status-chip status-{{ a.status }}">{{ statusLabel(a.status) }}</span>
                </li>
              }
            </ul>
          </div>
        }

        <!-- ── Contenido principal (2 columnas) ── -->
        <div class="two-col">

          <!-- Columna izquierda: citas de hoy -->
          <section class="panel">
            <div class="panel-header">
              <h2>Citas de hoy</h2>
              <button mat-button routerLink="/appointments">Ver agenda</button>
            </div>
            @if (stats()!.todayAppointments.length === 0) {
              <div class="empty-state">
                <mat-icon>event_available</mat-icon>
                <p>No hay citas para hoy</p>
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

          <!-- Columna derecha -->
          <div class="right-col">

            <!-- Profesionales con más citas este mes -->
            <section class="panel">
              <div class="panel-header">
                <h2>Profesionales · este mes</h2>
              </div>
              @if (stats()!.topProfessionals.length === 0) {
                <div class="empty-state">
                  <mat-icon>person_search</mat-icon>
                  <p>Sin datos este mes</p>
                </div>
              } @else {
                <ul class="prof-list">
                  @for (p of stats()!.topProfessionals; track p.id; let i = $index) {
                    <li class="prof-item">
                      <span class="prof-rank">#{{ i + 1 }}</span>
                      <div class="prof-body">
                        <div class="prof-name-row">
                          <span class="prof-name">{{ p.name }}</span>
                          <span class="prof-count">{{ p.totalAppointments }}</span>
                        </div>
                        <div class="prof-bar-bg">
                          <div
                            class="prof-bar-fill"
                            [style.width]="barWidth(p.totalAppointments) + '%'"
                          ></div>
                        </div>
                      </div>
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
                            Próx. {{ p.nextAppointment | date:'dd/MM/yyyy HH:mm' }}
                          </span>
                        }
                      </div>
                    </li>
                  }
                </ul>
              }
            </section>

          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .dashboard { padding: 28px 32px; max-width: 1160px; }

    .dashboard-header { margin-bottom: 24px; }
    .dashboard-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--cf-dark); }
    .dashboard-date { margin: 4px 0 0; font-size: 14px; color: var(--cf-mid-dark); text-transform: capitalize; }

    /* ── Metrics ── */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    @media (max-width: 1100px) { .metrics-row { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 680px)  { .metrics-row { grid-template-columns: repeat(2, 1fr); } }

    .metric-card {
      display: flex; align-items: center; gap: 12px;
      background: #fff; border-radius: 12px; padding: 16px 14px;
      border: 1px solid var(--cf-lighter);
    }
    .metric-card mat-icon { font-size: 30px; height: 30px; width: 30px; flex-shrink: 0; }
    .metric-info { display: flex; flex-direction: column; }
    .metric-value { font-size: 26px; font-weight: 700; line-height: 1; color: var(--cf-dark); }
    .metric-label { font-size: 11px; color: var(--cf-mid-dark); margin-top: 3px; line-height: 1.3; }

    .metric-blue   mat-icon { color: var(--cf-primary); }
    .metric-green  mat-icon { color: #059669; }
    .metric-amber  mat-icon { color: #d97706; }
    .metric-red    mat-icon { color: #dc2626; }
    .metric-purple mat-icon { color: #7c3aed; }
    .metric-ok     mat-icon { color: #059669; }
    .metric-warn   mat-icon { color: #d97706; }
    .metric-danger mat-icon { color: #dc2626; }

    /* ── Alert 2h ── */
    .alert-2h {
      background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px;
      padding: 14px 18px; margin-bottom: 24px;
    }
    .alert-2h-header {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 10px;
    }
    .alert-2h-header mat-icon { font-size: 20px; height: 20px; width: 20px; color: #f59e0b; }
    .alert-badge {
      background: #f59e0b; color: #fff; border-radius: 20px;
      font-size: 11px; font-weight: 700; padding: 1px 8px;
    }
    .alert-2h-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .alert-2h-item {
      display: flex; align-items: center; gap: 14px;
      background: rgba(255,255,255,.6); border-radius: 8px; padding: 8px 12px; font-size: 13px;
    }
    .a2h-time   { font-weight: 700; color: var(--cf-dark); min-width: 40px; }
    .a2h-patient { font-weight: 600; color: var(--cf-dark); flex: 1.5; }
    .a2h-type   { color: var(--cf-mid-dark); flex: 1; }
    .a2h-dur    { color: var(--cf-pale); min-width: 50px; }
    .a2h-prof   { color: var(--cf-mid-dark); flex: 1; font-size: 12px; }

    /* ── Two-column layout ── */
    .two-col { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
    @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
    .right-col { display: flex; flex-direction: column; gap: 20px; }

    /* ── Panel ── */
    .panel { background: #fff; border-radius: 12px; border: 1px solid var(--cf-lighter); overflow: hidden; }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 18px 10px; border-bottom: 1px solid var(--cf-bg);
    }
    .panel-header h2 { margin: 0; font-size: 14px; font-weight: 600; color: var(--cf-dark); }

    .empty-state { text-align: center; padding: 28px 16px; color: var(--cf-pale); }
    .empty-state mat-icon { font-size: 36px; height: 36px; width: 36px; }
    .empty-state p { margin: 6px 0 0; font-size: 13px; }

    /* ── Appointments list ── */
    .appt-list { list-style: none; padding: 0; margin: 0; }
    .appt-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 18px; border-bottom: 1px solid var(--cf-bg);
    }
    .appt-item:last-child { border-bottom: none; }
    .appt-time { display: flex; flex-direction: column; align-items: center; min-width: 44px; }
    .appt-hour { font-size: 15px; font-weight: 600; color: var(--cf-dark); }
    .appt-dur  { font-size: 11px; color: var(--cf-pale); }
    .appt-info { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
    .appt-patient { font-weight: 600; font-size: 14px; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-type { font-size: 12px; color: var(--cf-mid-dark); }

    /* ── Status chips ── */
    .status-chip { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
    .status-scheduled { background: #dbeafe; color: #1d4ed8; }
    .status-confirmed { background: #d1fae5; color: #065f46; }
    .status-completed { background: #ede9fe; color: #6d28d9; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-no_show   { background: #ffedd5; color: #9a3412; }

    /* ── Profesionales ranking ── */
    .prof-list { list-style: none; padding: 0; margin: 0; }
    .prof-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 18px; border-bottom: 1px solid var(--cf-bg); }
    .prof-item:last-child { border-bottom: none; }
    .prof-rank { font-size: 12px; font-weight: 700; color: var(--cf-pale); min-width: 22px; padding-top: 2px; }
    .prof-body { flex: 1; }
    .prof-name-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
    .prof-name  { font-size: 13px; font-weight: 600; color: var(--cf-dark); }
    .prof-count { font-size: 13px; font-weight: 700; color: var(--cf-primary); }
    .prof-bar-bg   { height: 5px; background: var(--cf-bg); border-radius: 3px; overflow: hidden; }
    .prof-bar-fill { height: 100%; background: var(--cf-primary); border-radius: 3px; transition: width .4s; }

    /* ── Patients list ── */
    .patient-list { list-style: none; padding: 0; margin: 0; }
    .patient-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 18px; border-bottom: 1px solid var(--cf-bg); }
    .patient-item:last-child { border-bottom: none; }
    .patient-avatar {
      width: 34px; height: 34px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--cf-primary), var(--cf-bright));
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 14px;
    }
    .patient-info { display: flex; flex-direction: column; gap: 2px; }
    .patient-name { font-weight: 600; font-size: 13px; color: #1a1a2e; }
    .patient-meta { font-size: 11px; color: var(--cf-mid-dark); }
    .patient-next { display: flex; align-items: center; gap: 3px; font-size: 11px; color: var(--cf-primary); font-weight: 500; }
    .patient-next mat-icon { font-size: 12px; height: 12px; width: 12px; }
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

  cancellationClass(): string {
    const rate = this.stats()?.cancellationRate ?? 0;
    if (rate < 10) return 'metric-card metric-ok';
    if (rate < 20) return 'metric-card metric-warn';
    return 'metric-card metric-danger';
  }

  barWidth(count: number): number {
    const max = this.stats()?.topProfessionals[0]?.totalAppointments ?? 1;
    return max === 0 ? 0 : Math.round((count / max) * 100);
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
      completed: 'Completada', cancelled: 'Cancelada', no_show: 'No asistió',
    };
    return map[status] ?? status;
  }
}

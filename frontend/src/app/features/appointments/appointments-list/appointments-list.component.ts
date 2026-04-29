import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { UsersService, Professional } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    DatePipe, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="agenda-container">

      <!-- Cabecera -->
      <div class="agenda-header">
        <h1>Agenda</h1>
        @if (canManage()) {
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>add</mat-icon> Nueva cita
          </button>
        }
      </div>

      <!-- Navegador de día -->
      <div class="day-nav">
        <button mat-icon-button (click)="navigateDay(-1)" title="Día anterior">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <input
          type="date"
          class="date-input"
          [value]="selectedDate()"
          (change)="onDateChange($event)"
        />
        <button mat-icon-button (click)="navigateDay(1)" title="Día siguiente">
          <mat-icon>chevron_right</mat-icon>
        </button>
        @if (!isToday()) {
          <button mat-stroked-button class="today-btn" (click)="goToToday()">Hoy</button>
        }
        <span class="date-label">{{ formatDateHeader(selectedDate()) }}</span>
      </div>

      <!-- Filtros -->
      <div class="filters">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Profesional</mat-label>
          <mat-select [(ngModel)]="selectedProfessionalId" (ngModelChange)="loadDay()">
            <mat-option value="">Todos</mat-option>
            @for (p of professionals(); track p.id) {
              <mat-option [value]="p.id.toString()">{{ p.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="loadDay()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="scheduled">Programada</mat-option>
            <mat-option value="confirmed">Confirmada</mat-option>
            <mat-option value="completed">Completada</mat-option>
            <mat-option value="cancelled">Cancelada</mat-option>
            <mat-option value="no_show">No presentado</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Próximas 24 horas (solo cuando se ve el día de hoy) -->
      @if (isToday() && upcomingAppointments().length > 0) {
        <div class="section">
          <h2 class="section-title">
            <mat-icon class="section-icon upcoming-icon">schedule</mat-icon>
            Próximas citas
            <span class="section-subtitle">· Siguientes 24 horas · {{ upcomingAppointments().length }}</span>
          </h2>
          <div class="upcoming-list">
            @for (item of upcomingAppointments(); track item.id) {
              <div class="upcoming-item">
                <span class="upcoming-time">{{ item.appointmentDate | date:'HH:mm' }}</span>
                <span class="upcoming-patient">{{ item.patientName || 'Paciente #' + item.patientId }}</span>
                <span class="upcoming-type">{{ item.type || '—' }}</span>
                <span class="upcoming-duration">{{ item.duration }} min</span>
                <span class="status-chip status-{{ item.status }}">{{ statusLabel(item.status) }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Citas del día -->
      <div class="section">
        <h2 class="section-title">
          <mat-icon class="section-icon">event</mat-icon>
          Citas del día
          @if (!loading()) {
            <span class="section-subtitle">· {{ dayAppointments().length }} cita(s)</span>
          }
        </h2>

        @if (loading()) {
          <div class="loading-state">
            <mat-spinner diameter="36"></mat-spinner>
            <span>Cargando...</span>
          </div>
        } @else if (dayAppointments().length === 0) {
          <div class="empty-state">
            <mat-icon>event_available</mat-icon>
            <p>No hay citas para este día</p>
            @if (canManage()) {
              <button mat-stroked-button routerLink="new">Crear cita</button>
            }
          </div>
        } @else {
          <div class="appointment-list">
            @for (item of dayAppointments(); track item.id) {
              <div class="appt-card appt-card--{{ item.status }}">
                <div class="appt-time">
                  <span class="time-hour">{{ item.appointmentDate | date:'HH:mm' }}</span>
                  <span class="time-dur">{{ item.duration }} min</span>
                </div>
                <div class="appt-body">
                  <div class="appt-patient">{{ item.patientName || 'Paciente #' + item.patientId }}</div>
                  <div class="appt-meta">
                    <span>{{ item.type || 'Sin tipo' }}</span>
                    @if (item.professionalName) {
                      <span class="sep">·</span>
                      <span>{{ item.professionalName }}</span>
                    }
                  </div>
                  @if (item.notes) {
                    <div class="appt-notes">{{ item.notes }}</div>
                  }
                </div>
                <div class="appt-right">
                  <span class="status-chip status-{{ item.status }}">{{ statusLabel(item.status) }}</span>
                  @if (canManage()) {
                    <div class="appt-actions">
                      <button mat-icon-button [routerLink]="[item.id, 'edit']" title="Editar">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="delete(item)" title="Eliminar">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .agenda-container { padding: 28px 32px; max-width: 960px; }

    .agenda-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
    }
    .agenda-header h1 { margin: 0; font-size: 26px; font-weight: 700; color: var(--cf-dark); }

    /* Day navigator */
    .day-nav {
      display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
      background: #fff; border: 1px solid var(--cf-lighter); border-radius: 12px;
      padding: 10px 16px;
    }
    .date-input {
      border: none; outline: none; font-size: 15px; color: var(--cf-dark);
      font-family: inherit; cursor: pointer; background: transparent;
    }
    .today-btn { font-size: 13px; padding: 0 12px; height: 32px; line-height: 32px; }
    .date-label {
      margin-left: 8px; font-size: 14px; color: var(--cf-mid-dark);
      font-weight: 500; text-transform: capitalize;
    }

    /* Filters */
    .filters { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-field { flex: 1; min-width: 180px; max-width: 260px; }

    /* Sections */
    .section { margin-bottom: 28px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: var(--cf-dark);
      margin: 0 0 12px;
    }
    .section-icon { font-size: 20px; height: 20px; width: 20px; color: var(--cf-primary); }
    .upcoming-icon { color: #f59e0b; }
    .section-subtitle { font-weight: 400; color: var(--cf-pale); font-size: 13px; }

    /* Upcoming 24h list */
    .upcoming-list {
      background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
      overflow: hidden;
    }
    .upcoming-item {
      display: flex; align-items: center; gap: 16px;
      padding: 10px 16px; border-bottom: 1px solid #fde68a;
      font-size: 14px;
    }
    .upcoming-item:last-child { border-bottom: none; }
    .upcoming-time { font-weight: 700; color: var(--cf-dark); min-width: 44px; }
    .upcoming-patient { font-weight: 600; color: var(--cf-dark); flex: 1; }
    .upcoming-type { color: var(--cf-mid-dark); flex: 1; }
    .upcoming-duration { color: var(--cf-pale); min-width: 50px; font-size: 13px; }

    /* Day appointment list */
    .appointment-list { display: flex; flex-direction: column; gap: 8px; }
    .appt-card {
      display: flex; align-items: flex-start; gap: 16px;
      background: #fff; border: 1px solid var(--cf-lighter); border-radius: 12px;
      padding: 14px 16px; transition: box-shadow .15s;
      border-left: 4px solid var(--cf-lighter);
    }
    .appt-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    .appt-card--scheduled  { border-left-color: #93c5fd; }
    .appt-card--confirmed  { border-left-color: #6ee7b7; }
    .appt-card--completed  { border-left-color: #c4b5fd; }
    .appt-card--cancelled  { border-left-color: #fca5a5; }
    .appt-card--no_show    { border-left-color: #fdba74; }

    .appt-time {
      display: flex; flex-direction: column; align-items: center;
      min-width: 52px; padding-top: 2px;
    }
    .time-hour { font-size: 18px; font-weight: 700; color: var(--cf-dark); line-height: 1.2; }
    .time-dur  { font-size: 11px; color: var(--cf-pale); margin-top: 2px; }

    .appt-body { flex: 1; }
    .appt-patient { font-size: 15px; font-weight: 600; color: var(--cf-dark); margin-bottom: 4px; }
    .appt-meta { font-size: 13px; color: var(--cf-mid-dark); display: flex; gap: 6px; flex-wrap: wrap; }
    .sep { color: var(--cf-lighter); }
    .appt-notes { font-size: 12px; color: #888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px; }

    .appt-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .appt-actions { display: flex; gap: 0; }

    /* Status chips */
    .status-chip {
      font-size: 11px; font-weight: 600; padding: 3px 9px;
      border-radius: 20px; white-space: nowrap;
    }
    .status-scheduled  { background: #dbeafe; color: #1d4ed8; }
    .status-confirmed  { background: #d1fae5; color: #065f46; }
    .status-completed  { background: #ede9fe; color: #6d28d9; }
    .status-cancelled  { background: #fee2e2; color: #991b1b; }
    .status-no_show    { background: #ffedd5; color: #9a3412; }

    /* States */
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 32px; color: var(--cf-mid-dark); }
    .empty-state { text-align: center; padding: 40px 20px; color: var(--cf-pale); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .empty-state p { margin: 0 0 16px; }
  `],
})
export class AppointmentsListComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private usersService = inject(UsersService);
  private auth = inject(AuthService);

  selectedDate = signal<string>(this.todayStr());
  dayAppointments = signal<Appointment[]>([]);
  upcomingAppointments = signal<Appointment[]>([]);
  professionals = signal<Professional[]>([]);
  loading = signal(false);

  selectedProfessionalId = '';
  selectedStatus = '';

  isToday = computed(() => this.selectedDate() === this.todayStr());

  canManage = computed(() => {
    const r = this.auth.currentUser()?.role;
    return r === 'admin' || r === 'receptionist';
  });

  ngOnInit(): void {
    this.loadProfessionals();
    this.loadDay();
    this.loadUpcoming();
  }

  private todayStr(): string {
    const d = new Date();
    return this.localDateStr(d);
  }

  private localDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  navigateDay(delta: number): void {
    // Use noon to avoid DST / UTC-offset issues that make midnight roll to the previous day
    const d = new Date(this.selectedDate() + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    this.selectedDate.set(this.localDateStr(d));
    this.loadDay();
    if (this.isToday()) this.loadUpcoming();
  }

  goToToday(): void {
    this.selectedDate.set(this.todayStr());
    this.loadDay();
    this.loadUpcoming();
  }

  onDateChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.selectedDate.set(val);
      this.loadDay();
      if (this.isToday()) this.loadUpcoming();
    }
  }

  loadDay(): void {
    this.loading.set(true);
    this.appointmentsService.getAll({
      date: this.selectedDate(),
      professionalId: this.selectedProfessionalId || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe({
      next: (res) => { this.dayAppointments.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadUpcoming(): void {
    this.appointmentsService.getAll({ upcoming: true }).subscribe({
      next: (res) => this.upcomingAppointments.set(res.data),
    });
  }

  loadProfessionals(): void {
    this.usersService.getProfessionals().subscribe({
      next: (res) => this.professionals.set(res.data),
    });
  }

  delete(item: Appointment): void {
    const patient = item.patientName || `Paciente #${item.patientId}`;
    const fecha = new Date(item.appointmentDate).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    if (!confirm(`¿Eliminar la cita de ${patient} el ${fecha}?`)) return;
    this.appointmentsService.delete(item.id).subscribe({
      next: () => {
        this.dayAppointments.update(items => items.filter(i => i.id !== item.id));
        this.upcomingAppointments.update(items => items.filter(i => i.id !== item.id));
      },
    });
  }

  formatDateHeader(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'Programada', confirmed: 'Confirmada',
      completed: 'Completada', cancelled: 'Cancelada', no_show: 'No presentado',
    };
    return map[status] ?? status;
  }
}

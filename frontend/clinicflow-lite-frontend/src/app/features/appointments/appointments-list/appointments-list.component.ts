import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { Appointment } from '../../../core/models/appointment.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule, MatChipsModule,
  ],
  template: `
    <div class="list-container">
      <div class="list-header">
        <h1>Citas clínicas</h1>
        <div class="header-actions">
          <span class="user-name">{{ auth.currentUser()?.name }}</span>
          <button mat-stroked-button (click)="auth.logout()">Salir</button>
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>add</mat-icon> Nueva cita
          </button>
        </div>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="loadItems()" placeholder="Tipo, notas, paciente...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="loadItems()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="scheduled">Programada</mat-option>
            <mat-option value="confirmed">Confirmada</mat-option>
            <mat-option value="completed">Completada</mat-option>
            <mat-option value="cancelled">Cancelada</mat-option>
            <mat-option value="no_show">No presentado</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando citas...</p>
        </div>
      } @else if (items().length === 0) {
        <div class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <h3>No hay citas</h3>
          <p>Crea la primera cita para empezar</p>
          <button mat-raised-button color="primary" routerLink="new">Crear cita</button>
        </div>
      } @else {
        <div class="items-grid">
          @for (item of items(); track item.id) {
            <div class="item-card">
              <div class="item-header">
                <span class="item-date">{{ item.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="status-badge status-{{ item.status }}">{{ statusLabel(item.status) }}</span>
              </div>
              <p class="item-type">{{ item.type || 'Sin tipo' }}</p>
              @if (item.notes) {
                <p class="item-notes">{{ item.notes }}</p>
              }
              <div class="item-meta">
                <small>Paciente ID: {{ item.patientId }}</small>
                <small>{{ item.duration }} min</small>
              </div>
              <div class="item-actions">
                <button mat-icon-button [routerLink]="[item.id, 'edit']" title="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="delete(item)" title="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
        <p class="total">Total: {{ total() }} cita(s)</p>
      }
    </div>
  `,
  styles: [`
    .list-container { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .user-name { color: #555; }
    .filters { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .filters mat-form-field { flex: 1; min-width: 200px; }
    .loading-state, .empty-state { text-align: center; padding: 48px; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; color: #bbb; }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .item-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; background: #fff; }
    .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .item-date { font-weight: 500; }
    .item-type { font-size: 15px; margin: 4px 0; color: #333; }
    .item-notes { font-size: 13px; color: #666; margin: 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-meta { display: flex; gap: 16px; margin-top: 8px; }
    .item-meta small { color: #888; }
    .item-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
    .status-badge { font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 500; }
    .status-scheduled { background: #e3f2fd; color: #1565c0; }
    .status-confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-completed { background: #f3e5f5; color: #6a1b9a; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
    .status-no_show { background: #fff3e0; color: #e65100; }
    .total { text-align: right; color: #888; margin-top: 16px; }
  `],
})
export class AppointmentsListComponent implements OnInit {
  items = signal<Appointment[]>([]);
  loading = signal(false);
  total = signal(0);
  searchTerm = '';
  selectedStatus = '';

  constructor(
    private appointmentsService: AppointmentsService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.appointmentsService.getAll({
      search: this.searchTerm || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.total.set(res.pagination.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(item: Appointment): void {
    const fecha = new Date(item.appointmentDate).toLocaleDateString('es-ES');
    if (!confirm(`¿Eliminar la cita del ${fecha}?`)) return;
    this.appointmentsService.delete(item.id).subscribe({
      next: () => this.items.update(items => items.filter(i => i.id !== item.id)),
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

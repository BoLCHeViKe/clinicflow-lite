import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientsService } from '../../../core/services/patients.service';
import { AuthService } from '../../../core/services/auth.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="patients">
      <div class="page-header">
        <div class="header-left">
          <h1>Pacientes</h1>
          <span class="total-badge">{{ patients().length }} activos</span>
        </div>
        @if (canManage()) {
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>person_add</mat-icon> Nuevo paciente
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <p>Cargando pacientes...</p>
        </div>
      } @else if (patients().length === 0) {
        <div class="empty-state">
          <mat-icon>person_search</mat-icon>
          <p>No hay pacientes registrados aún.</p>
          @if (canManage()) {
            <button mat-stroked-button routerLink="new">Añadir primer paciente</button>
          }
        </div>
      } @else {
        <div class="patients-grid">
          @for (p of patients(); track p.id) {
            <div class="patient-card">
              <div class="card-avatar">{{ p.name.charAt(0) }}</div>
              <div class="card-body">
                <span class="card-name">{{ p.name }}</span>
                <span class="card-meta">
                  @if (p.birthDate) { {{ calcAge(p.birthDate) }} años · }{{ genderLabel(p.gender) }}
                </span>
                @if (p.phone) {
                  <span class="card-contact"><mat-icon>phone</mat-icon>{{ p.phone }}</span>
                }
                @if (p.email) {
                  <span class="card-contact"><mat-icon>email</mat-icon>{{ p.email }}</span>
                }
              </div>
              <div class="card-actions">
                <button mat-icon-button [routerLink]="[p.id, 'notes']" title="Notas clínicas">
                  <mat-icon>description</mat-icon>
                </button>
                @if (canManage()) {
                  <button mat-icon-button [routerLink]="[p.id, 'edit']" title="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deletePatient(p)" title="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </div>
              <span class="status-dot"></span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .patients { padding: 28px 32px; max-width: 1100px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .page-header h1 { margin: 0; font-size: 26px; font-weight: 700; color: var(--cf-dark); }
    .total-badge { font-size: 12px; font-weight: 600; color: var(--cf-primary); background: #e3f2fd; border-radius: 20px; padding: 3px 10px; }
    .loading-state, .empty-state { text-align: center; padding: 48px; color: var(--cf-pale); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; }
    .empty-state p { margin: 8px 0 12px; }
    .patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .patient-card {
      background: #fff; border: 1px solid var(--cf-lighter); border-radius: 12px;
      padding: 16px; display: flex; align-items: flex-start; gap: 12px;
      position: relative; transition: box-shadow .2s;
    }
    .patient-card:hover { box-shadow: 0 4px 16px rgba(0,146,224,.1); }
    .card-avatar {
      width: 44px; height: 44px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--cf-primary), var(--cf-bright));
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 18px;
    }
    .card-body { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; min-width: 0; }
    .card-name { font-weight: 600; font-size: 15px; color: #1a1a2e; }
    .card-meta { font-size: 12px; color: var(--cf-mid-dark); }
    .card-contact { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--cf-soft); }
    .card-contact mat-icon { font-size: 13px; height: 13px; width: 13px; flex-shrink: 0; }
    .card-actions { display: flex; flex-direction: column; flex-shrink: 0; }
    .status-dot { position: absolute; top: 14px; right: 14px; width: 9px; height: 9px; border-radius: 50%; background: #4caf50; }
  `],
})
export class PatientsListComponent implements OnInit {
  private patientsService = inject(PatientsService);
  private auth = inject(AuthService);
  patients = signal<Patient[]>([]);
  loading = signal(true);

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'receptionist';
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.patientsService.getAll().subscribe({
      next: (res) => { this.patients.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  deletePatient(p: Patient): void {
    if (!confirm(`¿Eliminar a ${p.name}?\n\nAtención: todas sus citas serán eliminadas también.`)) return;
    this.patientsService.delete(p.id).subscribe({
      next: (res) => {
        this.patients.update(list => list.filter(x => x.id !== p.id));
        if (res.appointmentsDeleted > 0) {
          alert(`Paciente eliminado. ${res.appointmentsDeleted} cita(s) eliminadas también.`);
        }
      },
      error: (err) => alert(err.error?.error || 'Error al eliminar el paciente'),
    });
  }

  calcAge(birthDate: string): number {
    const today = new Date(), birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 ||
       (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  genderLabel(g?: string): string {
    return g === 'male' ? 'Hombre' : g === 'female' ? 'Mujer' : g === 'other' ? 'Otro' : '';
  }
}

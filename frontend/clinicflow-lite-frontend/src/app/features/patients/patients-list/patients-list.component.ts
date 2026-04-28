import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientsService } from '../../../core/services/patients.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="patients">
      <div class="page-header">
        <h1>Pacientes</h1>
        <span class="total-badge">{{ patients().length }} activos</span>
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
        </div>
      } @else {
        <div class="patients-grid">
          @for (p of patients(); track p.id) {
            <div class="patient-card">
              <div class="card-avatar">{{ p.name.charAt(0) }}</div>
              <div class="card-body">
                <span class="card-name">{{ p.name }}</span>
                <span class="card-meta">
                  @if (p.birthDate) { {{ calcAge(p.birthDate) }} años · }
                  {{ genderLabel(p.gender) }}
                </span>
                @if (p.phone) {
                  <span class="card-contact">
                    <mat-icon>phone</mat-icon>{{ p.phone }}
                  </span>
                }
                @if (p.email) {
                  <span class="card-contact">
                    <mat-icon>email</mat-icon>{{ p.email }}
                  </span>
                }
              </div>
              <span class="status-dot status-{{ p.status }}"></span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .patients { padding: 28px 32px; max-width: 1100px; }

    .page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 26px; font-weight: 700; color: var(--cf-dark); }
    .total-badge {
      font-size: 12px; font-weight: 600; color: var(--cf-primary);
      background: #e3f2fd; border-radius: 20px; padding: 3px 10px;
    }

    .loading-state, .empty-state { text-align: center; padding: 48px; color: var(--cf-pale); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; }

    .patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

    .patient-card {
      background: #fff;
      border: 1px solid var(--cf-lighter);
      border-radius: 12px;
      padding: 18px 16px;
      display: flex; align-items: flex-start; gap: 14px;
      position: relative;
      transition: box-shadow .2s;
    }
    .patient-card:hover { box-shadow: 0 4px 16px rgba(0,146,224,.1); }

    .card-avatar {
      width: 44px; height: 44px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--cf-primary), var(--cf-bright));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 18px;
    }

    .card-body { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
    .card-name { font-weight: 600; font-size: 15px; color: #1a1a2e; }
    .card-meta { font-size: 12px; color: var(--cf-mid-dark); }
    .card-contact {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--cf-soft);
    }
    .card-contact mat-icon { font-size: 13px; height: 13px; width: 13px; }

    .status-dot {
      position: absolute; top: 14px; right: 14px;
      width: 9px; height: 9px; border-radius: 50%;
    }
    .status-active { background: #4caf50; }
    .status-inactive { background: #bdbdbd; }
  `],
})
export class PatientsListComponent implements OnInit {
  private patientsService = inject(PatientsService);
  patients = signal<Patient[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.patientsService.getAll().subscribe({
      next: (res) => {
        this.patients.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  calcAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 ||
       (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  genderLabel(gender?: string): string {
    return gender === 'male' ? 'Hombre' : gender === 'female' ? 'Mujer' : 'Otro';
  }
}

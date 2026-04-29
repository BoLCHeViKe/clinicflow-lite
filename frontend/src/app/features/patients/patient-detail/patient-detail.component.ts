import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientsService } from '../../../core/services/patients.service';
import { ClinicalNotesService } from '../../../core/services/clinical-notes.service';
import { AuthService } from '../../../core/services/auth.service';
import { Patient, AppointmentHistory } from '../../../core/models/patient.model';
import { ClinicalNote } from '../../../core/models/clinical-note.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="detail-page">
      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="36"></mat-spinner></div>
      } @else if (patient()) {
        <!-- Cabecera -->
        <div class="detail-header">
          <button mat-icon-button (click)="goBack()" title="Volver">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="avatar">{{ patient()!.name.charAt(0) }}</div>
          <div class="header-info">
            <div class="header-top">
              <h1>{{ patient()!.name }}</h1>
              <span class="status-chip" [class]="'status-' + patient()!.status">{{ statusLabel(patient()!.status) }}</span>
            </div>
            <div class="header-meta">
              @if (patient()!.dni) { <span><mat-icon>badge</mat-icon>{{ patient()!.dni }}</span> }
              @if (patient()!.birthDate) { <span><mat-icon>cake</mat-icon>{{ calcAge(patient()!.birthDate!) }} años</span> }
              @if (patient()!.lastVisit) {
                <span><mat-icon>event</mat-icon>Última visita: {{ formatDate(patient()!.lastVisit!) }}</span>
              } @else {
                <span class="no-visit"><mat-icon>event_busy</mat-icon>Sin visitas completadas</span>
              }
            </div>
          </div>
          <div class="header-actions">
            <button mat-stroked-button [routerLink]="['/patients', patient()!.id, 'notes']">
              <mat-icon>description</mat-icon> Notas clínicas
            </button>
            @if (canManage()) {
              <button mat-raised-button color="primary" [routerLink]="['/patients', patient()!.id, 'edit']">
                <mat-icon>edit</mat-icon> Editar
              </button>
            }
          </div>
        </div>

        <div class="detail-body">
          <!-- Columna izquierda -->
          <div class="col-left">
            <!-- Información de contacto -->
            <section class="card">
              <h3><mat-icon>contact_page</mat-icon> Información de contacto</h3>
              <div class="info-grid">
                @if (patient()!.phone) {
                  <div class="info-row">
                    <mat-icon>phone</mat-icon>
                    <div><label>Teléfono</label><span>{{ patient()!.phone }}</span></div>
                  </div>
                }
                @if (patient()!.email) {
                  <div class="info-row">
                    <mat-icon>email</mat-icon>
                    <div><label>Email</label><span>{{ patient()!.email }}</span></div>
                  </div>
                }
                @if (patient()!.birthDate) {
                  <div class="info-row">
                    <mat-icon>cake</mat-icon>
                    <div><label>Fecha de nacimiento</label><span>{{ formatDate(patient()!.birthDate!) }}</span></div>
                  </div>
                }
                @if (patient()!.gender) {
                  <div class="info-row">
                    <mat-icon>person</mat-icon>
                    <div><label>Género</label><span>{{ genderLabel(patient()!.gender) }}</span></div>
                  </div>
                }
                @if (patient()!.address) {
                  <div class="info-row">
                    <mat-icon>location_on</mat-icon>
                    <div><label>Dirección</label><span>{{ patient()!.address }}</span></div>
                  </div>
                }
              </div>
            </section>

            <!-- Notas médicas -->
            @if (patient()!.medicalNotes) {
              <section class="card">
                <h3><mat-icon>medical_information</mat-icon> Notas médicas</h3>
                <p class="medical-notes">{{ patient()!.medicalNotes }}</p>
              </section>
            }

            <!-- Notas de seguimiento -->
            @if (followUpNotes().length > 0) {
              <section class="card">
                <h3><mat-icon>update</mat-icon> Seguimiento</h3>
                <div class="notes-list">
                  @for (n of followUpNotes(); track n.id) {
                    <div class="note-item">
                      <div class="note-date">{{ formatDate(n.createdAt) }}</div>
                      <p class="note-content">{{ n.content }}</p>
                    </div>
                  }
                </div>
              </section>
            }
          </div>

          <!-- Columna derecha: historial de citas -->
          <div class="col-right">
            <section class="card">
              <h3><mat-icon>history</mat-icon> Historial de citas</h3>
              @if (historyLoading()) {
                <div class="loading-state"><mat-spinner diameter="28"></mat-spinner></div>
              } @else if (history().length === 0) {
                <div class="empty-history">
                  <mat-icon>event_busy</mat-icon>
                  <p>No hay citas registradas</p>
                </div>
              } @else {
                <div class="history-list">
                  @for (h of history(); track h.id) {
                    <div class="history-item">
                      <div class="history-left">
                        <span class="history-status" [class]="'hs-' + h.status">{{ apptStatusLabel(h.status) }}</span>
                        <span class="history-date">{{ formatDateTime(h.appointmentDate) }}</span>
                        <span class="history-pro">{{ h.professionalName }}</span>
                      </div>
                      <div class="history-right">
                        @if (h.type) { <span class="history-type">{{ h.type }}</span> }
                        <span class="history-dur">{{ h.duration }} min</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </section>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { padding: 28px 32px; max-width: 1100px; }
    .loading-state { display: flex; justify-content: center; padding: 48px; }

    /* Header */
    .detail-header {
      display: flex; align-items: flex-start; gap: 16px;
      background: #fff; border: 1px solid var(--cf-lighter); border-radius: 14px;
      padding: 20px 24px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .avatar {
      width: 56px; height: 56px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--cf-primary), var(--cf-bright));
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 22px;
    }
    .header-info { flex: 1; }
    .header-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }
    .header-top h1 { margin: 0; font-size: 22px; font-weight: 700; color: var(--cf-dark); }
    .status-chip { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 10px; }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-inactive { background: #fff8e1; color: #f57f17; }
    .status-discharged { background: #f3e5f5; color: #6a1b9a; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: var(--cf-soft); }
    .header-meta span { display: flex; align-items: center; gap: 4px; }
    .header-meta mat-icon { font-size: 15px; height: 15px; width: 15px; }
    .no-visit { color: var(--cf-pale); }
    .header-actions { display: flex; gap: 10px; align-items: center; margin-left: auto; flex-wrap: wrap; }

    /* Body */
    .detail-body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 760px) { .detail-body { grid-template-columns: 1fr; } }
    .col-left, .col-right { display: flex; flex-direction: column; gap: 20px; }

    /* Cards */
    .card { background: #fff; border: 1px solid var(--cf-lighter); border-radius: 12px; padding: 20px; }
    .card h3 { margin: 0 0 16px; font-size: 15px; font-weight: 600; color: var(--cf-dark); display: flex; align-items: center; gap: 6px; }
    .card h3 mat-icon { font-size: 18px; height: 18px; width: 18px; color: var(--cf-primary); }

    /* Info grid */
    .info-grid { display: flex; flex-direction: column; gap: 12px; }
    .info-row { display: flex; align-items: flex-start; gap: 10px; }
    .info-row mat-icon { font-size: 18px; height: 18px; width: 18px; color: var(--cf-soft); margin-top: 2px; flex-shrink: 0; }
    .info-row div { display: flex; flex-direction: column; }
    .info-row label { font-size: 11px; color: var(--cf-pale); text-transform: uppercase; letter-spacing: .5px; }
    .info-row span { font-size: 14px; color: var(--cf-dark); }

    /* Medical notes */
    .medical-notes { margin: 0; font-size: 14px; color: var(--cf-mid-dark); white-space: pre-wrap; line-height: 1.6; }

    /* Follow-up notes */
    .notes-list { display: flex; flex-direction: column; gap: 10px; }
    .note-item { border-left: 3px solid #4caf50; padding: 8px 12px; background: #f9fff9; border-radius: 0 8px 8px 0; }
    .note-date { font-size: 11px; color: var(--cf-pale); margin-bottom: 4px; }
    .note-content { margin: 0; font-size: 13px; color: var(--cf-mid-dark); }

    /* History */
    .empty-history { display: flex; flex-direction: column; align-items: center; padding: 24px; color: var(--cf-pale); gap: 8px; }
    .empty-history mat-icon { font-size: 32px; height: 32px; width: 32px; }
    .history-list { display: flex; flex-direction: column; gap: 8px; }
    .history-item {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 10px 14px; border-radius: 8px; background: #f8fafd;
      border-left: 3px solid var(--cf-lighter);
    }
    .history-left { display: flex; flex-direction: column; gap: 2px; }
    .history-status { font-size: 11px; font-weight: 700; }
    .hs-completed { color: #2e7d32; }
    .hs-confirmed { color: #1565c0; }
    .hs-scheduled { color: #e65100; }
    .hs-cancelled { color: #b71c1c; }
    .hs-no_show { color: #6d4c41; }
    .history-date { font-size: 13px; color: var(--cf-dark); font-weight: 500; }
    .history-pro { font-size: 12px; color: var(--cf-soft); }
    .history-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .history-type { font-size: 12px; color: var(--cf-primary); background: #e3f2fd; padding: 2px 8px; border-radius: 10px; }
    .history-dur { font-size: 11px; color: var(--cf-pale); }
  `],
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientsService = inject(PatientsService);
  private clinicalNotesService = inject(ClinicalNotesService);
  private auth = inject(AuthService);

  patient = signal<Patient | null>(null);
  history = signal<AppointmentHistory[]>([]);
  allNotes = signal<ClinicalNote[]>([]);
  loading = signal(true);
  historyLoading = signal(true);

  followUpNotes = () => this.allNotes().filter(n => n.type === 'follow_up');

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.patientsService.getById(id).subscribe({
      next: (res) => { this.patient.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/patients']); },
    });
    this.patientsService.getHistory(id).subscribe({
      next: (res) => { this.history.set(res.data); this.historyLoading.set(false); },
      error: () => this.historyLoading.set(false),
    });
    this.clinicalNotesService.getByPatient(id).subscribe({
      next: (res) => this.allNotes.set(res.data),
      error: () => {},
    });
  }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'receptionist';
  }

  goBack(): void { this.router.navigate(['/patients']); }

  calcAge(birthDate: string): number | string {
    // 1. Validación inicial: si no hay fecha, no intentes calcular
    if (!birthDate) return 0;

    const today = new Date();
    // Usamos un bloque try/catch o validamos el objeto Date
    const birth = new Date(birthDate.includes('T') ? birthDate : birthDate + 'T12:00:00');

    // 2. Si la fecha sigue siendo inválida (NaN), retornamos un valor seguro
    if (isNaN(birth.getTime())) {
      console.error("Fecha de nacimiento inválida:", birthDate);
      return 0; 
    }

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  genderLabel(g?: string): string {
    return g === 'male' ? 'Hombre' : g === 'female' ? 'Mujer' : g === 'other' ? 'Otro' : '';
  }

  statusLabel(s: string): string {
    return s === 'active' ? 'Activo' : s === 'inactive' ? 'Inactivo' : 'Alta';
  }

  apptStatusLabel(s: string): string {
    const map: Record<string, string> = {
      scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada',
      cancelled: 'Cancelada', no_show: 'No presentado',
    };
    return map[s] ?? s;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  formatDateTime(dateStr: string): string {
    const d = new Date(dateStr.replace(' ', 'T'));
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
}

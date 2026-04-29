import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PatientsService } from '../../../core/services/patients.service';
import { AuthService } from '../../../core/services/auth.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [RouterModule, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="patients">
      <div class="page-header">
        <div class="header-left">
          <h1>Pacientes</h1>
          <span class="total-badge">{{ patients().length }} pacientes</span>
        </div>
        @if (canManage()) {
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>person_add</mat-icon> Nuevo paciente
          </button>
        }
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o teléfono..."
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchChange($event)"
          >
        </div>
        <div class="status-tabs">
          @for (tab of statusTabs; track tab.value) {
            <button
              class="tab-btn"
              [class.active]="selectedStatus === tab.value"
              (click)="selectStatus(tab.value)"
            >{{ tab.label }}</button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <p>Cargando pacientes...</p>
        </div>
      } @else if (patients().length === 0) {
        <div class="empty-state">
          <mat-icon>person_search</mat-icon>
          <p>No se encontraron pacientes.</p>
          @if (canManage() && !searchText && !selectedStatus) {
            <button mat-stroked-button routerLink="new">Añadir primer paciente</button>
          }
        </div>
      } @else {
        <div class="patients-grid">
          @for (p of patients(); track p.id) {
            <div class="patient-card" (click)="goToDetail(p.id)">
              <div class="card-avatar">{{ p.name.charAt(0) }}</div>
              <div class="card-body">
                <div class="card-top">
                  <span class="card-name">{{ p.name }}</span>
                  <span class="status-chip" [class]="'status-' + p.status">{{ statusLabel(p.status) }}</span>
                </div>
                <span class="card-meta">
                  @if (p.birthDate) { {{ calcAge(p.birthDate) }} años · }{{ genderLabel(p.gender) }}
                  @if (p.dni) { · DNI: {{ p.dni }} }
                </span>
                @if (p.phone) {
                  <span class="card-contact"><mat-icon>phone</mat-icon>{{ p.phone }}</span>
                }
                @if (p.email) {
                  <span class="card-contact"><mat-icon>email</mat-icon>{{ p.email }}</span>
                }
                <span class="last-visit">
                  <mat-icon>history</mat-icon>
                  @if (p.lastVisit) {
                    Última visita: {{ formatDate(p.lastVisit) }}
                  } @else {
                    Sin visitas completadas
                  }
                </span>
              </div>
              <div class="card-actions" (click)="$event.stopPropagation()">
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
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .patients { padding: 28px 32px; max-width: 1100px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .page-header h1 { margin: 0; font-size: 26px; font-weight: 700; color: var(--cf-dark); }
    .total-badge { font-size: 12px; font-weight: 600; color: var(--cf-primary); background: #e3f2fd; border-radius: 20px; padding: 3px 10px; }

    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
    .search-box {
      display: flex; align-items: center; gap: 8px;
      background: #fff; border: 1px solid var(--cf-lighter); border-radius: 8px;
      padding: 8px 14px; flex: 1; min-width: 240px;
    }
    .search-box mat-icon { color: var(--cf-soft); font-size: 20px; height: 20px; width: 20px; }
    .search-box input { border: none; outline: none; font-size: 14px; width: 100%; background: transparent; color: var(--cf-dark); }
    .status-tabs { display: flex; gap: 4px; background: #f0f4fa; border-radius: 8px; padding: 4px; }
    .tab-btn {
      border: none; background: transparent; padding: 6px 14px; border-radius: 6px;
      font-size: 13px; font-weight: 500; color: var(--cf-mid-dark); cursor: pointer; transition: all .2s;
    }
    .tab-btn.active { background: #fff; color: var(--cf-primary); box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .tab-btn:hover:not(.active) { background: rgba(255,255,255,.6); }

    .loading-state, .empty-state { text-align: center; padding: 48px; color: var(--cf-pale); }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; }
    .empty-state p { margin: 8px 0 12px; }
    .patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

    .patient-card {
      background: #fff; border: 1px solid var(--cf-lighter); border-radius: 12px;
      padding: 16px; display: flex; align-items: flex-start; gap: 12px;
      cursor: pointer; transition: box-shadow .2s, border-color .2s;
    }
    .patient-card:hover { box-shadow: 0 4px 16px rgba(0,146,224,.12); border-color: var(--cf-primary); }

    .card-avatar {
      width: 44px; height: 44px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--cf-primary), var(--cf-bright));
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 18px;
    }
    .card-body { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; min-width: 0; }
    .card-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .card-name { font-weight: 600; font-size: 15px; color: #1a1a2e; }
    .status-chip { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-inactive { background: #fff8e1; color: #f57f17; }
    .status-discharged { background: #f3e5f5; color: #6a1b9a; }
    .card-meta { font-size: 12px; color: var(--cf-mid-dark); }
    .card-contact { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--cf-soft); }
    .card-contact mat-icon { font-size: 13px; height: 13px; width: 13px; flex-shrink: 0; }
    .last-visit { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--cf-pale); margin-top: 4px; }
    .last-visit mat-icon { font-size: 13px; height: 13px; width: 13px; }
    .card-actions { display: flex; flex-direction: column; flex-shrink: 0; }
  `],
})
export class PatientsListComponent implements OnInit, OnDestroy {
  private patientsService = inject(PatientsService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  patients = signal<Patient[]>([]);
  loading = signal(true);
  searchText = '';
  selectedStatus = '';

  statusTabs = [
    { label: 'Activos', value: '' },
    { label: 'Inactivos', value: 'inactive' },
    { label: 'Dados de alta', value: 'discharged' },
    { label: 'Todos', value: 'all' },
  ];

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.load());
    this.load();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'receptionist';
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.search$.next(value);
  }

  selectStatus(value: string): void {
    this.selectedStatus = value;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const params: { search?: string; status?: string } = {};
    if (this.searchText.trim()) params.search = this.searchText.trim();
    if (this.selectedStatus) params.status = this.selectedStatus;

    this.patientsService.getAll(params).subscribe({
      next: (res) => { this.patients.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/patients', id]);
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
    const today = new Date(), birth = new Date(birthDate + 'T12:00:00');
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 ||
       (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  genderLabel(g?: string): string {
    return g === 'male' ? 'Hombre' : g === 'female' ? 'Mujer' : g === 'other' ? 'Otro' : '';
  }

  statusLabel(s: string): string {
    return s === 'active' ? 'Activo' : s === 'inactive' ? 'Inactivo' : 'Alta';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }
}

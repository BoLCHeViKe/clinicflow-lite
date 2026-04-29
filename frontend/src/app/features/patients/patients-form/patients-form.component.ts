import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PatientsService, PatientDto } from '../../../core/services/patients.service';

@Component({
  selector: 'app-patients-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, MatButtonModule, MatInputModule, MatSelectModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>{{ isEditing ? 'Editar paciente' : 'Nuevo paciente' }}</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre completo *</mat-label>
          <input matInput formControlName="name" placeholder="Ana García López">
          @if (form.get('name')?.hasError('required')) { <mat-error>El nombre es obligatorio</mat-error> }
          @if (form.get('name')?.hasError('minlength')) { <mat-error>Mínimo 2 caracteres</mat-error> }
        </mat-form-field>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>DNI / Identificación</mat-label>
            <input matInput formControlName="dni" placeholder="12345678A">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" placeholder="600 123 456">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="paciente@email.com">
          @if (form.get('email')?.hasError('email')) { <mat-error>Email no válido</mat-error> }
        </mat-form-field>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Fecha de nacimiento</mat-label>
            <input matInput type="date" formControlName="birthDate">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Género</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="">Sin especificar</mat-option>
              <mat-option value="female">Mujer</mat-option>
              <mat-option value="male">Hombre</mat-option>
              <mat-option value="other">Otro</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (isEditing) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">Activo</mat-option>
              <mat-option value="inactive">Inactivo</mat-option>
              <mat-option value="discharged">Dado de alta</mat-option>
            </mat-select>
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="address" placeholder="Calle Mayor 1, Madrid">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notas médicas</mat-label>
          <textarea matInput formControlName="medicalNotes" rows="3" placeholder="Alergias, antecedentes..."></textarea>
        </mat-form-field>

        @if (error()) {
          <p class="error-msg">{{ error() }}</p>
        }

        <div class="form-actions">
          <button mat-button type="button" routerLink="/patients">Cancelar</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear paciente') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 620px; margin: 32px auto; padding: 0 16px; }
    .form-header { margin-bottom: 24px; }
    .form-header h2 { margin: 0; font-size: 24px; font-weight: 700; color: var(--cf-dark); }
    .full-width { width: 100%; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 500px) { .row-2 { grid-template-columns: 1fr; } }
    mat-form-field { width: 100%; margin-bottom: 4px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .error-msg { color: #f44336; margin-bottom: 12px; font-size: 14px; }
  `],
})
export class PatientsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientsService = inject(PatientsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    dni:         [''],
    email:       ['', Validators.email],
    phone:       [''],
    birthDate:   [''],
    gender:      [''],
    status:      ['active'],
    address:     [''],
    medicalNotes:[''],
  });

  saving = signal(false);
  error = signal('');
  isEditing = false;
  patientId?: number;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.patientId = id ? +id : undefined;
    this.isEditing = !!this.patientId;

    if (this.isEditing) {
      this.patientsService.getById(this.patientId!).subscribe(res => {
        const p = res.data;
        this.form.patchValue({
          name: p.name,
          dni: p.dni ?? '',
          email: p.email ?? '',
          phone: p.phone ?? '',
          birthDate: p.birthDate ? p.birthDate.split('T')[0] : '',
          gender: p.gender ?? '',
          status: p.status,
          address: p.address ?? '',
          medicalNotes: p.medicalNotes ?? '',
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');

    const raw = this.form.value;
    const dto: PatientDto = {
      name: raw.name!,
      dni: raw.dni || undefined,
      email: raw.email || undefined,
      phone: raw.phone || undefined,
      birthDate: raw.birthDate || undefined,
      gender: (raw.gender as PatientDto['gender']) || undefined,
      address: raw.address || undefined,
      medicalNotes: raw.medicalNotes || undefined,
    };
    if (this.isEditing) dto.status = (raw.status as PatientDto['status']) || 'active';

    const req = this.isEditing
      ? this.patientsService.update(this.patientId!, dto)
      : this.patientsService.create(dto);

    req.subscribe({
      next: () => this.router.navigate(['/patients']),
      error: (err) => {
        this.error.set(err.error?.error || 'Error al guardar el paciente');
        this.saving.set(false);
      },
    });
  }
}

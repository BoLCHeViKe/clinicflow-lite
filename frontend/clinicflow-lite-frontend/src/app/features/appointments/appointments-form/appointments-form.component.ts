import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointments-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, MatButtonModule, MatInputModule, MatSelectModule],
  template: `
    <div class="form-container">
      <h2>{{ isEditing ? 'Editar cita' : 'Nueva cita' }}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ID del Paciente *</mat-label>
          <input matInput type="number" formControlName="patientId" placeholder="1">
          @if (form.get('patientId')?.hasError('required')) { <mat-error>El paciente es obligatorio</mat-error> }
          @if (form.get('patientId')?.hasError('min')) { <mat-error>Debe ser un ID válido</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha y hora *</mat-label>
          <input matInput type="datetime-local" formControlName="appointmentDate">
          @if (form.get('appointmentDate')?.hasError('required')) { <mat-error>La fecha es obligatoria</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Duración (minutos)</mat-label>
          <input matInput type="number" formControlName="duration" placeholder="30">
          @if (form.get('duration')?.hasError('min')) { <mat-error>Mínimo 15 minutos</mat-error> }
          @if (form.get('duration')?.hasError('max')) { <mat-error>Máximo 480 minutos</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de consulta</mat-label>
          <input matInput formControlName="type" placeholder="consulta, seguimiento, revisión...">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="scheduled">Programada</mat-option>
            <mat-option value="confirmed">Confirmada</mat-option>
            <mat-option value="completed">Completada</mat-option>
            <mat-option value="cancelled">Cancelada</mat-option>
            <mat-option value="no_show">No presentado</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notas</mat-label>
          <textarea matInput formControlName="notes" rows="3" placeholder="Observaciones opcionales"></textarea>
          @if (form.get('notes')?.hasError('maxlength')) { <mat-error>Máximo 2000 caracteres</mat-error> }
        </mat-form-field>

        @if (error()) {
          <p class="error-msg">{{ error() }}</p>
        }

        <div class="form-actions">
          <button mat-button type="button" routerLink="/appointments">Cancelar</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear cita') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 560px; margin: 40px auto; padding: 24px 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .error-msg { color: #f44336; margin-bottom: 12px; }
  `],
})
export class AppointmentsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    patientId: [null as number | null, [Validators.required, Validators.min(1)]],
    appointmentDate: ['', Validators.required],
    duration: [30, [Validators.min(15), Validators.max(480)]],
    type: [''],
    status: ['scheduled'],
    notes: ['', Validators.maxLength(2000)],
  });

  saving = signal(false);
  error = signal('');
  isEditing = false;
  itemId?: number;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.itemId = id ? +id : undefined;
    this.isEditing = !!this.itemId;

    if (this.isEditing) {
      this.appointmentsService.getById(this.itemId!).subscribe(res => {
        const appt = res.data;
        const localDate = new Date(appt.appointmentDate).toISOString().slice(0, 16);
        this.form.patchValue({ ...appt, appointmentDate: localDate });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');

    const raw = this.form.value;
    const base = {
      patientId: Number(raw.patientId),
      appointmentDate: raw.appointmentDate
        ? new Date(raw.appointmentDate).toISOString().replace('T', ' ').slice(0, 19)
        : '',
      duration: raw.duration ?? undefined,
      type: raw.type ?? undefined,
      status: (raw.status as CreateAppointmentDto['status']) ?? undefined,
      notes: raw.notes ?? undefined,
    };

    const request = this.isEditing
      ? this.appointmentsService.update(this.itemId!, base as UpdateAppointmentDto)
      : this.appointmentsService.create(base as CreateAppointmentDto);

    request.subscribe({
      next: () => this.router.navigate(['/appointments']),
      error: (err) => {
        this.error.set(err.error?.error || 'Error al guardar la cita');
        this.saving.set(false);
      },
    });
  }
}

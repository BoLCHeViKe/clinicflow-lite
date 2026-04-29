import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClinicalNotesService } from '../../core/services/clinical-notes.service';
import { PatientsService } from '../../core/services/patients.service';
import { Patient } from '../../core/models/patient.model';
import { ClinicalNote, NoteType } from '../../core/models/clinical-note.model';

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: 'observation', label: 'Observación' },
  { value: 'follow_up',   label: 'Seguimiento' },
  { value: 'diagnosis',   label: 'Diagnóstico' },
  { value: 'internal',    label: 'Comentario interno' },
];

@Component({
  selector: 'app-clinical-notes',
  standalone: true,
  imports: [
    DatePipe, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="notes-container">

      <!-- Cabecera -->
      <div class="page-header">
        <button mat-icon-button routerLink="/patients" title="Volver a pacientes">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>Notas clínicas</h1>
          @if (patient()) {
            <span class="patient-name">{{ patient()!.name }}</span>
          }
        </div>
        <span class="notes-count">{{ notes().length }} nota(s)</span>
      </div>

      <!-- Formulario nueva nota -->
      <div class="new-note-card">
        <h2 class="form-title">
          <mat-icon>note_add</mat-icon>
          Nueva nota
        </h2>
        <div class="form-row">
          <mat-form-field appearance="outline" class="type-field">
            <mat-label>Tipo</mat-label>
            <mat-select [(ngModel)]="newType">
              @for (t of noteTypes; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="content-field">
          <mat-label>Contenido de la nota</mat-label>
          <textarea
            matInput
            [(ngModel)]="newContent"
            rows="4"
            placeholder="Escribe aquí la nota clínica..."
            [maxlength]="5000"
          ></textarea>
          <mat-hint align="end">{{ newContent.length }}/5000</mat-hint>
        </mat-form-field>
        <div class="form-actions">
          <button
            mat-raised-button color="primary"
            (click)="createNote()"
            [disabled]="!newContent.trim() || saving()"
          >
            <mat-icon>save</mat-icon>
            {{ saving() ? 'Guardando...' : 'Guardar nota' }}
          </button>
        </div>
      </div>

      <!-- Filtro por tipo -->
      @if (notes().length > 0) {
        <div class="filter-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filtrar por tipo</mat-label>
            <mat-select [(ngModel)]="filterType">
              <mat-option value="">Todos los tipos</mat-option>
              @for (t of noteTypes; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      }

      <!-- Lista de notas -->
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <span>Cargando notas...</span>
        </div>
      } @else if (filteredNotes().length === 0 && notes().length === 0) {
        <div class="empty-state">
          <mat-icon>note</mat-icon>
          <p>No hay notas clínicas todavía</p>
          <span>Usa el formulario de arriba para añadir la primera nota</span>
        </div>
      } @else if (filteredNotes().length === 0) {
        <div class="empty-state">
          <mat-icon>filter_list_off</mat-icon>
          <p>No hay notas de ese tipo</p>
        </div>
      } @else {
        <div class="notes-list">
          @for (note of filteredNotes(); track note.id) {
            <div class="note-card note-card--{{ note.type }}">

              <!-- Cabecera de la nota -->
              <div class="note-header">
                <span class="note-type-chip note-type--{{ note.type }}">
                  <mat-icon class="type-icon">{{ typeIcon(note.type) }}</mat-icon>
                  {{ typeLabel(note.type) }}
                </span>
                <span class="note-date">{{ note.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                <div class="note-actions">
                  <button mat-icon-button (click)="startEdit(note)" title="Editar" [disabled]="editingId() !== null">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteNote(note)" title="Eliminar" [disabled]="editingId() !== null">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Contenido o formulario de edición -->
              @if (editingId() === note.id) {
                <div class="edit-form">
                  <mat-form-field appearance="outline" class="type-field">
                    <mat-label>Tipo</mat-label>
                    <mat-select [(ngModel)]="editType">
                      @for (t of noteTypes; track t.value) {
                        <mat-option [value]="t.value">{{ t.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="content-field">
                    <mat-label>Contenido</mat-label>
                    <textarea matInput [(ngModel)]="editContent" rows="4" [maxlength]="5000"></textarea>
                    <mat-hint align="end">{{ editContent.length }}/5000</mat-hint>
                  </mat-form-field>
                  <div class="edit-actions">
                    <button mat-button (click)="cancelEdit()">Cancelar</button>
                    <button mat-raised-button color="primary" (click)="saveEdit(note)" [disabled]="!editContent.trim()">
                      Guardar cambios
                    </button>
                  </div>
                </div>
              } @else {
                <p class="note-content">{{ note.content }}</p>
                @if (note.updatedAt !== note.createdAt) {
                  <span class="note-edited">Editado {{ note.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                }
              }

            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .notes-container { padding: 28px 32px; max-width: 860px; }

    /* Header */
    .page-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
    }
    .header-info { flex: 1; }
    .header-info h1 { margin: 0; font-size: 24px; font-weight: 700; color: var(--cf-dark); line-height: 1.2; }
    .patient-name { font-size: 14px; color: var(--cf-mid-dark); font-weight: 500; }
    .notes-count { font-size: 12px; color: var(--cf-pale); white-space: nowrap; }

    /* New note card */
    .new-note-card {
      background: #fff; border: 1px solid var(--cf-lighter); border-radius: 14px;
      padding: 20px 22px; margin-bottom: 20px;
    }
    .form-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: var(--cf-dark);
      margin: 0 0 16px;
    }
    .form-title mat-icon { font-size: 20px; height: 20px; width: 20px; color: var(--cf-primary); }
    .form-row { margin-bottom: 8px; }
    .type-field { width: 220px; }
    .content-field { width: 100%; display: block; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 4px; }

    /* Filter */
    .filter-row { margin-bottom: 16px; }
    .filter-field { width: 240px; }

    /* States */
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 32px; color: var(--cf-mid-dark); }
    .empty-state { text-align: center; padding: 40px 20px; color: var(--cf-pale); }
    .empty-state mat-icon { font-size: 44px; height: 44px; width: 44px; display: block; margin: 0 auto 10px; }
    .empty-state p { margin: 0 0 6px; font-size: 15px; font-weight: 500; color: var(--cf-mid-dark); }
    .empty-state span { font-size: 13px; }

    /* Notes list */
    .notes-list { display: flex; flex-direction: column; gap: 12px; }
    .note-card {
      background: #fff; border-radius: 12px; padding: 16px 18px;
      border: 1px solid var(--cf-lighter);
      border-left: 4px solid var(--cf-lighter);
    }
    .note-card--observation { border-left-color: #60a5fa; }
    .note-card--follow_up   { border-left-color: #34d399; }
    .note-card--diagnosis   { border-left-color: #a78bfa; }
    .note-card--internal    { border-left-color: #fbbf24; }

    /* Note header */
    .note-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .note-type-chip {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    }
    .type-icon { font-size: 13px; height: 13px; width: 13px; }
    .note-type--observation { background: #dbeafe; color: #1d4ed8; }
    .note-type--follow_up   { background: #d1fae5; color: #065f46; }
    .note-type--diagnosis   { background: #ede9fe; color: #6d28d9; }
    .note-type--internal    { background: #fef3c7; color: #92400e; }

    .note-date { font-size: 12px; color: var(--cf-pale); flex: 1; }
    .note-actions { display: flex; gap: 0; flex-shrink: 0; }

    /* Note content */
    .note-content {
      margin: 0; font-size: 14px; color: #374151; line-height: 1.6;
      white-space: pre-wrap; word-break: break-word;
    }
    .note-edited { font-size: 11px; color: var(--cf-pale); margin-top: 8px; display: block; }

    /* Inline edit form */
    .edit-form { display: flex; flex-direction: column; gap: 8px; }
    .edit-actions { display: flex; justify-content: flex-end; gap: 8px; }
  `],
})
export class ClinicalNotesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private notesService = inject(ClinicalNotesService);
  private patientsService = inject(PatientsService);

  patient = signal<Patient | null>(null);
  notes = signal<ClinicalNote[]>([]);
  loading = signal(true);
  saving = signal(false);

  // New note form
  newContent = '';
  newType: NoteType = 'observation';

  // Filter
  filterType = '';

  // Inline edit
  editingId = signal<number | null>(null);
  editContent = '';
  editType: NoteType = 'observation';

  readonly noteTypes = NOTE_TYPES;

  private patientId!: number;

  ngOnInit(): void {
    this.patientId = +this.route.snapshot.params['id'];
    this.patientsService.getById(this.patientId).subscribe({
      next: (res) => this.patient.set(res.data),
    });
    this.loadNotes();
  }

  filteredNotes(): ClinicalNote[] {
    if (!this.filterType) return this.notes();
    return this.notes().filter(n => n.type === this.filterType);
  }

  loadNotes(): void {
    this.loading.set(true);
    this.notesService.getByPatient(this.patientId).subscribe({
      next: (res) => { this.notes.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createNote(): void {
    if (!this.newContent.trim()) return;
    this.saving.set(true);
    this.notesService.create({
      patientId: this.patientId,
      content: this.newContent.trim(),
      type: this.newType,
    }).subscribe({
      next: (res) => {
        this.notes.update(list => [res.data, ...list]);
        this.newContent = '';
        this.newType = 'observation';
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  startEdit(note: ClinicalNote): void {
    this.editingId.set(note.id);
    this.editContent = note.content;
    this.editType = note.type;
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(note: ClinicalNote): void {
    if (!this.editContent.trim()) return;
    this.notesService.update(note.id, {
      content: this.editContent.trim(),
      type: this.editType,
    }).subscribe({
      next: (res) => {
        this.notes.update(list => list.map(n => n.id === note.id ? res.data : n));
        this.editingId.set(null);
      },
    });
  }

  deleteNote(note: ClinicalNote): void {
    if (!confirm(`¿Eliminar esta nota clínica?`)) return;
    this.notesService.delete(note.id).subscribe({
      next: () => this.notes.update(list => list.filter(n => n.id !== note.id)),
    });
  }

  typeLabel(type: NoteType): string {
    return NOTE_TYPES.find(t => t.value === type)?.label ?? type;
  }

  typeIcon(type: NoteType): string {
    const icons: Record<NoteType, string> = {
      observation: 'visibility',
      follow_up:   'update',
      diagnosis:   'medical_information',
      internal:    'lock',
    };
    return icons[type];
  }
}

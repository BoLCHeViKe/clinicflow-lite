export type NoteType = 'observation' | 'follow_up' | 'diagnosis' | 'internal';

export interface ClinicalNote {
  id: number;
  patientId: number;
  professionalId: number;
  professionalName?: string;
  content: string;
  type: NoteType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  patientId: number;
  content: string;
  type: NoteType;
}

export interface UpdateNoteDto {
  content: string;
  type: NoteType;
}

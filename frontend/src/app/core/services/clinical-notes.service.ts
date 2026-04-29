import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClinicalNote, CreateNoteDto, UpdateNoteDto } from '../models/clinical-note.model';

@Injectable({ providedIn: 'root' })
export class ClinicalNotesService {
  private apiUrl = `${environment.apiUrl}/clinical-notes`;

  constructor(private http: HttpClient) {}

  getByPatient(patientId: number): Observable<{ success: boolean; data: ClinicalNote[] }> {
    return this.http.get<{ success: boolean; data: ClinicalNote[] }>(
      `${this.apiUrl}/patient/${patientId}`
    );
  }

  create(data: CreateNoteDto): Observable<{ success: boolean; data: ClinicalNote }> {
    return this.http.post<{ success: boolean; data: ClinicalNote }>(this.apiUrl, data);
  }

  update(id: number, data: UpdateNoteDto): Observable<{ success: boolean; data: ClinicalNote }> {
    return this.http.put<{ success: boolean; data: ClinicalNote }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}

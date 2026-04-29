import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';

export interface PatientDto {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalNotes?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: Patient[] }> {
    return this.http.get<{ success: boolean; data: Patient[] }>(this.apiUrl);
  }

  getById(id: number): Observable<{ success: boolean; data: Patient }> {
    return this.http.get<{ success: boolean; data: Patient }>(`${this.apiUrl}/${id}`);
  }

  create(data: PatientDto): Observable<{ success: boolean; data: Patient }> {
    return this.http.post<{ success: boolean; data: Patient }>(this.apiUrl, data);
  }

  update(id: number, data: Partial<PatientDto>): Observable<{ success: boolean; data: Patient }> {
    return this.http.put<{ success: boolean; data: Patient }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ success: boolean; message: string; appointmentsDeleted: number }> {
    return this.http.delete<{ success: boolean; message: string; appointmentsDeleted: number }>(`${this.apiUrl}/${id}`);
  }
}

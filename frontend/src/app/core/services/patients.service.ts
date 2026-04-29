import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, PatientStatus, AppointmentHistory } from '../models/patient.model';

export interface PatientDto {
  name: string;
  dni?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalNotes?: string;
  status?: PatientStatus;
}

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getAll(params?: { search?: string; status?: string }): Observable<{ success: boolean; data: Patient[] }> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<{ success: boolean; data: Patient[] }>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<{ success: boolean; data: Patient }> {
    return this.http.get<{ success: boolean; data: Patient }>(`${this.apiUrl}/${id}`);
  }

  getHistory(id: number): Observable<{ success: boolean; data: AppointmentHistory[] }> {
    return this.http.get<{ success: boolean; data: AppointmentHistory[] }>(`${this.apiUrl}/${id}/history`);
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';

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
}

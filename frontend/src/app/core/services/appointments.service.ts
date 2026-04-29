import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  PaginatedResponse,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAll(filters?: {
    status?: string;
    search?: string;
    page?: number;
    date?: string;
    professionalId?: string;
    upcoming?: boolean;
  }): Observable<PaginatedResponse<Appointment>> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.professionalId) params = params.set('professionalId', filters.professionalId);
    if (filters?.upcoming) params = params.set('upcoming', 'true');
    return this.http.get<PaginatedResponse<Appointment>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<{ success: boolean; data: Appointment }> {
    return this.http.get<{ success: boolean; data: Appointment }>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateAppointmentDto): Observable<{ success: boolean; data: Appointment }> {
    return this.http.post<{ success: boolean; data: Appointment }>(this.apiUrl, data);
  }

  update(id: number, data: UpdateAppointmentDto): Observable<{ success: boolean; data: Appointment }> {
    return this.http.put<{ success: boolean; data: Appointment }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/summary`);
  }
}

export interface TodayAppointment {
  id: number;
  patientName: string;
  type: string;
  appointmentDate: string;
  duration: number;
  status: string;
}

export interface Next2hAppointment {
  id: number;
  patientName: string;
  type: string;
  appointmentDate: string;
  duration: number;
  status: string;
  professionalName: string;
}

export interface TopProfessional {
  id: number;
  name: string;
  totalAppointments: number;
  cancelledAppointments: number;
}

export interface RecentPatient {
  id: number;
  name: string;
  birthDate: string;
  lastType: string;
  nextAppointment: string | null;
}

export interface DashboardStats {
  todayCount: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  activePatientsCount: number;
  newPatientsThisWeek: number;
  cancellationRate: number;
  next2hAppointments: Next2hAppointment[];
  topProfessionals: TopProfessional[];
  todayAppointments: TodayAppointment[];
  recentPatients: RecentPatient[];
}

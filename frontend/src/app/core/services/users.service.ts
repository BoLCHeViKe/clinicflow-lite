import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Professional {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfessionals(): Observable<{ success: boolean; data: Professional[] }> {
    return this.http.get<{ success: boolean; data: Professional[] }>(`${this.apiUrl}/professionals`);
  }
}

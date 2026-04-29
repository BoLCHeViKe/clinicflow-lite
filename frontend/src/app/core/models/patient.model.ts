export type PatientStatus = 'active' | 'inactive' | 'discharged';

export interface Patient {
  id: number;
  name: string;
  dni?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalNotes?: string;
  status: PatientStatus;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentHistory {
  id: number;
  appointmentDate: string;
  duration: number;
  type?: string;
  status: string;
  notes?: string;
  professionalName: string;
}

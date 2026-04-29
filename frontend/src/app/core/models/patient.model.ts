export interface Patient {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  medicalNotes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

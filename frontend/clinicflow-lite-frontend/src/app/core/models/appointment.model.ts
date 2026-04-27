export interface Appointment {
  id: number;
  patientId: number;
  professionalId: number;
  appointmentDate: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  type?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  patientId: number;
  appointmentDate: string;
  duration?: number;
  type?: string;
  notes?: string;
  status?: Appointment['status'];
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

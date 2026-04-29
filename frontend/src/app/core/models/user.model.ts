export type UserRole = 'admin' | 'receptionist' | 'professional';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

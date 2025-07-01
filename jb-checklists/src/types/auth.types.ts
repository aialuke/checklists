import { Database } from './database.types';

export type Staff = Database['public']['Tables']['staff']['Row'];
export type Role = Database['public']['Enums']['Role'];

export interface AuthUser extends Staff {
  department?: string; // Selected daily, not stored in DB
}

export interface SessionData {
  staff: Staff;
  department?: string;
}

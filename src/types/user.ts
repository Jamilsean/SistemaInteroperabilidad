import type { Permission } from "./permission";
import type { Role } from "./roles";

export interface Usuario {
  id: number;
  name: string;
  is_active: boolean;
  failed_attempts: number;
  last_failed_at: string | null;
  email: string;
  email_verified_at: string | null;
  sso_id: string | null;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  imagen: string | null;
  dni: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
}

export interface UsuariosResponse {
  current_page: number;
  data: Usuario[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export type GetUsuariosParams = Partial<{
  page: number;
  per_page: number;
  search: string;
  search_in: string; 
  sort_by: "id" | "is_active" | "email_verified_at" | "email" | "created_at" | "updated_at";
  sort_dir: "asc" | "desc";
}>;

// --- acciones ---
export interface ToggleStatusOk {
  message?: string;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
export interface RegisterUserOk {
  message?: string;
  user?: Usuario;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
}
export type GetUsersParams = {
  page?: number;
  per_page?: number;
  search?: string;
};
export interface UsersResponse {
  cantidad: number; 
  users: User[];
}
export interface MeUser {
  id: number;
  name: string;
  is_active: boolean;
  failed_attempts: number;
  last_failed_at: string | null;
  email: string;
  email_verified_at: string | null;
  sso_id: string | null;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  imagen: string | null;
  dni: string | null;
  created_at: string;
  updated_at: string;
}
export interface MeResponse {
  user: MeUser;
}
export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
export interface UpdatePasswordOk {
  message: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}
export interface UpdateProfileOk {
  message: string; 
  user?: MeUser;    
}

export type ValidationErrors = Record<string, string[]>;
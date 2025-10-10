// src/types/roleUser.ts
export type Permission = {
  id: number;
  name: string;          // p.ej. "users.update"
  display_name: string;  // puede venir igual al name
  guard_name: string;    // "api"
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: number;
  name: string;           // p.ej. "admin"
  display_name?: string;  // "Administrador"
  guard_name: string;     // "api"
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRolesPermissions = {
  roles: string[];        // ["admin","editor"]
  permissions: string[];  // ["users.read","users.update", ...]
};

export type GetUserRolesPermsResponse = {
  success: boolean;
  data: UserRolesPermissions;
};

export type ListPermissionsResponse = {
  success: boolean;
  data: Permission[];
};

// /v1/roles (list) simplificado para opciones en UI
export type ListRolesResponse = {
  status: "success";
  message: string;
  data: Role[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
};

 export type Permission = {
  id: number;
  name: string;
  display_name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: number;
  name: string;         
  display_name: string; 
  description: string | null;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
};

export type RolesListResponse = {
  status: "success";
  message: string;
  data: Role[];
  pagination: {
    total: number;
    to: number;
    prev_page_url: string | null;
    per_page: number;
    path: string;
    next_page_url: string | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    last_page: number;
    last_page_url: string;
    from: number;
    first_page_url: string;
    current_page: number;
  };
};

export type PermissionsResponse = {
  success: boolean;
  data: Permission[];
};

export type GetRolesParams = {
  page?: number;
  per_page?: number;            
  search?: string;
  search_in?: string;           
  sort_by?: "id" | "name" | "guard_name" | "created_at" | "updated_at";
  sort_dir?: "asc" | "desc";
};

export type CreateRolePayload = {
  name: string;
  display_name: string;
  description?: string | null;
  permissions: string[];         
};

export type UpdateRolePayload = {
  display_name?: string;
  description?: string | null;
  permissions?: string[];
};

export type OneRoleResponse = {
  success: boolean;
  message: string;
  data: Role;
};

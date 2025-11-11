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
  display_name?: string;
  guard_name: string;     
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRolesPermissions = {
  roles: string[];      
  permissions: string[]; 
};

export type GetUserRolesPermsResponse = {
  success: boolean;
  data: UserRolesPermissions;
};

export type ListPermissionsResponse = {
  success: boolean;
  data: Permission[];
};

// /v1/roles (list) simplificado
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

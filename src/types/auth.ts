export type RPivot = { role_id?: number; permission_id?: number; model_type?: string; model_id?: number };

export type RPermission = {
  id: number; name: string; display_name: string; guard_name: "api";
  created_at: string; updated_at: string; pivot?: RPivot;
};

export type RRole = {
  id: number; name: string; display_name: string; guard_name: "api";
  description: string | null;
  created_at: string; updated_at: string; pivot?: RPivot;
  permissions?: RPermission[];
};

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;         // segundos
  user: {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    roles?: RRole[];
    permissions?: RPermission[];
    [k: string]: unknown;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}
export type SSOCallbackBody = { code: string };

export type SSOUser = {
  id: number;
  dni?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  email?: string | null;
  [k: string]: any;
};
export type SSOCallbackOk = {
  success?: boolean;
  message?: string;
  data?: SSOCallbackPayload;
} & SSOCallbackPayload;
export type SSOCallbackPayload = {
  // el backend podría devolver cualquiera de estos
  token?: string;
  jwt?: string;
  access_token?: string;
  user?: SSOUser;
  roles?: Array<string | { name: string }>;
  permissions?: Array<string | { name: string }>;
};


export interface PivotPermission {
  model_type: string;
  model_id: number;
  permission_id: number;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: PivotPermission;
}

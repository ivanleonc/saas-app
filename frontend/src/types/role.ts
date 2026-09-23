export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_system?: boolean;
  company_id: string | null;
  permissions: Permission[];
}

export interface RolePayload {
  name?: string;
  description?: string;
  color?: string;
  permissionIds?: string[];
}

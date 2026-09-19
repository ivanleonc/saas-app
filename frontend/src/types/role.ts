export interface Permission {
  id: number;
  code: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  company_id: string | null;
  permissions: Permission[];
}

export interface IRoleContent {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  company_id: number | null;
  permissions: unknown[];
  [key: string]: unknown;
}

export interface IPermissionContent {
  id: number;
  name: string;
  module_group: string;
  description: string;
  [key: string]: unknown;
}

export interface IRoleRepository {
  getRolesWithPermissions(companyId: number): Promise<IRoleContent[]>;
  getAllPermissions(): Promise<IPermissionContent[]>;
  createCustomRole(companyId: number, name: string, description: string, permissionIds: number[]): Promise<number>;
}
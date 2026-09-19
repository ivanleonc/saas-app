import { apiClient } from '@/api/axios';

export interface Permission {
  id: number;
  code: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  company_id: string | null;
  permissions: Permission[];
}

export const roleService = {
  async getAllPermissions(): Promise<Permission[]> {
    const response = await apiClient.get('/permissions');
    return response.data.data;
  },

  async getRoles(companyId?: string): Promise<Role[]> {
    const headers: Record<string, string> = {};
    if (companyId) headers['x-company-id'] = companyId;
    const response = await apiClient.get('/roles', { headers });
    return response.data.data;
  },

  async getRoleById(id: string): Promise<Role> {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data.data;
  },

  async createRole(payload: { name: string; permissionIds?: number[] }) {
    const response = await apiClient.post('/roles', payload);
    return response.data;
  },

  async updateRolePermissions(roleId: string, permissionIds: number[]) {
    const response = await apiClient.put(`/roles/${roleId}/permissions`, { permissionIds });
    return response.data;
  },

  async deleteRole(roleId: string) {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return response.data;
  },
};

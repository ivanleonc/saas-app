import { apiClient } from '@/api/axios';

export interface Permission { id: number; name: string; module_group?: string; }
export interface Role { id: number; name: string; description: string; is_system: boolean; permissions: Permission[]; }

export const roleService = {
  async getRoles(companyId: number): Promise<Role[]> {
    const response = await apiClient.get('/roles', { headers: { 'x-company-id': companyId.toString() }});
    return response.data.data;
  },
  
  // NUEVO: Catálogo maestro
  async getAllPermissions(): Promise<Permission[]> {
    const response = await apiClient.get('/permissions');
    return response.data.data;
  },

  // NUEVO: Crear rol
  async createRole(companyId: number, payload: { name: string; description: string; permissionIds: number[] }) {
    const response = await apiClient.post('/roles', payload, { headers: { 'x-company-id': companyId.toString() }});
    return response.data;
  }
};
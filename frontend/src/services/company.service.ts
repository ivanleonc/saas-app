import { apiClient } from '@/api/axios';
import type { UpdateCompanyPayload } from '@/types/company';

export const companyService = {
  // Función existente...
  async updateCompany(companyId: number, payload: UpdateCompanyPayload) {
    const response = await apiClient.patch(`/companies/${companyId}`, payload, {
      headers: { 'x-company-id': companyId.toString() } 
    });
    return response.data;
  },

  // === NUEVA FUNCIÓN ===
  async createCompany(payload: { name: string; tax_id?: string }) {
    // No inyectamos 'x-company-id' porque la empresa aún no existe
    const response = await apiClient.post('/companies', payload);
    return response.data;
  }
};
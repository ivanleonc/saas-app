import { apiClient } from '@/api/axios';
import type { UpdateCompanyPayload } from '@/types/company';

export const companyService = {
  async getCompanies() {
    const response = await apiClient.get('/companies');
    return response.data;
  },

  async createCompany(payload: { name: string; tax_id?: string }) {
    const response = await apiClient.post('/companies', payload);
    return response.data;
  },

  async updateCompany(companyId: string, payload: UpdateCompanyPayload) {
    const response = await apiClient.put(`/companies/${companyId}`, payload);
    return response.data;
  },
};

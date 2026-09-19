import { defineStore } from 'pinia';
import { ref } from 'vue';
import { companyService } from '@/services/company.service';
import { useAuthStore } from './auth.store';
import type { UpdateCompanyPayload } from '@/types/company';

export const useCompanyStore = defineStore('company', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const authStore = useAuthStore();

  const withLoading = async <T>(fn: () => Promise<T>, errorMsg?: string): Promise<T | undefined> => {
    isLoading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err: any) {
      error.value = err.response?.data?.message || err.response?.data?.error || errorMsg || 'Error en la operación';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateCompany = async (companyId: string, payload: UpdateCompanyPayload) => {
    return withLoading(async () => {
      const result = await companyService.updateCompany(companyId, payload);

      if (authStore.user && authStore.user.tenants) {
        const tenant = authStore.user.tenants.find((t) => t.id === companyId);
        if (tenant) {
          if (payload.name) tenant.name = payload.name;
          if (payload.tax_id !== undefined) tenant.tax_id = payload.tax_id;
        }
      }

      return result;
    }, 'Error al actualizar la empresa');
  };

  const createCompany = async (payload: { name: string; tax_id?: string }) => {
    return withLoading(async () => {
      const result = await companyService.createCompany(payload);
      const newCompany = result.data.company;

      if (authStore.user) {
        const newTenant = {
          id: newCompany.id,
          name: newCompany.name,
          tax_id: newCompany.tax_id,
          roles: ['Owner'],
        };

        if (!authStore.user.tenants) authStore.user.tenants = [];
        authStore.user.tenants.push(newTenant);
        authStore.setActiveTenant(newCompany.id);
      }

      return result;
    }, 'Error al crear la empresa');
  };

  return { isLoading, error, updateCompany, createCompany };
});

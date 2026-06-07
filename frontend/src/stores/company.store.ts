import { defineStore } from 'pinia';
import { ref } from 'vue';
import { companyService } from '@/services/company.service';
import { useAuthStore } from './auth.store';
import type { UpdateCompanyPayload } from '@/types/company';

export const useCompanyStore = defineStore('company', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const authStore = useAuthStore(); 

  const updateCompany = async (companyId: number, payload: UpdateCompanyPayload) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await companyService.updateCompany(companyId, payload);
      
      // Actualización reactiva en memoria para el Sidebar
      if (authStore.user && authStore.user.tenants) {
        const tenant = authStore.user.tenants.find(t => t.id === companyId);
        if (tenant) {
          if (payload.name) tenant.name = payload.name;
          if (payload.tax_id !== undefined) tenant.tax_id = payload.tax_id;
          // pinia-plugin-persistedstate en useAuthStore ya se encarga automáticamente
        }
      }
      
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al actualizar la empresa';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

// === NUEVA ACCIÓN DE CREAR ===
  const createCompany = async (payload: { name: string; tax_id?: string }) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await companyService.createCompany(payload);
      
      // ¡ATENCIÓN AL CAMBIO! Ahora extraemos ambas cosas
      const newCompany = result.data.company;
      const newToken = result.data.token; 
      
      if (authStore.user) {
        const newTenant = {
          id: newCompany.id,
          name: newCompany.name,
          tax_id: newCompany.tax_id,
          role: 'Owner',
          permissions: [] 
        };

        if (!authStore.user.tenants) authStore.user.tenants = [];
        authStore.user.tenants.push(newTenant);
        
        // El plugin de Pinia persiste authStore.user automáticamente
        
        // 2. Actualizamos el token de sesión (authStore expone método)
        authStore.updateToken(newToken);
        
        // 3. Hacemos el cambio en la vista (persiste automáticamente el activeTenantId)
        authStore.setActiveTenant(newCompany.id);
      }
      
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al crear la empresa';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, updateCompany, createCompany }; 
});
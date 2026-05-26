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
          localStorage.setItem('saas_user', JSON.stringify(authStore.user));
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
        
        // 1. Actualizamos el usuario en el disco duro
        localStorage.setItem('saas_user', JSON.stringify(authStore.user));
        
        // 2. ¡EL TRUCO DE MAGIA! Cambiamos el token viejo por el nuevo en tiempo real
        localStorage.setItem('saas_token', newToken);
        
        // 3. Hacemos el cambio en la vista
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
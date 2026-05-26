import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '@/services/auth.service';
import { TokenService } from '@/utils/token.service';
import type { LoginPayload, RegisterPayload } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  // 1. INICIALIZACIÓN CON PERSISTENCIA
  // Recuperamos los datos del localStorage si existen al cargar la página
  const storedUser = localStorage.getItem('saas_user');
  const storedTenant = localStorage.getItem('saas_active_tenant');

  const user = ref<any>(storedUser ? JSON.parse(storedUser) : null);
  const token = ref<string | null>(TokenService.getToken());
  const activeTenantId = ref<number | null>(storedTenant ? parseInt(storedTenant) : null);
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 2. ACTUALIZACIÓN DE SESIÓN GUARDANDO EN LOCAL
  const setSession = (newToken: string, userData: any) => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('saas_user', JSON.stringify(userData)); // Guardamos el usuario

    if (userData?.tenants?.length > 0) {
      activeTenantId.value = userData.tenants[0].id;
      localStorage.setItem('saas_active_tenant', activeTenantId.value.toString()); // Guardamos la empresa
    }
    TokenService.saveToken(newToken);
  };

  const setActiveTenant = (tenantId: number) => {
    activeTenantId.value = tenantId;
    localStorage.setItem('saas_active_tenant', tenantId.toString()); // Persistimos el cambio
  };

  // 3. LIMPIEZA TOTAL AL SALIR
  const logout = () => {
    user.value = null;
    token.value = null;
    activeTenantId.value = null;
    
    TokenService.destroyToken();
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_active_tenant');
  };

  // ... (login y register quedan exactamente igual)
  const login = async (payload: LoginPayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.login(payload);
      const { token: jwt, user: userData } = response.data || response; 
      setSession(jwt, userData);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión';
      throw err; 
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (payload: RegisterPayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.register(payload);
      const { token: jwt, user: userData } = response.data || response;
      setSession(jwt, userData);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al registrar usuario';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfileData = (updatedUserData: { name: string; email: string }) => {
    if (user.value) {
      user.value.name = updatedUserData.name;
      user.value.email = updatedUserData.email;
      
      // Persistimos los nuevos datos de identidad en el LocalStorage
      localStorage.setItem('saas_user', JSON.stringify(user.value));
    }
  };

  return { user, token, activeTenantId, isLoading, error, login, logout, register, setActiveTenant, updateProfileData };
});
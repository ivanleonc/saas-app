import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import { TokenService } from '@/utils/token.service';
import type { LoginPayload, RegisterPayload, AuthUser } from '@/types/auth';
import { SystemRoles } from '@/constants/roles';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(TokenService.getToken());
  const refreshToken = ref<string | null>(TokenService.getRefreshToken());
  const activeTenantId = ref<string | null>(null);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);
  const currentTenant = computed(() =>
    user.value?.tenants?.find((t) => t.id === activeTenantId.value)
  );

  const setSession = (access: string, refresh: string, userData: AuthUser) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    user.value = userData;
    TokenService.saveTokens(access, refresh);

    if (userData?.tenants?.length > 0 && !activeTenantId.value) {
      activeTenantId.value = userData.tenants[0].id;
    }
  };

  const setActiveTenant = (tenantId: string) => {
    activeTenantId.value = tenantId;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false;
    if (user.value.roles?.includes(SystemRoles.OWNER)) return true;
    return user.value.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    if (!user.value) return false;
    return user.value.roles?.includes(role) || false;
  };

  const login = async (payload: LoginPayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authService.login(payload);
      const { accessToken: access, refreshToken: refresh, user: userData } = response.data;
      setSession(access, refresh, userData);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al iniciar sesión';
      error.value = msg;
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
      const { accessToken: access, refreshToken: refresh, user: userData } = response.data;
      setSession(access, refresh, userData);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al registrar usuario';
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    if (!refreshToken.value) return false;
    try {
      const response = await authService.refresh(refreshToken.value);
      const { accessToken: access, refreshToken: refresh } = response.data;
      accessToken.value = access;
      refreshToken.value = refresh;
      TokenService.saveTokens(access, refresh);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      user.value = response.data;
      if (response.data?.tenants?.length > 0 && !activeTenantId.value) {
        activeTenantId.value = response.data.tenants[0].id;
      }
    } catch {
      // Silently fail — the interceptor will handle 401
    }
  };

  const logout = async () => {
    try {
      if (refreshToken.value) {
        await authService.logout(refreshToken.value);
      }
    } catch {}
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    activeTenantId.value = null;
    TokenService.destroyTokens();
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_active_tenant');
  };

  const updateProfileData = (updatedUserData: {
    name?: string;
    email?: string;
    phone?: string | null;
    avatar_url?: string | null;
    position?: string | null;
    document_type?: string | null;
    document_number?: string | null;
    timezone?: string | null;
    locale?: string | null;
    pending_email?: string | null;
  }) => {
    if (user.value) {
      Object.assign(user.value, updatedUserData);
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    activeTenantId,
    isLoading,
    error,
    isAuthenticated,
    currentTenant,
    login,
    logout,
    register,
    refreshTokens,
    fetchProfile,
    setActiveTenant,
    updateProfileData,
    hasPermission,
    hasRole,
  };
}, {
  persist: {
    key: 'saas_auth_storage',
    pick: ['user', 'activeTenantId', 'refreshToken'],
  },
});

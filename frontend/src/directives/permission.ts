import type { Directive } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

export const permissionDirective: Directive = {
  mounted(el, binding) {
    const authStore = useAuthStore();
    // El valor que le pasemos a la directiva, ej: v-permission="'users:create'"
    const requiredPermission = binding.value; 
    
    const activeTenant = authStore.user?.tenants?.find((t: any) => t.id === authStore.activeTenantId);
    
    // Regla de Oro: Si es Owner, tiene acceso a todo. Si no, verificamos el array de permisos.
    const isOwner = activeTenant?.roles?.includes('Owner');
    const hasPermission = activeTenant?.permissions?.includes(requiredPermission);

    if (!isOwner && !hasPermission) {
      // Si no tiene permiso, destruimos el elemento del DOM por seguridad
      el.parentNode?.removeChild(el); 
    }
  }
};
import type { Directive } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

export const permissionDirective: Directive = {
  mounted(el, binding) {
    const authStore = useAuthStore();
    const requiredPermission = binding.value;

    if (!requiredPermission) return;

    if (!authStore.hasPermission(requiredPermission)) {
      el.parentNode?.removeChild(el);
    }
  },
  updated(el, binding) {
    const authStore = useAuthStore();
    const requiredPermission = binding.value;

    if (!requiredPermission) return;

    if (!authStore.hasPermission(requiredPermission)) {
      el.parentNode?.removeChild(el);
    }
  },
};

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

// 1. Definición de Rutas
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    // Usamos Lazy Loading (import dinámico) para optimizar el bundle inicial
    component: () => import('@/views/LoginView.vue'),
    meta: {
      requiresGuest: true // Solo usuarios NO autenticados pueden ver esto
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'), // Asumiendo que crearás esta vista
    meta: {
      requiresAuth: true // Ruta estrictamente protegida
    }
  },
  {
    path: '/dashboard/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true } // Asumiendo que tienes protección de rutas
  },
  {
    // Catch-all para rutas no encontradas (404)
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue') // Vista 404 opcional
  },
  {
    path: '/dashboard/members',
    name: 'Members',
    component: () => import('@/views/MembersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/roles',
    name: 'Roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { 
      requiresAuth: true,
      // Agregamos el permiso requerido para entrar a esta pantalla
       requiredPermission: 'roles:read' // Esto es opcional, dependiendo de cómo quieras manejar los permisos en el frontend
    }
  }
];

// 2. Instancia del Router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 3. Navigation Guards (El Firewall del Frontend)
// 3. Navigation Guards (El Firewall del Frontend)
router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;

  // Lógica de redirección moderna (retornando el objeto en lugar de usar next())
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login' };
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'Dashboard' };
  }

  if (to.meta.requiredPermission) {
    const activeTenant = authStore.user?.tenants?.find((t: any) => t.id === authStore.activeTenantId);
    const isOwner = activeTenant?.roles?.includes('Owner');
    const hasPerm = activeTenant?.permissions?.includes(to.meta.requiredPermission as string);

    if (!isOwner && !hasPerm) {
      // Lo pateamos al dashboard principal si no tiene permiso
      return { name: 'Dashboard' };
    }
  }
  // Si no retornamos nada, Vue Router permite la navegación por defecto
});

export default router;
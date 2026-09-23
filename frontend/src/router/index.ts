import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { Permissions } from '@/constants/permissions';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/:companyId',
    redirect: (to) => `/companies/${to.params.companyId}/dashboard`,
  },
  {
    path: '/companies/:companyId/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/:companyId/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/:companyId/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/:companyId/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePasswordView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/:companyId/members',
    name: 'Members',
    component: () => import('@/views/MembersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/companies/:companyId/branches',
    name: 'Branches',
    component: () => import('@/views/BranchesView.vue'),
    meta: { requiresAuth: true, requiredPermission: Permissions.BRANCHES.READ },
  },
  {
    path: '/companies/:companyId/roles',
    name: 'Roles',
    component: () => import('@/views/RolesView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: Permissions.ROLES.READ,
    },
  },
  {
    path: '/companies/:companyId/audit',
    name: 'Audit',
    component: () => import('@/views/AuditView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: Permissions.AUDIT.READ,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const companyId = to.params.companyId as string | undefined;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login' };
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    const tenantId = authStore.activeTenantId || authStore.user?.tenants?.[0]?.id;
    if (tenantId) {
      return { path: `/companies/${tenantId}/dashboard` };
    }
    return { name: 'Onboarding' };
  }

  // Sync activeTenantId with URL param
  if (companyId && isAuthenticated) {
    const validTenant = authStore.user?.tenants?.some((t) => t.id === companyId);
    if (validTenant && authStore.activeTenantId !== companyId) {
      authStore.setActiveTenant(companyId);
    } else if (!validTenant) {
      const fallbackId = authStore.activeTenantId || authStore.user?.tenants?.[0]?.id;
      if (fallbackId) {
        return { path: `/companies/${fallbackId}/dashboard` };
      }
    }
  }

  // Users without any organization go to onboarding first
  if (
    isAuthenticated &&
    (authStore.user?.tenants?.length || 0) === 0 &&
    to.name !== 'Onboarding' &&
    to.meta.requiresAuth
  ) {
    return { name: 'Onboarding' };
  }

  // Force password change — block all pages except ChangePassword
  if (isAuthenticated && authStore.user?.must_change_password && to.name !== 'ChangePassword' && to.name !== 'Onboarding') {
    const tenantId = companyId || authStore.activeTenantId || authStore.user?.tenants?.[0]?.id;
    if (tenantId) {
      return { path: `/companies/${tenantId}/change-password` };
    }
  }

  if (to.meta.requiredPermission) {
    if (!authStore.hasPermission(to.meta.requiredPermission as string)) {
      const tenantId = companyId || authStore.activeTenantId || authStore.user?.tenants?.[0]?.id;
      if (tenantId) {
        return { path: `/companies/${tenantId}/dashboard` };
      }
    }
  }
});

export default router;

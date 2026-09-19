<template>
  <div class="layout-container">
    <!-- Left Sidebar -->
    <aside class="sidebar">
      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <IconDeviceAnalytics :size="24" stroke-width="2.5" />
        </div>
        <span class="brand-name">SaaS</span>
      </div>

      <!-- Company Switcher -->
      <div class="sidebar-company">
        <div class="company-trigger" @click="isCompanyDropdownOpen = !isCompanyDropdownOpen">
          <div class="company-avatar">{{ activeCompanyInitials }}</div>
          <div class="company-info">
            <span class="company-name">{{ activeCompany?.name || 'Mi Empresa' }}</span>
            <span class="company-plan">Workspace</span>
          </div>
          <IconChevronDown :size="16" stroke-width="2" class="company-chevron" />
        </div>

        <!-- Company Dropdown -->
        <div v-if="isCompanyDropdownOpen" class="dropdown-overlay" @click="isCompanyDropdownOpen = false"></div>
        <div v-if="isCompanyDropdownOpen" class="company-dropdown">
          <div class="dropdown-label">Empresas</div>
          <div
            v-for="tenant in authStore.user?.tenants"
            :key="tenant.id"
            class="dropdown-item"
            :class="{ active: authStore.activeTenantId === tenant.id }"
            @click="handleTenantChange(tenant.id)"
          >
            <div class="tenant-logo">{{ tenant.name.substring(0,2).toUpperCase() }}</div>
            <span class="dropdown-item-name">{{ tenant.name }}</span>
            <IconCheck v-if="authStore.activeTenantId === tenant.id" class="check-icon" :size="16" />
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item create-action" @click="openCreateModal">
            <IconPlus :size="16" />
            <span class="dropdown-item-name">Nueva empresa</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-label">Principal</span>
          <router-link to="/dashboard" class="nav-link" exact-active-class="active">
            <IconLayoutDashboard :size="20" stroke-width="1.8" />
            <span>Dashboard</span>
          </router-link>
          <router-link to="/dashboard/members" class="nav-link" active-class="active">
            <IconUsers :size="20" stroke-width="1.8" />
            <span>Miembros</span>
            <span v-if="memberCount > 0" class="nav-badge">{{ memberCount }}</span>
          </router-link>
          <router-link to="/dashboard/roles" class="nav-link" active-class="active" v-permission="'roles:read'">
            <IconShieldLock :size="20" stroke-width="1.8" />
            <span>Roles</span>
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-label">Sistema</span>
          <router-link to="/dashboard/settings" class="nav-link" active-class="active">
            <IconSettings :size="20" stroke-width="1.8" />
            <span>Configuración</span>
          </router-link>
          <router-link to="/dashboard/profile" class="nav-link" active-class="active">
            <IconUserCircle :size="20" stroke-width="1.8" />
            <span>Mi Cuenta</span>
          </router-link>
        </div>
      </nav>

      <!-- Bottom: Theme toggle + User -->
      <div class="sidebar-bottom">
        <button class="theme-toggle" @click="toggleTheme">
          <IconSun v-if="!isDarkMode" :size="18" stroke-width="1.8" />
          <IconMoon v-else :size="18" stroke-width="1.8" />
          <span>{{ isDarkMode ? 'Modo Claro' : 'Modo Oscuro' }}</span>
        </button>

        <div class="sidebar-user" @click="isUserDropdownOpen = !isUserDropdownOpen">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.name || 'Usuario' }}</span>
            <span class="user-email">{{ authStore.user?.email }}</span>
          </div>
          <IconChevronDown :size="14" stroke-width="2" />
        </div>

        <!-- User Dropdown -->
        <div v-if="isUserDropdownOpen" class="user-dropdown">
          <div class="dropdown-item" @click="router.push('/dashboard/profile'); isUserDropdownOpen = false">
            <IconUserCircle :size="16" />
            <span class="dropdown-item-name">Mi Perfil</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger" @click="handleLogout">
            <IconLogout :size="16" />
            <span class="dropdown-item-name">Cerrar Sesión</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-area">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <IconLayoutSidebar :size="20" stroke-width="2" class="sidebar-toggle" @click="toggleSidebar" />
          <nav class="breadcrumb" v-if="breadcrumbs.length > 1">
            <ol>
              <li v-for="(item, index) in breadcrumbs" :key="index">
                <router-link v-if="!item.isLast" :to="item.url" class="breadcrumb-link">{{ item.name }}</router-link>
                <span v-else class="breadcrumb-current">{{ item.name }}</span>
                <IconChevronRight v-if="!item.isLast" class="breadcrumb-sep" :size="14" />
              </li>
            </ol>
          </nav>
        </div>
        <div class="topbar-right">
          <div class="search-box">
            <IconSearch :size="16" />
            <input type="text" placeholder="Buscar..." />
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="main-content">
        <slot></slot>
      </main>
    </div>

    <!-- Create Company Modal -->
    <UiModal v-model="isCreateModalOpen">
      <form @submit.prevent="handleCreateSubmit">
        <UiCard>
          <template #header>
            <h3 class="modal-title">Crear Nueva Empresa</h3>
            <p class="modal-subtitle">Agrega un nuevo espacio de trabajo a tu cuenta.</p>
          </template>
          <div class="modal-body">
            <UiAlert v-if="companyStore.error">{{ companyStore.error }}</UiAlert>
            <UiInput v-model="createForm.name" label="Nombre de la Empresa" required />
            <UiInput v-model="createForm.tax_id" label="Tax ID / NIT / RFC (Opcional)" />
          </div>
          <template #footer>
            <div class="modal-footer">
              <UiButton type="button" variant="outline" @click="isCreateModalOpen = false">Cancelar</UiButton>
              <UiButton type="submit" :loading="companyStore.isLoading">Crear y Entrar</UiButton>
            </div>
          </template>
        </UiCard>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useMemberStore } from '@/stores/member.store';
import { useCompanyStore } from '@/stores/company.store';
import UiModal from '@/components/ui/UiModal.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import {
  IconDeviceAnalytics,
  IconLayoutDashboard,
  IconUsers,
  IconShieldLock,
  IconSettings,
  IconUserCircle,
  IconLogout,
  IconChevronDown,
  IconChevronRight,
  IconCheck,
  IconPlus,
  IconSun,
  IconMoon,
  IconSearch,
  IconLayoutSidebar,
} from '@tabler/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const memberStore = useMemberStore();
const companyStore = useCompanyStore();

const isDarkMode = ref(false);
const isCompanyDropdownOpen = ref(false);
const isUserDropdownOpen = ref(false);
const isCreateModalOpen = ref(false);
const createForm = reactive({ name: '', tax_id: '' });

const memberCount = computed(() => memberStore.members?.length || 0);

const activeCompany = computed(() =>
  authStore.user?.tenants?.find((t: any) => t.id === authStore.activeTenantId) || null
);

const activeCompanyInitials = computed(() => {
  const name = activeCompany.value?.name || 'ME';
  return name.substring(0, 2).toUpperCase();
});

const userInitials = computed(() => {
  const name = authStore.user?.name || 'U';
  return name.substring(0, 2).toUpperCase();
});

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(p => p);
  return paths.map((path, index) => {
    const url = '/' + paths.slice(0, index + 1).join('/');
    let name = path.charAt(0).toUpperCase() + path.slice(1);
    if (name === 'Members') name = 'Miembros';
    if (name === 'Settings') name = 'Configuración';
    if (name === 'Roles') name = 'Roles y Permisos';
    return { name, url, isLast: index === paths.length - 1 };
  });
});

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

const toggleSidebar = () => {
  document.querySelector('.sidebar')?.classList.toggle('collapsed');
};

const handleTenantChange = (tenantId: string) => {
  authStore.setActiveTenant(tenantId);
  isCompanyDropdownOpen.value = false;
};

const openCreateModal = () => {
  isCompanyDropdownOpen.value = false;
  createForm.name = '';
  createForm.tax_id = '';
  companyStore.error = null;
  isCreateModalOpen.value = true;
};

const handleCreateSubmit = async () => {
  try {
    await companyStore.createCompany({ name: createForm.name, tax_id: createForm.tax_id });
    isCreateModalOpen.value = false;
    router.push('/dashboard');
  } catch (error) {
    console.error('Error al crear la empresa', error);
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-app);
}

/* ═══════════════ SIDEBAR ═══════════════ */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s ease;
  z-index: 20;
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}
.sidebar.collapsed .brand-name,
.sidebar.collapsed .company-info,
.sidebar.collapsed .company-chevron,
.sidebar.collapsed .nav-link span,
.sidebar.collapsed .nav-section-label,
.sidebar.collapsed .nav-badge,
.sidebar.collapsed .sidebar-bottom span,
.sidebar.collapsed .user-info,
.sidebar.collapsed .sidebar-user > svg {
  display: none;
}
.sidebar.collapsed .sidebar-brand {
  justify-content: center;
  padding: 1rem 0;
}
.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.625rem;
}
.sidebar.collapsed .sidebar-user {
  justify-content: center;
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 1rem;
}

.brand-logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.025em;
}

/* Company Switcher */
.sidebar-company {
  padding: 0 0.75rem;
  margin-bottom: 0.5rem;
  position: relative;
}

.company-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.15s;
}
.company-trigger:hover { background-color: var(--bg-hover); }

.company-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.company-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.company-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.company-plan {
  font-size: 0.6875rem;
  color: var(--text-light);
}

.company-chevron {
  color: var(--text-light);
  flex-shrink: 0;
}

/* Company Dropdown */
.dropdown-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 40;
}

.company-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0.75rem;
  right: 0.75rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.375rem;
  z-index: 50;
  box-shadow: var(--shadow-lg);
}

.dropdown-label {
  font-size: 0.6875rem;
  color: var(--text-light);
  padding: 0.375rem 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-main);
  transition: background-color 0.15s;
}
.dropdown-item:hover, .dropdown-item.active { background-color: var(--bg-hover); }

.dropdown-item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tenant-logo {
  width: 24px;
  height: 24px;
  background-color: var(--accent-blue);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5625rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.check-icon { color: var(--color-success); flex-shrink: 0; }
.dropdown-divider { height: 1px; background-color: var(--border); margin: 0.25rem 0; }
.create-action { color: var(--accent-blue); font-weight: 500; }

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.75rem;
}

.nav-section {
  margin-bottom: 0.75rem;
}

.nav-section-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0.625rem 0.375rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.15s;
  position: relative;
}
.nav-link:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}
.nav-link.active {
  background-color: var(--bg-active);
  color: var(--text-main);
  font-weight: 600;
}

.nav-badge {
  margin-left: auto;
  background-color: var(--accent-blue-bg);
  color: var(--accent-blue);
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  line-height: 1.4;
}

/* Sidebar Bottom */
.sidebar-bottom {
  padding: 0.75rem;
  border-top: 1px solid var(--border);
  position: relative;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  background: none;
  border-radius: var(--radius);
  color: var(--text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 0.25rem;
}
.theme-toggle:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.15s;
}
.sidebar-user:hover { background-color: var(--bg-hover); }

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-purple), #ec4899);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.user-email {
  font-size: 0.6875rem;
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-dropdown {
  position: absolute;
  bottom: calc(100% + 0.25rem);
  left: 0.75rem;
  right: 0.75rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.375rem;
  box-shadow: var(--shadow-lg);
  z-index: 50;
}
.user-dropdown .danger { color: var(--color-danger); }

/* ═══════════════ MAIN AREA ═══════════════ */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.topbar {
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle {
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}
.sidebar-toggle:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.breadcrumb ol {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.25rem;
}
.breadcrumb li { display: flex; align-items: center; }
.breadcrumb-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: color 0.15s;
}
.breadcrumb-link:hover { color: var(--text-main); }
.breadcrumb-current { color: var(--text-main); font-weight: 600; font-size: 0.8125rem; }
.breadcrumb-sep { color: var(--text-light); }

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background-color: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-light);
  transition: all 0.15s;
}
.search-box:focus-within {
  border-color: var(--text-main);
  background-color: var(--bg-input);
  box-shadow: 0 0 0 2px var(--bg-hover);
}
.search-box input {
  border: none;
  background: none;
  outline: none;
  font-size: 0.8125rem;
  color: var(--text-main);
  width: 180px;
}
.search-box input::placeholder { color: var(--text-placeholder); }

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

/* Modal */
.modal-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--text-main); }
.modal-subtitle { margin: 0.25rem 0 0; font-size: 0.8125rem; color: var(--text-muted); }
.modal-body { display: flex; flex-direction: column; gap: 1rem; }
.modal-footer { display: flex; gap: 0.5rem; width: 100%; }

/* ═══════════════ RESPONSIVE ═══════════════ */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -260px;
    transition: left 0.25s ease;
    z-index: 100;
  }
  .sidebar.mobile-open {
    left: 0;
  }
  .main-content {
    padding: 1rem;
  }
  .search-box input {
    width: 120px;
  }
}
</style>

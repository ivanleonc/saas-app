<template>
  <div class="layout-container">
    <header class="topbar">
      <div class="topbar-left">
        <button class="mobile-menu-btn" @click="toggleMobileSidebar">
          <IconMenu2 :size="20" stroke-width="1.8" />
        </button>
        <router-link to="/dashboard" class="topbar-logo">
          <IconBolt :size="22" stroke-width="2.5" />
        </router-link>
        <IconChevronRight :size="14" class="topbar-sep" />

        <div class="org-switcher">
          <div class="org-trigger" @click="isOrgDropdownOpen = !isOrgDropdownOpen">
            <IconBuildingCommunity :size="16" stroke-width="1.8" />
            <span class="org-trigger-name">{{ activeOrg?.name || 'Mi Empresa' }}</span>
            <span class="badge-free">FREE</span>
            <IconArrowsUpDown :size="14" stroke-width="1.8" class="org-arrows" />
          </div>

          <div v-if="isOrgDropdownOpen" class="dropdown-overlay" @click="isOrgDropdownOpen = false"></div>
          <div v-if="isOrgDropdownOpen" class="org-dropdown">
            <div class="org-dropdown-search">
              <IconSearch :size="14" />
              <input type="text" placeholder="Find organization..." v-model="orgSearchQuery" autofocus />
            </div>
            <div class="dropdown-divider"></div>
            <div
              v-for="tenant in filteredTenants"
              :key="tenant.id"
              class="dropdown-item"
              :class="{ active: authStore.activeTenantId === tenant.id }"
              @click="handleOrgChange(tenant.id)"
            >
              <span>{{ tenant.name }}</span>
              <IconCheck v-if="authStore.activeTenantId === tenant.id" class="check-icon" :size="14" />
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item create-action" @click="openCreateModal">
              <IconPlus :size="14" />
              <span>New organization</span>
            </div>
          </div>
        </div>

        <!-- Breadcrumbs -->
        <nav class="topbar-breadcrumb" v-if="breadcrumbs.length > 1">
          <IconChevronRight :size="12" class="breadcrumb-sep" />
          <ol>
            <li v-for="(item, index) in breadcrumbs" :key="index">
              <router-link v-if="!item.isLast" :to="item.url" class="breadcrumb-link">{{ item.name }}</router-link>
              <span v-else class="breadcrumb-current">{{ item.name }}</span>
              <IconChevronRight v-if="!item.isLast" class="breadcrumb-sep" :size="10" />
            </li>
          </ol>
        </nav>
      </div>

      <div class="topbar-right">
        <div class="search-box">
          <IconSearch :size="14" />
          <input type="text" placeholder="Search..." />
          <span class="search-shortcut">Ctrl K</span>
        </div>

        <div class="user-menu">
          <button class="user-trigger" @click="isUserDropdownOpen = !isUserDropdownOpen">
            <div class="user-avatar">{{ userInitials }}</div>
          </button>
          <div v-if="isUserDropdownOpen" class="dropdown-overlay" @click="isUserDropdownOpen = false"></div>
          <div v-if="isUserDropdownOpen" class="user-dropdown">
            <div class="user-dropdown-header">
              <span class="user-dropdown-name">{{ authStore.user?.name || 'Usuario' }}</span>
              <span class="user-dropdown-email">{{ authStore.user?.email }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click="router.push('/dashboard/profile'); isUserDropdownOpen = false">
              <IconUserCircle :size="16" />
              <span>Mi Cuenta</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-section-label">Tema</div>
            <div class="theme-options">
              <label class="theme-option" :class="{ active: !isDarkMode }">
                <input type="radio" name="theme" value="light" :checked="!isDarkMode" @change="setTheme(false)" />
                <span>Claro</span>
              </label>
              <label class="theme-option" :class="{ active: isDarkMode }">
                <input type="radio" name="theme" value="dark" :checked="isDarkMode" @change="setTheme(true)" />
                <span>Oscuro</span>
              </label>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item danger" @click="handleLogout">
              <IconLogout :size="16" />
              <span>Cerrar Sesion</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="layout-body">
      <div v-if="isMobileSidebarOpen" class="mobile-backdrop" @click="isMobileSidebarOpen = false"></div>
      <!-- El sidebar usa los eventos de JS para ignorar los parpadeos del DOM -->
      <aside 
        class="sidebar" 
        :class="{ 'is-expanded': isSidebarExpanded, 'mobile-open': isMobileSidebarOpen }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <button class="mobile-close-btn" @click="isMobileSidebarOpen = false">
          <IconX :size="18" stroke-width="1.8" />
        </button>
        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="nav-link" exact-active-class="active">
            <IconLayoutDashboard :size="22" stroke-width="1.8" />
            <span class="nav-label">Projects</span>
          </router-link>
          <router-link to="/dashboard/members" class="nav-link" active-class="active">
            <IconUsers :size="22" stroke-width="1.8" />
            <span class="nav-label">Team</span>
          </router-link>
          <router-link to="/dashboard/roles" class="nav-link" active-class="active" v-permission="'roles:read'">
            <IconShieldLock :size="22" stroke-width="1.8" />
            <span class="nav-label">Roles</span>
          </router-link>
          <router-link to="/dashboard/settings" class="nav-link" active-class="active">
            <IconSettings :size="22" stroke-width="1.8" />
            <span class="nav-label">Settings</span>
          </router-link>
        </nav>

        <div class="sidebar-bottom">
          <button class="nav-link" @click="toggleTheme">
            <IconSun v-if="!isDarkMode" :size="22" stroke-width="1.8" />
            <IconMoon v-else :size="22" stroke-width="1.8" />
            <span class="nav-label">{{ isDarkMode ? 'Light' : 'Dark' }}</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <slot></slot>
      </main>
    </div>

    <UiModal v-model="isCreateModalOpen">
      <form @submit.prevent="handleCreateSubmit">
        <UiCard>
          <template #header>
            <h3 class="card-title">Nueva Organizacion</h3>
            <p class="card-description">Agrega un nuevo espacio de trabajo a tu cuenta.</p>
          </template>
          <div class="form-body">
            <UiAlert v-if="companyStore.error">{{ companyStore.error }}</UiAlert>
            <UiInput v-model="createForm.name" label="Nombre" required />
            <UiInput v-model="createForm.tax_id" label="Tax ID / NIT / RFC (Opcional)" />
          </div>
          <template #footer>
            <div class="modal-footer">
              <UiButton type="button" variant="outline" @click="isCreateModalOpen = false">Cancelar</UiButton>
              <UiButton type="submit" :loading="companyStore.isLoading">Crear</UiButton>
            </div>
          </template>
        </UiCard>
      </form>
    </UiModal>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

// Al declarar esto fuera de "setup", la variable se vuelve persistente en memoria.
// Vue Router puede hacer lo que quiera, pero el sidebar "recordará" si está expandido.
const isSidebarExpanded = ref(false);
let sidebarHoverTimeout: ReturnType<typeof setTimeout> | null = null;
</script>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import { useTheme } from '@/composables/useTheme';
import UiModal from '@/components/ui/UiModal.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import {
  IconBolt,
  IconLayoutDashboard,
  IconUsers,
  IconShieldLock,
  IconSettings,
  IconUserCircle,
  IconLogout,
  IconChevronRight,
  IconCheck,
  IconPlus,
  IconSun,
  IconMoon,
  IconSearch,
  IconBuildingCommunity,
  IconArrowsUpDown,
  IconMenu2,
  IconX,
} from '@tabler/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const companyStore = useCompanyStore();
const { isDarkMode, applyTheme, toggleTheme } = useTheme();

const isOrgDropdownOpen = ref(false);
const isUserDropdownOpen = ref(false);
const isCreateModalOpen = ref(false);
const orgSearchQuery = ref('');
const createForm = reactive({ name: '', tax_id: '' });

const isMobileSidebarOpen = ref(false);

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

// Close mobile sidebar on route change
watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});

// Controladores súper suaves para el Sidebar
const handleMouseEnter = () => {
  if (sidebarHoverTimeout) {
    clearTimeout(sidebarHoverTimeout);
    sidebarHoverTimeout = null;
  }
  isSidebarExpanded.value = true;
};

const handleMouseLeave = () => {
  // Solo se cierra si el mouse está fuera más de 150ms reales
  sidebarHoverTimeout = setTimeout(() => {
    isSidebarExpanded.value = false;
  }, 150);
};

const activeOrg = computed(() =>
  authStore.user?.tenants?.find((t: any) => t.id === authStore.activeTenantId) || null
);

const userInitials = computed(() => {
  const name = authStore.user?.name || 'U';
  return name.substring(0, 2).toUpperCase();
});

const filteredTenants = computed(() => {
  if (!orgSearchQuery.value) return authStore.user?.tenants || [];
  const q = orgSearchQuery.value.toLowerCase();
  return (authStore.user?.tenants || []).filter((t: any) => t.name.toLowerCase().includes(q));
});

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(p => p);
  return paths.map((path, index) => {
    const url = '/' + paths.slice(0, index + 1).join('/');
    let name = path.charAt(0).toUpperCase() + path.slice(1);
    if (name === 'Members') name = 'Team';
    return { name, url, isLast: index === paths.length - 1 };
  });
});

const setTheme = (dark: boolean) => {
  applyTheme(dark);
};

const handleOrgChange = (tenantId: string) => {
  authStore.setActiveTenant(tenantId);
  isOrgDropdownOpen.value = false;
  orgSearchQuery.value = '';
};

const openCreateModal = () => {
  isOrgDropdownOpen.value = false;
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

const handleLogout = async () => {
  isUserDropdownOpen.value = false;
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-app);
}

/* TOPBAR */
.topbar {
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  background-color: var(--bg-navbar);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 30;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.topbar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--primary);
  text-decoration: none;
  transition: opacity 0.15s;
}
.topbar-logo:hover { opacity: 0.8; }

.topbar-sep {
  color: var(--text-light);
}

/* BREADCRUMBS */
.topbar-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.topbar-breadcrumb ol {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-1);
}
.topbar-breadcrumb li {
  display: flex;
  align-items: center;
}
.breadcrumb-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: var(--text-xs);
  transition: color 0.15s;
}
.breadcrumb-link:hover {
  color: var(--text-main);
}
.breadcrumb-current {
  color: var(--text-main);
  font-weight: 500;
  font-size: var(--text-xs);
}
.breadcrumb-sep {
  color: var(--text-light);
  flex-shrink: 0;
}

/* ORG SWITCHER */
.org-switcher {
  position: relative;
}

.org-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.15s;
  border: none;
  background: none;
  color: var(--text-main);
  height: 32px;
}
.org-trigger:hover {
  background-color: var(--bg-hover);
}

.org-trigger-name {
  font-size: var(--text-sm);
  font-weight: 500;
}

.badge-free {
  background: var(--bg-hover);
  color: var(--text-muted);
  border: 1px solid var(--border);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.org-arrows {
  color: var(--text-light);
}

/* ORG DROPDOWN */
.org-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  z-index: 100;
  box-shadow: var(--shadow-lg);
  min-width: 240px;
}

.org-dropdown-search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius);
  color: var(--text-light);
}
.org-dropdown-search input {
  border: none;
  background: none;
  outline: none;
  font-size: var(--text-sm);
  color: var(--text-main);
  width: 100%;
}
.org-dropdown-search input::placeholder { color: var(--text-placeholder); }

/* SEARCH BOX */
.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background-color: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-light);
  transition: all 0.15s;
  height: 32px;
}
.search-box:focus-within {
  border-color: var(--text-light);
  background-color: var(--bg-elevated);
}
.search-box input {
  border: none;
  background: none;
  outline: none;
  font-size: var(--text-sm);
  color: var(--text-main);
  width: 140px;
}
.search-box input::placeholder { color: var(--text-placeholder); }
.search-shortcut {
  font-size: 0.625rem;
  color: var(--text-light);
  border: 1px solid var(--border);
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* DROPDOWN OVERLAY */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

/* DROPDOWN ITEMS */
.dropdown-divider {
  height: 1px;
  background-color: var(--border);
  margin: var(--space-1) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  font-size: var(--text-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.dropdown-item:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}
.dropdown-item.active {
  color: var(--text-main);
  background-color: var(--bg-hover);
}
.dropdown-item.danger {
  color: var(--color-danger);
}
.dropdown-item.danger:hover {
  background-color: var(--color-danger-bg);
}
.dropdown-item.create-action {
  color: var(--primary);
}
.dropdown-item.create-action:hover {
  background-color: var(--primary-active);
}

.check-icon {
  margin-left: auto;
  color: var(--primary);
}

.dropdown-section-label {
  font-size: var(--text-xs);
  color: var(--text-light);
  padding: var(--space-2) var(--space-3);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* USER MENU */
.user-menu {
  position: relative;
}

.user-trigger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  transition: border-color 0.15s;
}
.user-avatar:hover {
  border-color: var(--text-light);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  z-index: 100;
  box-shadow: var(--shadow-lg);
  min-width: 240px;
}

.user-dropdown-header {
  padding: var(--space-2) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-dropdown-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-main);
}

.user-dropdown-email {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* THEME OPTIONS */
.theme-options {
  display: flex;
  gap: var(--space-1);
  padding: 0 var(--space-3) var(--space-2);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius);
  font-size: var(--text-xs);
  color: var(--text-muted);
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.15s;
}
.theme-option:hover {
  border-color: var(--text-light);
}
.theme-option.active {
  background-color: var(--primary-active);
  border-color: var(--primary);
  color: var(--text-main);
}
.theme-option input {
  display: none;
}

/* LAYOUT BODY */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* SIDEBAR - fixed position */
.sidebar {
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  width: var(--sidebar-collapsed);
  height: calc(100vh - var(--topbar-height));
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease;
  overflow: hidden;
  z-index: 20;
}

/* Estilos de expansión ahora controlados 100% por Vue */
.sidebar.is-expanded {
  width: var(--sidebar-width);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
}

.sidebar.is-expanded .nav-label {
  opacity: 1;
  width: auto;
  margin-left: 0;
  transition: opacity 0.18s ease 0.06s;
}

.sidebar.is-expanded .nav-link {
  justify-content: flex-start;
  padding: var(--space-2) var(--space-3);
  gap: var(--space-3);
}

.sidebar .nav-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
  margin-left: -8px;
  transition: opacity 0.1s ease, width 0s ease 0.15s, margin 0s ease 0.15s;
}

.sidebar.is-expanded .sidebar-bottom .nav-label {
  transition: opacity 0.18s ease 0.1s;
}

/* SIDEBAR NAV */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-2) 6px;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: 10px 0;
  border-radius: var(--radius);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--text-muted);
  transition: all 0.15s;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  white-space: nowrap;
  min-height: 30px;
}
.nav-link:hover {
  color: var(--text-main);
  background-color: var(--bg-hover);
}
.nav-link.active {
  color: var(--text-main);
  background-color: var(--bg-active);
  font-weight: 500;
}

.sidebar-bottom {
  padding: 6px;
  border-top: 1px solid var(--border);
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-6) var(--space-8);
  background-color: var(--bg-app);
  margin-left: var(--sidebar-collapsed);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

/* MOBILE BUTTONS */
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-main);
  cursor: pointer;
  border-radius: var(--radius);
  transition: background-color 0.15s;
}
.mobile-menu-btn:hover {
  background-color: var(--bg-hover);
}

.mobile-close-btn {
  display: none;
}

.mobile-backdrop {
  display: none;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  .sidebar .mobile-close-btn {
    display: flex;
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: var(--bg-hover);
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius);
    z-index: 5;
  }
  .sidebar {
    width: var(--sidebar-width);
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
  }
  .sidebar.is-expanded {
    width: var(--sidebar-width);
  }
  .sidebar.is-expanded .nav-label {
    opacity: 1;
    width: auto;
    margin-left: 0;
  }
  .sidebar .nav-label {
    opacity: 0;
    width: 0;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  }
  .sidebar.mobile-open .nav-label {
    opacity: 1;
    width: auto;
    margin-left: 0;
  }
  .sidebar.mobile-open .nav-link {
    justify-content: flex-start;
    padding: var(--space-2) var(--space-3);
    gap: var(--space-3);
  }
  .mobile-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 19;
  }
  .main-content {
    margin-left: 0;
    padding: var(--space-4);
  }
  .search-box {
    display: none;
  }
  .topbar-breadcrumb {
    display: none;
  }
}

@media (max-width: 480px) {
  .topbar {
    padding: 0 var(--space-3);
  }
  .main-content {
    padding: var(--space-3);
  }
}
</style>
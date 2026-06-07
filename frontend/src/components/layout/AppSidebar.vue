<template>
  <header class="topbar">
    <div class="topbar-left">
      <div class="brand-container">
        <!-- Brand Logo and Tenant dropdown -->
        <div class="tenant-dropdown-container">
          <div v-if="isCompanyDropdownOpen" class="dropdown-overlay" @click="isCompanyDropdownOpen = false"></div>
          
          <div class="brand-trigger" @click="isCompanyDropdownOpen = !isCompanyDropdownOpen">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="brand-icon"><path d="M7 21V7a2 2 0 012-2h6a2 2 0 012 2v14"/><path d="M9 21h6"/></svg>
            <span class="brand-text">ILC</span>
            <span class="tenant-slash">/</span>
            <span class="active-tenant-name">{{ activeCompany?.name || 'Mi Empresa' }}</span>
            <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div v-if="isCompanyDropdownOpen" class="tenant-dropdown-menu company-menu">
            <div class="dropdown-label">Empresas</div>
            
            <div 
              v-for="tenant in authStore.user?.tenants" 
              :key="tenant.id"
              class="dropdown-item"
              :class="{ active: authStore.activeTenantId === tenant.id }"
              @click="handleTenantChange(tenant.id)"
            >
              <div class="tenant-logo-small">{{ tenant.name.substring(0,2).toUpperCase() }}</div>
              <span class="dropdown-tenant-name">{{ tenant.name }}</span>
              <svg v-if="authStore.activeTenantId === tenant.id" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>

            <div class="dropdown-divider"></div>
            <div class="dropdown-item create-action" @click="openCreateModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span class="dropdown-tenant-name">Crear nueva empresa</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="header-divider"></div>
      
      <nav class="nav-menu" :class="{ 'menu-open': isMobileMenuOpen }">
        <router-link to="/dashboard" class="nav-item" exact-active-class="active" @click="isMobileMenuOpen = false">
          <span>Dashboard</span>
        </router-link>

        <router-link to="/dashboard/members" class="nav-item" active-class="active" @click="isMobileMenuOpen = false">
          <span>Miembros</span>
        </router-link>

        <router-link to="/dashboard/roles" class="nav-item" active-class="active" v-permission="'roles:read'" @click="isMobileMenuOpen = false">
          <span>Roles</span>
        </router-link>

        <router-link to="/dashboard/settings" class="nav-item" active-class="active" @click="isMobileMenuOpen = false">
          <span>Configuración</span>
        </router-link>
      </nav>
    </div>

    <div class="topbar-right">
      <div class="action-icons">
        <svg class="action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <svg class="action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <!-- Mobile Menu Toggle -->
        <svg class="mobile-menu-btn action-icon" @click="isMobileMenuOpen = !isMobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </div>

      <div class="tenant-dropdown-container user-dropdown">
        <div v-if="isUserDropdownOpen" class="dropdown-overlay" @click="isUserDropdownOpen = false"></div>
        <div class="user-profile" @click="isUserDropdownOpen = !isUserDropdownOpen">
          <div class="avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.name || 'Usuario' }}</span>
            <span class="user-email">{{ authStore.user?.email || 'user@example.com' }}</span>
          </div>
          <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>

        <div v-if="isUserDropdownOpen" class="tenant-dropdown-menu">
          <div class="dropdown-label">Mi Cuenta</div>
          <div class="dropdown-item" @click="router.push('/dashboard/profile'); isUserDropdownOpen = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span class="dropdown-tenant-name">Ir al Perfil</span>
          </div>
          
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" style="color: #ef4444;" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span class="dropdown-tenant-name">Cerrar Sesión</span>
          </div>
        </div>
      </div>
    </div>

    <UiModal v-model="isCreateModalOpen">
      <form @submit.prevent="handleCreateSubmit">
        <UiCard>
          <template #header>
            <h3 class="card-title" style="margin:0; font-size: 1.125rem;">Crear Nueva Empresa</h3>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--text-muted);">Agrega un nuevo espacio de trabajo a tu cuenta.</p>
          </template>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <UiAlert v-if="companyStore.error">{{ companyStore.error }}</UiAlert>
            <UiInput v-model="createForm.name" label="Nombre de la Empresa" required />
            <UiInput v-model="createForm.tax_id" label="Tax ID / NIT / RFC (Opcional)" />
          </div>

          <template #footer>
            <div style="display: flex; gap: 0.5rem; width: 100%;">
              <UiButton type="button" variant="outline" @click="isCreateModalOpen = false">
                Cancelar
              </UiButton>
              <UiButton type="submit" :loading="companyStore.isLoading">
                Crear y Entrar
              </UiButton>
            </div>
          </template>
        </UiCard>
      </form>
    </UiModal>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useMemberStore } from '@/stores/member.store';
import { useCompanyStore } from '@/stores/company.store';

// Importamos componentes para el Modal
import UiModal from '@/components/ui/UiModal.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const authStore = useAuthStore();
const memberStore = useMemberStore();
const companyStore = useCompanyStore();
const router = useRouter();

const isCompanyDropdownOpen = ref(false);
const isUserDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);

// --- ESTADOS DEL MODAL DE CREAR EMPRESA ---
const isCreateModalOpen = ref(false);
const createForm = reactive({ name: '', tax_id: '' });

const openCreateModal = () => {
  isCompanyDropdownOpen.value = false; // Cerramos el dropdown al abrir el modal
  createForm.name = '';
  createForm.tax_id = '';
  companyStore.error = null;
  isCreateModalOpen.value = true;
};

const handleCreateSubmit = async () => {
  try {
    await companyStore.createCompany({
      name: createForm.name,
      tax_id: createForm.tax_id
    });
    
    isCreateModalOpen.value = false;
    
    router.push('/dashboard'); 
  } catch (error) {
    console.error('Error al crear la empresa', error);
  }
};

const activeCompany = computed(() => {
  return authStore.user?.tenants?.find((t: any) => t.id === authStore.activeTenantId) || null;
});

const userInitials = computed(() => {
  const name = authStore.user?.name || 'U';
  return name.substring(0, 2).toUpperCase();
});

const handleTenantChange = async (tenantId: number) => {
  authStore.setActiveTenant(tenantId);
  isCompanyDropdownOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.topbar { 
  width: 100%; 
  height: 72px; 
  background-color: var(--bg-nav); 
  border-bottom: 1px solid var(--border); 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 0 1.5rem;
  position: relative;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand-container {
  display: flex;
  align-items: center;
}

.brand-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.brand-trigger:hover {
  background-color: var(--nav-icon-bg-hover);
}

.brand-icon {
  color: var(--primary);
  fill: var(--primary);
}

.brand-text {
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--primary);
  letter-spacing: -0.5px;
}

.tenant-slash {
  color: var(--text-light);
  font-weight: 300;
  font-size: 1.25rem;
  margin: 0 0.25rem;
}

.active-tenant-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-main);
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-menu {
  top: calc(100% + 0.25rem);
  left: 0;
  right: auto;
}

.header-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border);
}

.nav-menu { 
  display: flex; 
  align-items: center;
  gap: 0.5rem; 
}

.nav-item { 
  display: flex; 
  align-items: center; 
  padding: 0.5rem 1rem; 
  border-radius: 9999px; /* Pill shape */
  color: var(--text-muted); 
  text-decoration: none; 
  font-size: 0.875rem; 
  font-weight: 500;
  cursor: pointer; 
  transition: all 0.2s; 
}
.nav-item:hover { color: var(--primary); }
.nav-item.active { background-color: var(--nav-icon-active); color: var(--nav-icon-active-text); } /* Dark pill like mockup */

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-icon {
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}
.action-icon:hover {
  color: var(--primary);
}

.mobile-menu-btn {
  display: none;
}

.tenant-dropdown-container { position: relative; }
.dropdown-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 40; cursor: default; }

.user-profile { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  padding: 0.25rem 0.5rem; 
  border-radius: 9999px; 
  border: 1px solid var(--border);
  cursor: pointer; 
  transition: background-color 0.2s; 
  z-index: 51;
  position: relative;
}
.user-profile:hover { background-color: var(--nav-icon-bg-hover); }
.avatar { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #a855f7; color: white; border-radius: 50%; font-size: 0.75rem; font-weight: 600; }
.user-info { display: flex; flex-direction: column; max-width: 120px; }
.user-name { font-size: 0.875rem; font-weight: 600; color: var(--primary); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; line-height: 1.2;}
.user-email { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.chevron-icon { color: var(--text-muted); }

.tenant-dropdown-menu {
  position: absolute; top: calc(100% + 0.5rem); right: 0; width: 220px;
  background-color: var(--bg-card); border: 1px solid var(--border);
  border-radius: 0.5rem; padding: 0.5rem; z-index: 50;
  box-shadow: var(--glass-shadow);
}
.dropdown-label { font-size: 0.75rem; color: var(--text-light); padding: 0.25rem 0.5rem; margin-bottom: 0.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.dropdown-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer; color: var(--text-main); font-size: 0.875rem; transition: background-color 0.2s; }
.dropdown-item:hover, .dropdown-item.active { background-color: var(--nav-icon-bg-hover); }
.tenant-logo-small { width: 20px; height: 20px; background-color: #3b82f6; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; color: white; }
.dropdown-tenant-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.check-icon { color: #10b981; }

.dropdown-divider { height: 1px; background-color: var(--border); margin: 0.5rem 0; }
.create-action { color: #3b82f6; font-weight: 500; }
.create-action:hover { background-color: var(--nav-icon-bg-hover); color: #3b82f6; }

/* Responsive adjustments */
@media (max-width: 1024px) {
  .header-divider, .user-info { display: none; }
  .topbar-left { gap: 1rem; }
  .nav-menu { gap: 0.25rem; }
}

@media (max-width: 768px) {
  .nav-menu {
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    background-color: var(--bg-nav);
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    z-index: 45;
    transform: translateY(-10px);
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s ease;
  }
  
  .nav-menu.menu-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .nav-item {
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .mobile-menu-btn {
    display: block;
  }
  
  .active-tenant-name {
    display: none;
  }
  
  .tenant-slash {
    display: none;
  }
}
</style>
<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="tenant-dropdown-container">
        <div v-if="isDropdownOpen" class="dropdown-overlay" @click="isDropdownOpen = false"></div>

        <div class="tenant-selector" @click="isDropdownOpen = !isDropdownOpen">
          <div class="tenant-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </div>
          <div class="tenant-info">
            <span class="tenant-name">{{ activeCompany?.name || 'Mi Empresa' }}</span>
            <span class="tenant-plan">{{ activeCompany?.role || 'Admin' }}</span>
          </div>
          <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 9 12 5 16 9"></polyline><polyline points="16 15 12 19 8 15"></polyline></svg>
        </div>

        <div v-if="isDropdownOpen" class="tenant-dropdown-menu">
          <div class="dropdown-label">Cambiar Empresa</div>
          
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

    <div class="sidebar-content">
      <span class="nav-group-title">Plataforma</span>
      <nav class="nav-menu">
        
        <router-link to="/dashboard" class="nav-item" exact-active-class="active">
          <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/dashboard/members" class="nav-item" active-class="active">
          <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Miembros del Equipo</span>
        </router-link>

        <router-link to="/dashboard/roles" class="nav-item" active-class="active" v-permission="'roles:read'">
          <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M4 21v-2a4 4 0 0 1 3-3.87"></path><path d="M8 3.13a4 4 0 0 0 0 7.75"></path></svg>
          <span>Roles y Permisos</span>
        </router-link>

        <router-link to="/dashboard/settings" class="nav-item" active-class="active">
          <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Configuración</span>
        </router-link>

      </nav>
    </div>

    <div class="sidebar-footer">
<div class="user-profile" @click="router.push('/dashboard/profile')">
  <div class="avatar">{{ userInitials }}</div>
  <div class="user-info">
    <span class="user-name">{{ authStore.user?.name || 'Usuario' }}</span>
    <span class="user-email">{{ authStore.user?.email || 'correo@ejemplo.com' }}</span>
  </div>
  <svg class="logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" @click.stop="handleLogout"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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
              <UiButton type="button" style="background-color: white; color: var(--text-main); border: 1px solid var(--border);" @click="isCreateModalOpen = false">
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

  </aside>
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

const isDropdownOpen = ref(false);

// --- ESTADOS DEL MODAL DE CREAR EMPRESA ---
const isCreateModalOpen = ref(false);
const createForm = reactive({ name: '', tax_id: '' });

const openCreateModal = () => {
  isDropdownOpen.value = false; // Cerramos el dropdown al abrir el modal
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
    
    // Si estábamos en miembros o configuración, forzamos la ida al dashboard base
    // para evitar que se renderice data de la empresa anterior
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
  isDropdownOpen.value = false;
  
  // if (router.currentRoute.value.path.includes('/members')) {
  //   await memberStore.fetchMembers();
  // }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* Pegar aquí tus estilos existentes de la Sidebar (los mismos que me enviaste antes) */
.sidebar { width: 260px; background-color: var(--sidebar-bg); color: var(--sidebar-text); border-right: 1px solid var(--sidebar-border); display: flex; flex-direction: column; }
.sidebar-header { padding: 1rem; }
.tenant-selector { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer; transition: background-color 0.2s; position: relative; z-index: 51; }
.tenant-selector:hover { background-color: var(--sidebar-hover); }
.tenant-logo { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #2563eb; border-radius: 0.375rem; color: white; }
.tenant-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.tenant-name { font-size: 0.875rem; font-weight: 500; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.tenant-plan { font-size: 0.75rem; color: var(--sidebar-muted); }
.chevron-icon { color: var(--sidebar-muted); }

.tenant-dropdown-container { position: relative; }
.dropdown-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 40; cursor: default; }
.tenant-dropdown-menu {
  position: absolute; top: 100%; left: 0; width: 100%; margin-top: 0.5rem;
  background-color: var(--sidebar-bg); border: 1px solid var(--sidebar-border);
  border-radius: 0.375rem; padding: 0.5rem; z-index: 50;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.25);
}
.dropdown-label { font-size: 0.75rem; color: var(--sidebar-muted); padding: 0.25rem 0.5rem; margin-bottom: 0.25rem; font-weight: 500; }
.dropdown-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 0.25rem; cursor: pointer; color: var(--sidebar-text); transition: background-color 0.2s; }
.dropdown-item:hover, .dropdown-item.active { background-color: var(--sidebar-hover); }
.tenant-logo-small { width: 20px; height: 20px; background-color: #2563eb; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; color: white; }
.dropdown-tenant-name { font-size: 0.875rem; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.check-icon { color: var(--sidebar-text); }

/* NUEVOS ESTILOS PARA LA OPCIÓN CREAR EMPRESA */
.dropdown-divider { height: 1px; background-color: var(--sidebar-border); margin: 0.5rem 0; }
.create-action { color: #2563eb; font-weight: 500; }
.create-action:hover { background-color: #eff6ff; color: #1d4ed8; }

.sidebar-content { flex: 1; padding: 0 1rem; overflow-y: auto; }
.nav-group-title { display: block; font-size: 0.75rem; font-weight: 500; color: var(--sidebar-muted); padding: 1rem 0.5rem 0.5rem; }
.nav-menu { display: flex; flex-direction: column; gap: 0.25rem; }

.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.375rem; color: var(--sidebar-text); text-decoration: none; font-size: 0.875rem; cursor: pointer; transition: background-color 0.2s; }
.nav-item:hover { background-color: var(--sidebar-hover); }
.nav-item.active { background-color: var(--sidebar-hover); color: white; font-weight: 500; }
.nav-icon { color: var(--sidebar-muted); transition: color 0.2s; }
.nav-item.active .nav-icon { color: white; }

.sidebar-footer { padding: 1rem; border-top: 1px solid var(--sidebar-border); }
.user-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer; transition: background-color 0.2s; }
.user-profile:hover { background-color: var(--sidebar-hover); }
.avatar { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: var(--sidebar-hover); border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; }
.user-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.user-name { font-size: 0.875rem; font-weight: 500; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.user-email { font-size: 0.75rem; color: var(--sidebar-muted); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.logout-icon { color: var(--sidebar-muted); }
</style>
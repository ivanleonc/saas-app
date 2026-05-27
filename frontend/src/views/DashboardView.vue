<template>
  <AuthenticatedLayout>
    <div class="dashboard-content">
      <h1 class="page-title">Resumen del Espacio de Trabajo</h1>
      <p class="page-subtitle">Bienvenido de nuevo, {{ authStore.user?.name }}. Aquí tienes el estado actual de tu empresa.</p>
      
      <div v-if="isLoading" style="margin-top: 2rem; color: var(--text-muted);">
        Cargando métricas...
      </div>

      <div v-else class="metrics-grid">
        
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Miembros Activos</span>
            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="metric-value">{{ activeMembers }}</div>
          <div class="metric-trend">
            <span class="trend-positive">De un total de {{ totalMembers }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Roles de Acceso</span>
            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div class="metric-value">{{ totalRoles }}</div>
          <div class="metric-trend">
            <span class="trend-neutral">Niveles de permisos creados</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Empresa Actual</span>
            <svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
          </div>
          <div class="metric-value text-ellipsis">{{ activeCompanyName }}</div>
          <div class="metric-trend">
            <span class="trend-neutral">Plan: {{ activeCompanyRole }}</span>
          </div>
        </div>

      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useMemberStore } from '@/stores/member.store';
import { roleService } from '@/services/role.service';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';

const authStore = useAuthStore();
const memberStore = useMemberStore();

const isLoading = ref(true);
const totalRoles = ref(0);

onMounted(async () => {
  if (authStore.activeTenantId) {
    try {
      // Hacemos peticiones simultáneas para cargar las métricas rápido
      await Promise.all([
        memberStore.fetchMembers(),
        roleService.getRoles(authStore.activeTenantId).then(r => totalRoles.value = r.length)
      ]);
    } catch (error) {
      console.error('Error cargando métricas del dashboard', error);
    } finally {
      isLoading.value = false;
    }
  }
});

// Computed Properties para procesar la data
const totalMembers = computed(() => memberStore.members.length);
const activeMembers = computed(() => memberStore.members.filter(m => m.status === 'active').length);

const activeCompany = computed(() => {
  return authStore.user?.tenants?.find((t: any) => t.id === authStore.activeTenantId);
});
const activeCompanyName = computed(() => activeCompany.value?.name || '---');
const activeCompanyRole = computed(() => {
  if (activeCompany.value?.roles?.includes('Owner')) return 'Administrador Principal';
  return 'Miembro del Equipo';
});
</script>

<style scoped>
.dashboard-content { display: flex; flex-direction: column; gap: 2rem; }
.page-title { margin: 0; font-size: 1.875rem; font-weight: 600; letter-spacing: -0.025em; color: var(--text-main); }
.page-subtitle { margin: 0.5rem 0 0; color: var(--text-muted); }

/* GRID DE TARJETAS */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.metric-header { display: flex; justify-content: space-between; align-items: center; }
.metric-title { font-size: 0.875rem; font-weight: 500; color: var(--text-main); }
.metric-icon { width: 16px; height: 16px; color: var(--text-muted); }

.metric-value { font-size: 2rem; font-weight: 700; color: var(--text-main); line-height: 1; }
.text-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.5rem; }

.metric-trend { font-size: 0.75rem; }
.trend-positive { color: #16a34a; font-weight: 500; }
.trend-neutral { color: var(--text-muted); }
</style>
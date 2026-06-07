<template>
  <AuthenticatedLayout>
    <div class="dashboard-content">
      <h1 class="page-title">Resumen del Espacio de Trabajo</h1>
      <p class="page-subtitle">Bienvenido de nuevo, {{ authStore.user?.name }}. Aquí tienes el estado actual de tu empresa.</p>
      
      <div v-if="isLoading" style="margin-top: 2rem; color: var(--text-muted);">
        Cargando métricas...
      </div>

      <div v-else class="metrics-grid">
        <DashboardMetricCard 
          title="Miembros Activos" 
          :value="activeMembers"
          :trendText="`De un total de ${totalMembers}`"
          trendType="positive"
        >
          <template #icon>
            <IconUsers class="metric-icon" :size="24" stroke-width="2" />
          </template>
        </DashboardMetricCard>

        <DashboardMetricCard 
          title="Roles de Acceso" 
          :value="totalRoles"
          trendText="Niveles de permisos creados"
          trendType="neutral"
        >
          <template #icon>
            <IconShieldLock class="metric-icon" :size="24" stroke-width="2" />
          </template>
        </DashboardMetricCard>

        <DashboardMetricCard 
          title="Empresa Actual" 
          :value="activeCompanyName"
          :trendText="`Plan: ${activeCompanyRole}`"
          trendType="neutral"
          isText
        >
          <template #icon>
            <IconBuildingStore class="metric-icon" :size="24" stroke-width="2" />
          </template>
        </DashboardMetricCard>
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
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard.vue';
import { IconUsers, IconShieldLock, IconBuildingStore } from '@tabler/icons-vue';

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
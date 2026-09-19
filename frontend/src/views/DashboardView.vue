<template>
  <AuthenticatedLayout>
    <div class="dashboard-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Bienvenido de nuevo, {{ authStore.user?.name }}. Aquí tienes el resumen de tu workspace.</p>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Cargando métricas...</span>
      </div>

      <template v-else>
        <div class="metrics-grid">
          <DashboardMetricCard 
            title="Miembros Activos" 
            :value="activeMembers"
            :trendText="`De un total de ${totalMembers}`"
            trendType="positive"
            color="blue"
          >
            <template #icon>
              <IconUsers :size="20" stroke-width="2" />
            </template>
          </DashboardMetricCard>

          <DashboardMetricCard 
            title="Roles de Acceso" 
            :value="totalRoles"
            trendText="Niveles de permisos"
            color="purple"
          >
            <template #icon>
              <IconShieldLock :size="20" stroke-width="2" />
            </template>
          </DashboardMetricCard>

          <DashboardMetricCard 
            title="Empresa Actual" 
            :value="activeCompanyName"
            :trendText="activeCompanyRole"
            color="green"
            isText
          >
            <template #icon>
              <IconBuildingStore :size="20" stroke-width="2" />
            </template>
          </DashboardMetricCard>

          <DashboardMetricCard 
            title="Estado" 
            :value="authStore.user?.email_verified ? 'Verificada' : 'Pendiente'"
            trendText="Cuenta de email"
            :color="authStore.user?.email_verified ? 'green' : 'orange'"
            isText
          >
            <template #icon>
              <IconMail :size="20" stroke-width="2" />
            </template>
          </DashboardMetricCard>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3 class="section-title">Accesos Rápidos</h3>
          <div class="actions-grid">
            <router-link to="/dashboard/members" class="action-card">
              <IconUsers :size="20" />
              <span>Gestionar Miembros</span>
            </router-link>
            <router-link to="/dashboard/roles" class="action-card" v-permission="'roles:read'">
              <IconShieldLock :size="20" />
              <span>Configurar Roles</span>
            </router-link>
            <router-link to="/dashboard/settings" class="action-card">
              <IconSettings :size="20" />
              <span>Ajustes Empresa</span>
            </router-link>
            <router-link to="/dashboard/profile" class="action-card">
              <IconUserCircle :size="20" />
              <span>Mi Perfil</span>
            </router-link>
          </div>
        </div>
      </template>
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
import {
  IconUsers,
  IconShieldLock,
  IconBuildingStore,
  IconMail,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-vue';

const authStore = useAuthStore();
const memberStore = useMemberStore();

const isLoading = ref(true);
const totalRoles = ref(0);

onMounted(async () => {
  if (authStore.activeTenantId) {
    try {
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

const totalMembers = computed(() => memberStore.members.length);
const activeMembers = computed(() => memberStore.members.filter(m => m.status === 'active').length);

const activeCompany = computed(() =>
  authStore.user?.tenants?.find((t: any) => t.id === authStore.activeTenantId)
);
const activeCompanyName = computed(() => activeCompany.value?.name || '---');
const activeCompanyRole = computed(() => {
  if (activeCompany.value?.roles?.includes('Owner')) return 'Administrador Principal';
  return 'Miembro del Equipo';
});
</script>

<style scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-main);
}

.page-subtitle {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 3rem 0;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--text-main);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 0.75rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.15s;
}
.action-card:hover {
  border-color: var(--text-light);
  color: var(--text-main);
  background-color: var(--bg-hover);
}
</style>

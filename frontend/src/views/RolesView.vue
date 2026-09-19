<template>
  <AuthenticatedLayout>
    <div class="roles-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Roles y Permisos</h1>
          <p class="page-subtitle">Consulta y crea niveles de acceso para tu organización.</p>
        </div>
        <UiButton @click="openCreateModal" width="auto">
          Crear Nuevo Rol
        </UiButton>
      </div>

      <div v-if="isLoading" class="loading-state">Cargando roles...</div>
      
      <div v-else class="roles-grid">
        <UiCard v-for="role in roles" :key="role.id" hoverable>
          <template #header>
            <div class="role-header">
              <h3 class="card-title">{{ role.name }}</h3>
              <span v-if="role.is_system" class="badge badge-info">Rol del Sistema</span>
              <span v-else class="badge badge-neutral">Personalizado</span>
            </div>
            <p class="card-description">{{ role.description || 'Sin descripción detallada.' }}</p>
          </template>

          <div class="form-body">
            <h4 class="permissions-title">Permisos Asignados</h4>
            <div class="permissions-list">
              <span v-for="perm in role.permissions" :key="perm.id" class="permission-badge">
                {{ perm.code }}
              </span>
              <span v-if="role.permissions.length === 0" class="text-muted">Ningún permiso asignado.</span>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <UiModal v-model="isModalOpen">
      <form @submit.prevent="handleCreateSubmit">
        <UiCard>
          <template #header>
            <h3 class="card-title">Crear Rol Personalizado</h3>
          </template>
          
          <div class="form-body">
            <UiInput v-model="form.name" label="Nombre del Rol" placeholder="Ej: Gestor de Finanzas" required />
            <UiInput v-model="form.description" label="Descripción (Opcional)" placeholder="¿Qué hace este rol?" />
            
            <div>
              <label class="permissions-title">Selecciona los Permisos</label>
              <div class="checkbox-grid">
                <label v-for="perm in allPermissions" :key="perm.id">
                  <input type="checkbox" :value="perm.id" v-model="form.permissionIds" />
                  {{ perm.code }}
                </label>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="modal-footer">
              <UiButton type="button" variant="outline" @click="isModalOpen = false">Cancelar</UiButton>
              <UiButton type="submit" :loading="isSaving">Guardar Rol</UiButton>
            </div>
          </template>
        </UiCard>
      </form>
    </UiModal>

  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { roleService, type Role, type Permission } from '@/services/role.service';
import { useAuthStore } from '@/stores/auth.store';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiModal from '@/components/ui/UiModal.vue';
import UiInput from '@/components/ui/UiInput.vue';

const authStore = useAuthStore();
const roles = ref<Role[]>([]);
const allPermissions = ref<Permission[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);

const isModalOpen = ref(false);
const form = reactive({ name: '', description: '', permissionIds: [] as number[] });

const fetchData = async () => {
  if (!authStore.activeTenantId) return;
  try {
    const [rolesData, permsData] = await Promise.all([
      roleService.getRoles(authStore.activeTenantId),
      roleService.getAllPermissions()
    ]);
    roles.value = rolesData;
    allPermissions.value = permsData;
  } catch (error) {
    console.error('Error cargando datos', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const openCreateModal = () => {
  form.name = ''; form.description = ''; form.permissionIds = [];
  isModalOpen.value = true;
};

const handleCreateSubmit = async () => {
  if (!authStore.activeTenantId) return;
  isSaving.value = true;
  try {
    await roleService.createRole(authStore.activeTenantId, {
      name: form.name,
      description: form.description,
      permissionIds: form.permissionIds
    });
    isModalOpen.value = false;
    await fetchData();
  } catch (error) {
    console.error('Error creando rol', error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.roles-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.role-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2); }

.permissions-title { font-size: var(--text-base); font-weight: 600; margin: 0 0 var(--space-3); color: var(--text-main); }
.permissions-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.permission-badge {
  background: var(--bg-app);
  border: 1px solid var(--border);
  color: var(--text-main);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.loading-state {
  color: var(--text-muted);
  font-size: var(--text-base);
  padding: var(--space-8) 0;
}

.modal-footer { display: flex; gap: var(--space-2); width: 100%; }
</style>

<template>
  <AuthenticatedLayout>
    <div class="roles-container">
<div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 class="page-title">Roles y Permisos</h1>
          <p class="page-subtitle">Consulta y crea niveles de acceso para tu organización.</p>
        </div>
        
        <div style="flex-shrink: 0;">
          <UiButton @click="openCreateModal" style="width: auto; padding: 0 1.5rem;">
            Crear Nuevo Rol
          </UiButton>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">Cargando roles...</div>
      
      <div v-else class="roles-grid">
        <UiCard v-for="role in roles" :key="role.id" class="role-card">
          <template #header>
            <div class="role-header">
              <h3 class="card-title">{{ role.name }}</h3>
              <span v-if="role.is_system" class="system-badge">Rol del Sistema</span>
              <span v-else class="custom-badge">Personalizado</span>
            </div>
            <p class="card-description">{{ role.description || 'Sin descripción detallada.' }}</p>
          </template>

          <div class="form-body">
            <h4 class="permissions-title">Permisos Asignados</h4>
            <div class="permissions-list">
              <span v-for="perm in role.permissions" :key="perm.id" class="permission-badge">
                {{ perm.name }}
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
            
            <div style="margin-top: 1rem;">
              <label class="permissions-title">Selecciona los Permisos</label>
              <div class="checkbox-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                <label v-for="perm in allPermissions" :key="perm.id" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                  <input type="checkbox" :value="perm.id" v-model="form.permissionIds" />
                  {{ perm.name }}
                </label>
              </div>
            </div>
          </div>

          <template #footer>
            <div style="display: flex; gap: 0.5rem; width: 100%;">
              <UiButton type="button" style="background-color: white; color: black; border: 1px solid #ccc;" @click="isModalOpen = false">Cancelar</UiButton>
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
    await fetchData(); // Refrescamos la tabla
  } catch (error) {
    console.error('Error creando rol', error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.roles-container { display: flex; flex-direction: column; gap: 2rem; }
.page-title { margin: 0; font-size: 1.875rem; font-weight: 600; color: var(--text-main); }
.page-subtitle { margin: 0.5rem 0 0; color: var(--text-muted); }

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.role-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-main); }
.card-description { font-size: 0.875rem; color: var(--text-muted); margin: 0.5rem 0 0; }

.system-badge {
  font-size: 0.7rem; background: #e0e7ff; color: #3730a3; padding: 0.2rem 0.5rem;
  border-radius: 9999px; font-weight: 600;
}

.permissions-title { font-size: 0.875rem; font-weight: 600; margin: 0 0 0.75rem; color: var(--text-main); }
.permissions-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.permission-badge {
  background: var(--bg-app); border: 1px solid var(--border); color: var(--text-main);
  font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem;
}
.text-muted { font-size: 0.875rem; color: var(--text-muted); font-style: italic; }
.custom-badge { font-size: 0.7rem; background: #f3f4f6; color: #374151; padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 600; }
</style>
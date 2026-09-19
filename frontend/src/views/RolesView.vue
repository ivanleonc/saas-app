<template>
  <AuthenticatedLayout>
    <div class="roles-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Roles y Permisos</h1>
          <p class="page-subtitle">Consulta y crea niveles de acceso para tu organizacion.</p>
        </div>
        <UiButton @click="openCreateModal" width="auto">
          Crear Nuevo Rol
        </UiButton>
      </div>

      <div v-if="isLoading" class="loading-state">Cargando roles...</div>
      
      <div v-else class="roles-grid">
        <UiCard v-for="role in roles" :key="role.id" class="role-card">
          <div class="role-card-header">
            <div class="role-title-row">
              <div class="role-icon" :class="role.is_system ? 'system' : 'custom'">
                <IconShield v-if="role.is_system" :size="20" />
                <IconUserCog v-else :size="20" />
              </div>
              <div class="role-title-text">
                <h3 class="role-name">{{ role.name }}</h3>
                <span class="role-badge" :class="role.is_system ? 'system' : 'custom'">
                  {{ role.is_system ? 'Sistema' : 'Personalizado' }}
                </span>
              </div>
            </div>
            <div class="role-actions" v-if="!role.is_system">
              <button class="role-menu-btn" :ref="el => setMenuBtnRef(role.id, el)" @click.stop="toggleRoleMenu(role.id, $event)">
                <IconDotsVertical :size="16" />
              </button>
            </div>
          </div>

          <p class="role-description">{{ getRoleDescription(role.name) }}</p>

          <div class="role-card-body">
            <div v-if="role.permissions.length === 0" class="empty-state">
              <IconLock :size="24" />
              <span>Sin permisos asignados</span>
            </div>

            <template v-else>
              <div
                v-for="(perms, module) in groupPermissionsByModule(role.permissions)"
                :key="module"
                class="module-group"
              >
                <button class="module-header" @click="toggleModule(role.id, String(module))">
                  <div class="module-info">
                    <span class="module-dot" :class="`dot-${module}`" />
                    <span class="module-name">{{ getModuleName(String(module)) }}</span>
                  </div>
                  <div class="module-right">
                    <span class="module-count">{{ perms.length }}</span>
                    <IconChevronDown
                      :size="14"
                      class="module-chevron"
                      :class="{ rotated: !isModuleExpanded(role.id, String(module)) }"
                    />
                  </div>
                </button>
                <div
                  v-show="isModuleExpanded(role.id, String(module))"
                  class="module-perms"
                >
                  <div v-for="perm in perms" :key="perm.id" class="perm-item">
                    <span class="perm-name">{{ perm.name }}</span>
                    <span class="perm-code">{{ perm.code }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="role-card-footer">
            <span class="perm-total">
              <IconKey :size="14" />
              {{ role.permissions.length }} permisos
            </span>
          </div>
        </UiCard>
      </div>
    </div>

    <UiModal v-model="isModalOpen" size="large">
      <form @submit.prevent="handleCreateSubmit">
        <UiCard>
          <template #header>
            <h3 class="card-title">Crear Rol Personalizado</h3>
          </template>
          
          <div class="form-body">
            <UiInput v-model="form.name" label="Nombre del Rol" placeholder="Ej: Gestor de Finanzas" required />
            <UiInput v-model="form.description" label="Descripcion (Opcional)" placeholder="Que hace este rol?" />
            
            <UiDualListbox
              v-model="form.permissionIds"
              :available="allPermissionItems"
              :selected="allPermissionItems"
              label="Permisos"
              available-label="Disponibles"
              selected-label="Asignados al Rol"
            />
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

  <!-- Role dropdown menu -->
  <Teleport to="body">
    <div v-if="openRoleMenuId" class="dropdown-overlay" @click="openRoleMenuId = null" />
    <div v-if="openRoleMenuId" class="role-dropdown" :style="getRoleMenuPosition()">
      <div class="dropdown-item" @click="openEditModal(roles.find(r => r.id === openRoleMenuId)!)">
        <IconPencil :size="14" />
        <span>Editar Rol</span>
      </div>
      <div class="dropdown-divider" />
      <div class="dropdown-item danger" @click="openDeleteModal(roles.find(r => r.id === openRoleMenuId)!)">
        <IconTrash :size="14" />
        <span>Eliminar Rol</span>
      </div>
    </div>
  </Teleport>

  <!-- Edit Modal -->
  <UiModal v-model="isEditModalOpen" size="large">
    <form @submit.prevent="handleEditSubmit">
      <UiCard>
        <template #header>
          <h3 class="card-title">Editar Rol</h3>
        </template>
        <div class="form-body">
          <UiInput v-model="editForm.name" label="Nombre del Rol" required />
          <UiDualListbox
            v-model="editForm.permissionIds"
            :available="allPermissionItems"
            :selected="allPermissionItems"
            label="Permisos"
            available-label="Disponibles"
            selected-label="Asignados al Rol"
          />
        </div>
        <template #footer>
          <div class="modal-footer">
            <UiButton type="button" variant="outline" @click="isEditModalOpen = false">Cancelar</UiButton>
            <UiButton type="submit" :loading="isSaving">Guardar Cambios</UiButton>
          </div>
        </template>
      </UiCard>
    </form>
  </UiModal>

  <!-- Delete Confirmation Modal -->
  <UiModal v-model="isDeleteModalOpen">
    <UiCard>
      <template #header>
        <h3 class="card-title">Eliminar Rol</h3>
        <p class="card-description">
          Estas seguro de eliminar el rol <strong>{{ deleteTarget?.name }}</strong>?
          Esta accion no se puede deshacer.
        </p>
      </template>
      <template #footer>
        <div class="modal-footer">
          <UiButton variant="outline" @click="isDeleteModalOpen = false">Cancelar</UiButton>
          <UiButton variant="danger" :loading="isSaving" @click="handleDeleteSubmit">Eliminar</UiButton>
        </div>
      </template>
    </UiCard>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { roleService } from '@/services/role.service';
import type { Role, Permission } from '@/types/role';
import { useAuthStore } from '@/stores/auth.store';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiModal from '@/components/ui/UiModal.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiDualListbox from '@/components/ui/UiDualListbox.vue';
import {
  IconShield,
  IconUserCog,
  IconLock,
  IconChevronDown,
  IconKey,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from '@tabler/icons-vue';

const authStore = useAuthStore();
const roles = ref<Role[]>([]);
const allPermissions = ref<Permission[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);

const isModalOpen = ref(false);
const form = reactive({ name: '', description: '', permissionIds: [] as string[] });

const openRoleMenuId = ref<string | null>(null);
const menuBtnRefs = ref<Record<string, HTMLElement>>({});

const isEditModalOpen = ref(false);
const editForm = reactive({ id: '', name: '', permissionIds: [] as string[] });

const isDeleteModalOpen = ref(false);
const deleteTarget = ref<{ id: string; name: string } | null>(null);

const expandedModules = ref<Record<string, Set<string>>>({});

const allPermissionItems = computed(() =>
  allPermissions.value.map((p) => ({
    id: p.id,
    label: p.name || p.code,
    description: p.code,
  }))
);

const MODULE_LABELS: Record<string, string> = {
  auth: 'Autenticacion',
  users: 'Usuarios',
  roles: 'Roles',
  company: 'Empresa',
  settings: 'Configuracion',
  profile: 'Perfil',
  dashboard: 'Dashboard',
  branches: 'Sedes',
  audit: 'Auditoria',
  billing: 'Facturacion',
  notifications: 'Notificaciones',
  integrations: 'Integraciones',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Owner: 'Control total del sistema. Gestion de usuarios, roles, facturacion y configuracion.',
  Admin: 'Acceso extendido excepto eliminacion de usuarios y gestion de roles.',
  Viewer: 'Solo lectura. Puede consultar pero no modificar datos.',
};

const MODULE_COLORS: Record<string, string> = {
  auth: '#ef4444',
  users: '#3b82f6',
  roles: '#8b5cf6',
  company: '#06b6d4',
  settings: '#6b7280',
  profile: '#10b981',
  dashboard: '#f59e0b',
  branches: '#ec4899',
  audit: '#f97316',
  billing: '#14b8a6',
  notifications: '#a855f7',
  integrations: '#6366f1',
};

function getRoleDescription(name: string): string {
  return ROLE_DESCRIPTIONS[name] || 'Rol personalizado de la organizacion.';
}

function getModuleName(code: string): string {
  return MODULE_LABELS[code] || code;
}

function groupPermissionsByModule(perms: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {};
  for (const p of perms) {
    if (!groups[p.module]) groups[p.module] = [];
    groups[p.module].push(p);
  }
  return groups;
}

function toggleModule(roleId: string, module: string) {
  if (!expandedModules.value[roleId]) expandedModules.value[roleId] = new Set();
  const set = expandedModules.value[roleId];
  if (set.has(module)) set.delete(module);
  else set.add(module);
}

function isModuleExpanded(roleId: string, module: string): boolean {
  return expandedModules.value[roleId]?.has(module) ?? true;
}

function toggleRoleMenu(id: string, event: MouseEvent) {
  if (openRoleMenuId.value === id) {
    openRoleMenuId.value = null;
    return;
  }
  openRoleMenuId.value = id;
}

function setMenuBtnRef(id: string, el: any) {
  if (el) menuBtnRefs.value[id] = el;
}

function getRoleMenuPosition() {
  const el = menuBtnRefs.value[openRoleMenuId.value!];
  if (!el) return {};
  const rect = el.getBoundingClientRect();
  return {
    position: 'fixed' as const,
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
}

function openEditModal(role: Role) {
  editForm.id = role.id;
  editForm.name = role.name;
  editForm.permissionIds = role.permissions.map((p) => p.id);
  openRoleMenuId.value = null;
  isEditModalOpen.value = true;
}

function openDeleteModal(role: Role) {
  deleteTarget.value = { id: role.id, name: role.name };
  openRoleMenuId.value = null;
  isDeleteModalOpen.value = true;
}

async function handleEditSubmit() {
  isSaving.value = true;
  try {
    await roleService.updateRole(editForm.id, {
      name: editForm.name,
      permissionIds: editForm.permissionIds,
    });
    isEditModalOpen.value = false;
    await fetchData();
  } catch (error) {
    console.error('Error actualizando rol:', error);
  } finally {
    isSaving.value = false;
  }
}

async function handleDeleteSubmit() {
  if (!deleteTarget.value) return;
  isSaving.value = true;
  try {
    await roleService.deleteRole(deleteTarget.value.id);
    isDeleteModalOpen.value = false;
    deleteTarget.value = null;
    await fetchData();
  } catch (error) {
    console.error('Error eliminando rol:', error);
  } finally {
    isSaving.value = false;
  }
}

const fetchData = async () => {
  if (!authStore.activeTenantId) return;
  try {
    const [rolesData, permsData] = await Promise.all([
      roleService.getRoles(),
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
    await roleService.createRole({
      name: form.name,
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
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-6);
}

.role-card { padding: 0 !important; overflow: hidden; }

.role-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border);
}

.role-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.role-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.role-icon.system {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.role-icon.custom {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.role-name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.role-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  margin-top: 2px;
}
.role-badge.system {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.role-badge.custom {
  background: var(--bg-app);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.role-title-text {
  display: flex;
  flex-direction: column;
}

.role-actions {
  flex-shrink: 0;
}

.role-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius);
  transition: all 0.15s;
}
.role-menu-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.role-description {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
  padding: 0 var(--space-5) var(--space-4);
  line-height: 1.5;
}

.role-card-body {
  padding: var(--space-2) 0;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.module-group {
  border-bottom: 1px solid var(--border);
}
.module-group:last-child {
  border-bottom: none;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-2) var(--space-4);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.1s;
}
.module-header:hover {
  background: var(--bg-hover);
}

.module-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.module-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-auth { background: #ef4444; }
.dot-users { background: #3b82f6; }
.dot-roles { background: #8b5cf6; }
.dot-company { background: #06b6d4; }
.dot-settings { background: #6b7280; }
.dot-profile { background: #10b981; }
.dot-dashboard { background: #f59e0b; }
.dot-branches { background: #ec4899; }
.dot-audit { background: #f97316; }
.dot-billing { background: #14b8a6; }
.dot-notifications { background: #a855f7; }
.dot-integrations { background: #6366f1; }

.module-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-main);
}

.module-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.module-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: var(--bg-app);
  border: 1px solid var(--border);
  padding: 0 6px;
  border-radius: 10px;
  line-height: 1.6;
}

.module-chevron {
  color: var(--text-muted);
  transition: transform 0.2s;
}
.module-chevron.rotated {
  transform: rotate(-90deg);
}

.module-perms {
  padding: 0 var(--space-4) var(--space-2);
}

.perm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  padding-left: var(--space-4);
  border-bottom: 1px solid var(--border);
}
.perm-item:last-child {
  border-bottom: none;
}

.perm-name {
  font-size: var(--text-sm);
  color: var(--text-main);
}

.perm-code {
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  color: var(--text-muted);
  background: var(--bg-app);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.role-card-footer {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border);
  background: var(--bg-app);
}

.perm-total {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.loading-state {
  color: var(--text-muted);
  font-size: var(--text-base);
  padding: var(--space-8) 0;
}

.modal-footer { display: flex; gap: var(--space-2); width: 100%; }

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
}

/* Dropdown */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 49;
}

.role-dropdown {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
  z-index: 50;
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  animation: dropdown-in 0.12s ease-out;
}

.role-dropdown .dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  font-size: var(--text-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.12s;
}
.role-dropdown .dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
.role-dropdown .dropdown-item.danger {
  color: var(--color-danger);
}
.role-dropdown .dropdown-item.danger:hover {
  background: var(--color-danger-bg);
}
.role-dropdown .dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: var(--space-1) 0;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>

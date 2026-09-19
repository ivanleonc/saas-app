<template>
  <AuthenticatedLayout>
    <div class="members-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Miembros del Equipo</h1>
          <p class="page-subtitle">Gestiona los accesos y roles de los usuarios en tu organización.</p>
        </div>
        <UiButton v-permission="'users:create'" @click="openAddModal" width="auto">
          <IconPlus :size="16" /> Nuevo Miembro
        </UiButton>
      </div>

      <div class="table-section">
        <div class="table-wrapper">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in memberStore.members" :key="member.id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ member.name.substring(0, 2).toUpperCase() }}</div>
                    <span class="font-medium">{{ member.name }}</span>
                  </div>
                </td>
                <td>{{ member.email }}</td>
                <td>
                  <div class="roles-cell">
                    <span v-for="role in member.roles" :key="role" class="badge-role"
                      :class="{ 'owner-badge': role === 'Owner' || role === 'owner' }">
                      <IconCrown v-if="role === 'Owner' || role === 'owner'" :size="12" stroke-width="2" class="owner-icon" />
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge-status" :class="member.status || 'active'">
                    {{ member.status || 'Active' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions" v-permission="'users:update'" :ref="el => setRowRef(member.id, el)">
                    <button class="dots-btn" @click.stop="toggleRowMenu(member.id)">
                      <IconDotsVertical :size="16" stroke-width="1.8" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Member Modal -->
      <UiModal v-model="isAddModalOpen">
        <form @submit.prevent="handleAddSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">Invitar Miembro</h3>
              <p class="card-description">Agrega un nuevo miembro a tu equipo.</p>
            </template>
            <div class="form-body">
              <UiAlert v-if="memberStore.error">{{ memberStore.error }}</UiAlert>
              <div v-if="newMemberCredentials" class="credentials-box">
                <p class="credentials-title">Miembro Agregado!</p>
                <p><strong>Usuario:</strong> {{ newMemberCredentials.email }}</p>
                <p><strong>Clave:</strong> <code class="secret-code">{{ newMemberCredentials.password }}</code></p>
              </div>
              <template v-else>
                <UiInput v-model="addForm.name" label="Nombre Completo" required />
                <UiInput v-model="addForm.email" label="Correo Electronico" type="email" required />
                <div class="select-group">
                  <label class="ui-label">Rol Asignado</label>
                  <div class="checkbox-grid">
                    <label v-for="role in availableRoles" :key="role.id">
                      <input type="checkbox" :value="role.id" v-model="addForm.roleIds" />
                      {{ role.name }}
                    </label>
                  </div>
                </div>
              </template>
            </div>
            <template #footer>
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isAddModalOpen = false">
                  {{ newMemberCredentials ? 'Cerrar' : 'Cancelar' }}
                </UiButton>
                <UiButton v-if="!newMemberCredentials" type="submit" :loading="memberStore.isLoading">
                  Agregar al Equipo
                </UiButton>
              </div>
            </template>
          </UiCard>
        </form>
      </UiModal>

      <!-- Edit Member Modal -->
      <UiModal v-model="isEditModalOpen">
        <form @submit.prevent="handleEditSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">Editar Miembro</h3>
              <p class="card-description">Modificando accesos para: <strong>{{ editForm.name }}</strong></p>
            </template>
            
            <div class="form-body">
              <UiSelect 
                v-model="editForm.status" 
                label="Estado de la Cuenta" 
                :options="statusOptions" 
              />

              <div>
                <label class="ui-label">Roles Asignados</label>
                <div class="checkbox-grid">
                  <label 
                    v-for="role in availableRoles" 
                    :key="role.id" 
                  >
                    <input type="checkbox" :value="role.id" v-model="editForm.roleIds" />
                    {{ role.name }}
                  </label>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isEditModalOpen = false">
                  Cancelar
                </UiButton>
                <UiButton type="submit" :loading="memberStore.isLoading">
                  Guardar Cambios
                </UiButton>
              </div>
            </template>
          </UiCard>
        </form>
      </UiModal>

    </div>

    <!-- Teleported row dropdown -->
    <Teleport to="body">
      <div v-if="openRowMenuId" class="dropdown-overlay" @click="openRowMenuId = null"></div>
      <div v-if="openRowMenuId && rowRefs[openRowMenuId]" class="row-dropdown" :style="getDropdownPosition(openRowMenuId)">
        <div class="dropdown-item" @click="handleEditFromDropdown">
          <IconPencil :size="14" stroke-width="1.8" />
          <span>Editar</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item danger" @click="handleDeleteFromDropdown" v-permission="'users:delete'">
          <IconTrash :size="14" stroke-width="1.8" />
          <span>Eliminar</span>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <UiModal v-model="isDeleteModalOpen">
      <UiCard>
        <template #header>
          <h3 class="card-title">Eliminar Miembro</h3>
          <p class="card-description">¿Estás seguro de que deseas eliminar permanentemente a <strong>{{ deleteTarget?.name }}</strong> de la empresa?</p>
        </template>
        <UiAlert v-if="memberStore.error">{{ memberStore.error }}</UiAlert>
        <template #footer>
          <div class="modal-footer">
            <UiButton variant="outline" @click="isDeleteModalOpen = false">Cancelar</UiButton>
            <UiButton variant="danger" :loading="memberStore.isLoading" @click="confirmDelete">
              Eliminar
            </UiButton>
          </div>
        </template>
      </UiCard>
    </UiModal>

  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { useMemberStore } from '@/stores/member.store';
import { roleService, type Role } from '@/services/role.service';
import { useAuthStore } from '@/stores/auth.store';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import UiModal from '@/components/ui/UiModal.vue';
import UiSelect from '@/components/ui/UiSelect.vue';
import { IconCrown, IconPlus, IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-vue';

const authStore = useAuthStore();
const memberStore = useMemberStore();
const availableRoles = ref<Role[]>([]);

const openRowMenuId = ref<string | null>(null);
const rowRefs = ref<Record<string, HTMLElement>>({});

const setRowRef = (id: string, el: any) => {
  if (el) rowRefs.value[id] = el;
};

const toggleRowMenu = (id: string) => {
  openRowMenuId.value = openRowMenuId.value === id ? null : id;
};

const getDropdownPosition = (id: string) => {
  const el = rowRefs.value[id];
  if (!el) return {};
  const rect = el.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
};

const handleEditFromDropdown = () => {
  const member = memberStore.members.find((m: any) => m.id === openRowMenuId.value);
  openRowMenuId.value = null;
  if (member) openEditModal(member);
};

const handleDeleteFromDropdown = () => {
  const member = memberStore.members.find((m: any) => m.id === openRowMenuId.value);
  openRowMenuId.value = null;
  if (member) handleDelete(member.id, member.name);
};

// --- ADD MEMBER ---
const isAddModalOpen = ref(false);
const addForm = reactive({ name: '', email: '', roleIds: [] as string[] });
const newMemberCredentials = ref<{ email: string; password: string } | null>(null);

onMounted(async () => {
  if (authStore.activeTenantId) {
    await Promise.all([
      memberStore.fetchMembers(),
      roleService.getRoles(authStore.activeTenantId).then(r => availableRoles.value = r)
    ]);
  }
});

const openAddModal = () => {
  addForm.name = '';
  addForm.email = '';
  addForm.roleIds = [];
  newMemberCredentials.value = null;
  isAddModalOpen.value = true;
};

const handleAddSubmit = async () => {
  newMemberCredentials.value = null;
  try {
    const payload = {
      name: addForm.name,
      email: addForm.email,
      roleIds: addForm.roleIds
    };

    const data = await memberStore.addMember(payload);
    newMemberCredentials.value = { email: data.email, password: data.temporary_password };
    
    addForm.name = ''; 
    addForm.email = ''; 
    addForm.roleIds = [];
  } catch (error) {
    console.error('Error al agregar miembro:', error);
  }
};

// --- EDIT MEMBER ---
const isEditModalOpen = ref(false);
const editForm = reactive({
  id: '',
  name: '',
  roleIds: [] as string[],
  status: 'active'
});

const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' }
];

const openEditModal = (member: any) => {
  editForm.id = member.id;
  editForm.name = member.name;
  editForm.status = member.status || 'active';
  
  if (member.roles && member.roles.length > 0) {
    editForm.roleIds = availableRoles.value
      .filter(role => member.roles.includes(role.name))
      .map(role => role.id);
  } else {
    editForm.roleIds = [];
  }
  
  isEditModalOpen.value = true;
};

const handleEditSubmit = async () => {
  try {
    await memberStore.updateMember(editForm.id, {
      roleIds: editForm.roleIds,
      status: editForm.status
    });
    isEditModalOpen.value = false;
  } catch (error) {
    console.error('Error al editar miembro:', error);
  }
};

// --- DELETE MEMBER ---
const isDeleteModalOpen = ref(false);
const deleteTarget = ref<{ id: string; name: string } | null>(null);

const handleDelete = async (userId: string, userName: string) => {
  deleteTarget.value = { id: userId, name: userName };
  openRowMenuId.value = null;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  try {
    await memberStore.removeMember(deleteTarget.value.id);
    isDeleteModalOpen.value = false;
    deleteTarget.value = null;
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};
</script>

<style scoped>
.members-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.select-group { display: flex; flex-direction: column; gap: var(--space-2); }
.ui-label { font-size: var(--text-base); font-weight: 500; color: var(--text-main); }

.roles-cell { display: flex; gap: var(--space-1); flex-wrap: wrap; }
.owner-icon { color: var(--accent-amber); margin-right: 4px; }
.modal-footer { display: flex; gap: var(--space-2); width: 100%; }

/* ROW ACTIONS DROPDOWN */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 49;
}

.row-actions {
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.dots-btn {
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
.dots-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.row-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
  z-index: 50;
  box-shadow: var(--shadow-lg);
  min-width: 150px;
  animation: dropdown-in 0.12s ease-out;
}

.row-dropdown .dropdown-item {
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
.row-dropdown .dropdown-item:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}
.row-dropdown .dropdown-item.danger {
  color: var(--color-danger);
}
.row-dropdown .dropdown-item.danger:hover {
  background-color: var(--color-danger-bg);
}
.row-dropdown .dropdown-divider {
  height: 1px;
  background-color: var(--border);
  margin: var(--space-1) 0;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

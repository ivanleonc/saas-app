<template>
  <AuthenticatedLayout>
    <div class="branches-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Sedes</h1>
          <p class="page-subtitle">Gestiona las ubicaciones de tu empresa.</p>
        </div>
        <UiButton v-permission="Permissions.BRANCHES.CREATE" @click="openCreateModal" width="auto">
          <IconPlus :size="16" /> Nueva Sede
        </UiButton>
      </div>

      <div class="table-section">
        <div class="table-wrapper">
          <table class="ui-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="branchStore.isLoading">
                <td colspan="5" class="empty-state">Cargando sedes...</td>
              </tr>
              <tr v-else-if="branchStore.branches.length === 0">
                <td colspan="5" class="empty-state">No hay sedes configuradas.</td>
              </tr>
              <tr v-for="branch in branchStore.branches" :key="branch.id">
                <td>
                  <div class="user-cell">
                    <div class="branch-avatar">
                      <IconBuildingCommunity :size="16" stroke-width="1.8" />
                    </div>
                    <span class="font-medium">{{ branch.name }}</span>
                  </div>
                </td>
                <td>
                  <span v-if="branch.city || branch.state || branch.country">
                    {{ [branch.city, branch.state, branch.country].filter(Boolean).join(', ') }}
                  </span>
                  <span v-else class="text-muted">Sin ubicación</span>
                </td>
                <td>
                  <span v-if="branch.phone || branch.email">
                    {{ branch.phone || branch.email }}
                  </span>
                  <span v-else class="text-muted">Sin contacto</span>
                </td>
                <td>
                  <span class="badge-status" :class="branch.is_active ? 'active' : 'inactive'">
                    {{ branch.is_active ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions" v-permission="Permissions.BRANCHES.UPDATE" :ref="el => setRowRef(branch.id, el)">
                    <button class="dots-btn" @click.stop="toggleRowMenu(branch.id)">
                      <IconDotsVertical :size="16" stroke-width="1.8" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <UiModal v-model="isFormModalOpen">
        <form @submit.prevent="handleSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">{{ editingBranch ? 'Editar Sede' : 'Nueva Sede' }}</h3>
              <p class="card-description" v-if="editingBranch">Modificando: <strong>{{ editingBranch.name }}</strong></p>
              <p class="card-description" v-else>Agrega una nueva ubicación a tu empresa.</p>
            </template>

            <div class="form-body">
              <UiAlert v-if="formError" type="error">{{ formError }}</UiAlert>

              <UiInput v-model="form.name" label="Nombre de la Sede" required />
              <UiInput v-model="form.address" label="Dirección" />
              <div class="form-row">
                <UiInput v-model="form.city" label="Ciudad" />
                <UiInput v-model="form.state" label="Estado / Provincia" />
              </div>
              <div class="form-row">
                <UiInput v-model="form.country" label="País" />
                <UiInput v-model="form.postal_code" label="Código Postal" />
              </div>
              <div class="form-row">
                <UiInput v-model="form.phone" label="Teléfono" />
                <UiInput v-model="form.email" label="Email" type="email" />
              </div>
            </div>

            <template #footer>
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isFormModalOpen = false">
                  Cancelar
                </UiButton>
                <UiButton type="submit" :loading="branchStore.isLoading">
                  {{ editingBranch ? 'Guardar Cambios' : 'Crear Sede' }}
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
        <div class="dropdown-item" @click="handleToggleActiveFromDropdown">
          <IconSwitchHorizontal :size="14" stroke-width="1.8" />
          <span>{{ activeDropdownBranch?.is_active ? 'Desactivar' : 'Activar' }}</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item danger" @click="handleDeleteFromDropdown" v-permission="Permissions.BRANCHES.DELETE">
          <IconTrash :size="14" stroke-width="1.8" />
          <span>Eliminar</span>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <UiModal v-model="isDeleteModalOpen">
      <UiCard>
        <template #header>
          <h3 class="card-title">Eliminar Sede</h3>
          <p class="card-description">¿Estás seguro de que deseas eliminar la sede <strong>{{ deletingBranch?.name }}</strong>?</p>
        </template>
        <UiAlert v-if="branchStore.error">{{ branchStore.error }}</UiAlert>
        <template #footer>
          <div class="modal-footer">
            <UiButton variant="outline" @click="isDeleteModalOpen = false">Cancelar</UiButton>
            <UiButton variant="danger" :loading="branchStore.isLoading" @click="confirmDelete">
              Eliminar
            </UiButton>
          </div>
        </template>
      </UiCard>
    </UiModal>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useBranchStore } from '@/stores/branch.store';
import { Permissions } from '@/constants/permissions';
import type { Branch } from '@/types/branch';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import UiModal from '@/components/ui/UiModal.vue';
import {
  IconPlus,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconBuildingCommunity,
  IconSwitchHorizontal,
} from '@tabler/icons-vue';

const branchStore = useBranchStore();

// --- ROW DROPDOWN ---
const openRowMenuId = ref<string | null>(null);
const rowRefs = ref<Record<string, HTMLElement>>({});

const setRowRef = (id: string, el: any) => {
  if (el) rowRefs.value[id] = el;
};

const toggleRowMenu = (branchId: string) => {
  openRowMenuId.value = openRowMenuId.value === branchId ? null : branchId;
};

const getDropdownPosition = (branchId: string) => {
  const el = rowRefs.value[branchId];
  if (!el) return {};
  const rect = el.getBoundingClientRect();
  return {
    position: 'fixed' as const,
    top: `${rect.bottom + 4}px`,
    left: `${rect.right - 150}px`,
    zIndex: 50,
  };
};

const activeDropdownBranch = ref<Branch | null>(null);

const handleEditFromDropdown = () => {
  const branch = branchStore.branches.find(b => b.id === openRowMenuId.value);
  if (branch) openEditModal(branch);
  openRowMenuId.value = null;
};

const handleToggleActiveFromDropdown = async () => {
  const branch = branchStore.branches.find(b => b.id === openRowMenuId.value);
  if (branch) {
    await branchStore.updateBranch(branch.id, { is_active: !branch.is_active });
  }
  openRowMenuId.value = null;
};

const handleDeleteFromDropdown = () => {
  const branch = branchStore.branches.find(b => b.id === openRowMenuId.value);
  if (branch) {
    deletingBranch.value = branch;
    isDeleteModalOpen.value = true;
  }
  openRowMenuId.value = null;
};

// --- CREATE / EDIT ---
const isFormModalOpen = ref(false);
const editingBranch = ref<Branch | null>(null);
const formError = ref('');

const form = reactive({
  name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  phone: '',
  email: '',
});

const openCreateModal = () => {
  editingBranch.value = null;
  form.name = ''; form.address = ''; form.city = ''; form.state = '';
  form.country = ''; form.postal_code = ''; form.phone = ''; form.email = '';
  formError.value = '';
  isFormModalOpen.value = true;
};

const openEditModal = (branch: Branch) => {
  editingBranch.value = branch;
  form.name = branch.name;
  form.address = branch.address || '';
  form.city = branch.city || '';
  form.state = branch.state || '';
  form.country = branch.country || '';
  form.postal_code = branch.postal_code || '';
  form.phone = branch.phone || '';
  form.email = branch.email || '';
  formError.value = '';
  isFormModalOpen.value = true;
};

const handleSubmit = async () => {
  formError.value = '';
  try {
    if (editingBranch.value) {
      await branchStore.updateBranch(editingBranch.value.id, { ...form });
    } else {
      await branchStore.createBranch({
        name: form.name,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        postal_code: form.postal_code || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      });
    }
    isFormModalOpen.value = false;
  } catch (err: any) {
    formError.value = err.response?.data?.message || err.response?.data?.error || 'Error al guardar la sede';
  }
};

// --- DELETE ---
const isDeleteModalOpen = ref(false);
const deletingBranch = ref<Branch | null>(null);

const confirmDelete = async () => {
  if (!deletingBranch.value) return;
  try {
    await branchStore.deleteBranch(deletingBranch.value.id);
    isDeleteModalOpen.value = false;
    deletingBranch.value = null;
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al eliminar la sede';
    isDeleteModalOpen.value = false;
  }
};

onMounted(() => branchStore.fetchBranches());
</script>

<style scoped>
.branches-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.branch-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--accent-blue-bg, rgba(59, 130, 246, 0.1));
  color: var(--accent-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.font-medium { font-weight: 600; }
.text-muted { color: var(--text-muted); }

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
  position: fixed;
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

.modal-footer { display: flex; gap: var(--space-2); width: 100%; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
</style>

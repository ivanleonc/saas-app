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

      <div class="filters-bar">
        <div class="filter-group">
          <input
            v-model="searchQuery"
            type="text"
            class="filter-input"
            placeholder="Buscar por nombre o ciudad..."
          />
        </div>
        <div class="filter-group">
          <UiSelect v-model="filterStatus" :options="statusFilterOptions" />
        </div>
        <button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">
          <IconX :size="14" /> Limpiar
        </button>
      </div>

      <div class="table-section">
        <div class="table-wrapper">
          <table v-if="!isInitialLoading && filteredBranches.length > 0" class="ui-table">
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
              <tr v-for="branch in filteredBranches" :key="branch.id">
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
                  <div class="row-actions" v-permission="Permissions.BRANCHES.UPDATE">
                    <UiDropdown align="end" label="Acciones de la sede">
                      <template #trigger="{ toggle }">
                        <button class="dots-btn" @click.stop="toggle" aria-haspopup="menu" :aria-label="`Acciones para ${branch.name}`">
                          <IconDotsVertical :size="16" stroke-width="1.8" />
                        </button>
                      </template>
                      <template #default>
                        <UiDropdownItem @click="openEditModal(branch)">
                          <IconPencil :size="14" stroke-width="1.8" />
                          <span>Editar</span>
                        </UiDropdownItem>
                        <UiDropdownItem @click="handleToggleActive(branch)">
                          <IconSwitchHorizontal :size="14" stroke-width="1.8" />
                          <span>{{ branch.is_active ? 'Desactivar' : 'Activar' }}</span>
                        </UiDropdownItem>
                        <div class="ui-dropdown-divider" role="separator"></div>
                        <UiDropdownItem danger @click="openDeleteModal(branch)" v-permission="Permissions.BRANCHES.DELETE">
                          <IconTrash :size="14" stroke-width="1.8" />
                          <span>Eliminar</span>
                        </UiDropdownItem>
                      </template>
                    </UiDropdown>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else-if="isInitialLoading" class="skeleton-list" aria-label="Cargando sedes">
            <div v-for="n in 5" :key="n" class="skeleton-row">
              <div class="skeleton skeleton-avatar"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
              <div class="skeleton skeleton-badge"></div>
            </div>
          </div>

          <div v-else class="empty-state">
            <IconBuildingCommunity :size="48" stroke-width="1.5" />
            <p>{{ branchStore.branches.length === 0 ? 'No hay sedes todavía' : 'Sin resultados' }}</p>
            <span>{{ branchStore.branches.length === 0
              ? 'Agrega tu primera ubicación para empezar.'
              : 'Prueba con otra búsqueda o limpia los filtros.' }}</span>
            <UiButton
              v-if="branchStore.branches.length === 0"
              v-permission="Permissions.BRANCHES.CREATE"
              width="auto"
              @click="openCreateModal"
            >
              <IconPlus :size="16" /> Nueva Sede
            </UiButton>
          </div>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useBranchStore } from '@/stores/branch.store';
import { Permissions } from '@/constants/permissions';
import type { Branch } from '@/types/branch';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import UiModal from '@/components/ui/UiModal.vue';
import UiSelect from '@/components/ui/UiSelect.vue';
import UiDropdown from '@/components/ui/UiDropdown.vue';
import UiDropdownItem from '@/components/ui/UiDropdownItem.vue';
import { useToast } from '@/composables/useToast';
import {
  IconPlus,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconBuildingCommunity,
  IconSwitchHorizontal,
  IconX,
} from '@tabler/icons-vue';

const branchStore = useBranchStore();
const toast = useToast();

// --- FILTERS ---
const searchQuery = ref('');
const filterStatus = ref('');

const statusFilterOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activa', value: 'active' },
  { label: 'Inactiva', value: 'inactive' },
];

const hasActiveFilters = computed(() => searchQuery.value || filterStatus.value);

const filteredBranches = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return branchStore.branches.filter((b) => {
    const status = b.is_active ? 'active' : 'inactive';
    if (filterStatus.value && status !== filterStatus.value) return false;
    if (query) {
      const haystack = `${b.name || ''} ${b.city || ''} ${b.state || ''} ${b.country || ''}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
});

const clearFilters = () => {
  searchQuery.value = '';
  filterStatus.value = '';
};

const isInitialLoading = computed(() => branchStore.isLoading && branchStore.branches.length === 0);

const handleToggleActive = async (branch: Branch) => {
  try {
    await branchStore.updateBranch(branch.id, { is_active: !branch.is_active });
    toast.success(branch.is_active ? 'Sede desactivada' : 'Sede activada');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.response?.data?.error || 'Error al cambiar el estado');
  }
};

const openDeleteModal = (branch: Branch) => {
  deletingBranch.value = branch;
  isDeleteModalOpen.value = true;
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
      toast.success('Sede actualizada correctamente');
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
      toast.success('Sede creada correctamente');
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
    toast.success('Sede eliminada correctamente');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.response?.data?.error || 'Error al eliminar la sede');
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

.filters-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.filter-group {
  display: flex;
  align-items: center;
  min-width: 180px;
}
.filter-group:first-child {
  flex: 1;
}

.filter-input {
  height: 2rem;
  width: 100%;
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-app);
  color: var(--text-main);
  outline: none;
}
.filter-input:focus {
  border-color: var(--text-main);
  box-shadow: 0 0 0 1px var(--text-main);
}
.filter-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 2rem;
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.clear-btn:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-16) var(--space-4);
  color: var(--text-muted);
  text-align: center;
}
.empty-state p { font-size: var(--text-lg); font-weight: 500; color: var(--text-main); margin: 0; }
.empty-state span { font-size: var(--text-sm); }

.skeleton-list {
  display: flex;
  flex-direction: column;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
}
.skeleton-row:last-child { border-bottom: none; }

.skeleton {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--bg-hover) 25%, var(--border) 50%, var(--bg-hover) 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}
.skeleton-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
.skeleton-text { height: 14px; width: 180px; }
.skeleton-text.short { width: 120px; }
.skeleton-badge { height: 20px; width: 70px; border-radius: var(--radius-full); margin-left: auto; }

@keyframes skeleton-pulse {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

/* ROW ACTIONS */
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

.modal-footer { display: flex; gap: var(--space-2); width: 100%; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
</style>

<template>
  <AuthenticatedLayout>
    <div class="members-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Miembros del Equipo</h1>
          <p class="page-subtitle">Gestiona los accesos y roles de los usuarios en tu organización.</p>
        </div>
      </div>

      <div class="grid-layout">
        <div class="form-section">
          <form @submit.prevent="handleAddSubmit">
            <UiCard>
              <template #header>
                <h3 class="card-title">Invitar Miembro</h3>
              </template>
              <div class="form-body">
                <UiAlert v-if="memberStore.error">{{ memberStore.error }}</UiAlert>
                <div v-if="newMemberCredentials" class="credentials-box">
                  <p class="credentials-title">¡Miembro Agregado!</p>
                  <p><strong>Usuario:</strong> {{ newMemberCredentials.email }}</p>
                  <p><strong>Clave:</strong> <code class="secret-code">{{ newMemberCredentials.password }}</code></p>
                </div>
                <UiInput v-model="addForm.name" label="Nombre Completo" required />
                <UiInput v-model="addForm.email" label="Correo Electrónico" type="email" required />
                <div class="select-group">
                  <label class="ui-label">Rol Asignado</label>
                  <select v-model="addForm.roleId" class="ui-select" required>
                    <option :value="2">Admin (Gestión Estándar)</option>
                    <option :value="1">Owner (Control Total)</option>
                  </select>
                </div>
              </div>
              <template #footer>
                <UiButton type="submit" :loading="memberStore.isLoading">Agregar al Equipo</UiButton>
              </template>
            </UiCard>
          </form>
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
                  <th class="text-right">Acciones</th> </tr>
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
                    <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                      <span v-for="role in member.roles" :key="role" class="badge-role"
                        :class="{ 'owner-badge': role === 'Owner' || role === 'owner' }">
                        <svg v-if="role === 'Owner' || role === 'owner'" width="12" height="12" viewBox="0 0 24 24"
                          fill="currentColor" style="margin-right: 4px; color: #d97706;">
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z">
                          </path>
                        </svg>
                        {{ role }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge-status" :class="member.status || 'active'">
                      {{ member.status || 'Active' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="action-btn edit-btn" @click="openEditModal(member)">
                      Editar
                    </button>
                    <button class="action-btn delete-btn" @click="handleDelete(member.id, member.name)">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UiModal v-model="isEditModalOpen">
        <form @submit.prevent="handleEditSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">Editar Miembro</h3>
              <p class="card-description">Modifica el rol o estado de {{ editingMember?.name }}</p>
            </template>
            
            <div class="form-body">
              <div class="select-group">
                <label class="ui-label">Rol del Usuario</label>
                <select v-model="editForm.roleId" class="ui-select" required>
                  <option :value="2">Admin</option>
                  <option :value="1">Owner</option>
                </select>
              </div>

              <div class="select-group">
                <label class="ui-label">Estado de la Cuenta</label>
                <select v-model="editForm.status" class="ui-select" required>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo (Suspendido)</option>
                </select>
              </div>
            </div>

            <template #footer>
              <div style="display: flex; gap: 0.5rem; width: 100%;">
                <UiButton type="button" style="background-color: white; color: var(--text-main); border: 1px solid var(--border);" @click="isEditModalOpen = false">
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
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { useMemberStore } from '@/stores/member.store';
import type { Member } from '@/types/member';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import UiModal from '@/components/ui/UiModal.vue'; // Importamos el modal

const memberStore = useMemberStore();

// --- LÓGICA DE AGREGAR MIEMBRO ---
const addForm = reactive({ name: '', email: '', roleId: 2 });
const newMemberCredentials = ref<{ email: string; password: string } | null>(null);

onMounted(() => { memberStore.fetchMembers(); });

const handleAddSubmit = async () => {
  newMemberCredentials.value = null;
  try {
    // Empaquetamos los datos transformando roleId (Vue) a role_id (Zod Backend)
    const payload = {
      name: addForm.name,
      email: addForm.email,
      role_id: addForm.roleId // <-- ¡Aquí está el truco!
    };

    const data = await memberStore.addMember(payload);
    newMemberCredentials.value = { email: data.email, password: data.temporary_password };
    
    // Limpiamos el formulario
    addForm.name = ''; 
    addForm.email = ''; 
    addForm.roleId = 2;
  } catch (error) {
    console.error('💥 Error capturado al agregar miembro:', error);
  }
};

// --- LÓGICA DE EDITAR MIEMBRO ---
const isEditModalOpen = ref(false);
const editingMember = ref<Member | null>(null);
const editForm = reactive({ roleId: 2, status: 'active' as 'active' | 'inactive' });

const openEditModal = (member: Member) => {
  editingMember.value = member;
  editForm.roleId = member.role_name === 'Owner' ? 1 : 2;
  editForm.status = member.status || 'active';
  isEditModalOpen.value = true;
};

// Y hacemos lo mismo para la edición, por si acaso:
const handleEditSubmit = async () => {
  if (!editingMember.value) return;
  try {
    await memberStore.updateMember(editingMember.value.id, {
      roleId: editForm.roleId,
      status: editForm.status
    });
    isEditModalOpen.value = false;
  } catch (error) {
    console.error('💥 Error capturado al editar miembro:', error);
  }
};

// --- LÓGICA DE ELIMINAR MIEMBRO ---
const handleDelete = async (userId: number, userName: string) => {
  // Usamos el confirm nativo del navegador por simplicidad y UX directa
  const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${userName} de la empresa?`);
  if (!isConfirmed) return;

  try {
    await memberStore.removeMember(userId);
  } catch (error) {
    alert(memberStore.error || 'Error al eliminar');
  }
};
</script>

<style scoped>
.members-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.page-title { margin: 0; font-size: 1.875rem; font-weight: 600; letter-spacing: -0.025em; color: var(--text-main); }
.page-subtitle { margin: 0.5rem 0 0; color: var(--text-muted); }

/* Distribución del Panel */
.grid-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .grid-layout { grid-template-columns: 1fr; }
}

/* Formulario e Inyecciones de Estilos */
.card-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-main); }
.card-description { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
.form-body { display: flex; flex-direction: column; gap: 1rem; }

.select-group { display: flex; flex-direction: column; gap: 0.5rem; }
.ui-select {
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background-color: var(--bg-card);
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: var(--text-main);
  outline: none;
}
.ui-select:focus { border-color: var(--text-main); }

/* Caja de Credenciales Temporales */
.credentials-box {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #166534;
}
.credentials-box p { margin: 0.25rem 0; }
.credentials-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.5rem !important; }
.secret-code { background: #dcfce7; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 1rem; }
.credentials-note { font-size: 0.75rem; color: #15803d; margin-top: 0.5rem !important; font-style: italic; }

/* Tabla Estilo Shadcn Nativizado */
.table-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow: hidden;
}
.table-wrapper { width: 100%; overflow-x: auto; }
.ui-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
.ui-table th {
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  background: #fafafa;
}
.ui-table td { padding: 1rem; border-bottom: 1px solid var(--border); color: var(--text-main); }
.ui-table tr:last-child td { border-bottom: none; }

.user-cell { display: flex; align-items: center; gap: 0.75rem; }
.user-avatar {
  width: 28px;
  height: 28px;
  background: var(--bg-app);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  border: 1px solid var(--border);
}
.font-medium { font-weight: 500; }
.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }

/* Badges */
.badge-role { font-size: 0.75rem; font-weight: 500; background: var(--bg-app); border: 1px solid var(--border); padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
.badge-status { font-size: 0.75rem; font-weight: 600; display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; }
.badge-status.active { background: #e0f2fe; color: #0369a1; }
.text-right { text-align: right; }
.action-btn { 
  background: transparent; border: none; cursor: pointer; font-size: 0.8rem; font-weight: 500; 
  margin-left: 0.75rem; text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s;
}
.edit-btn { color: #2563eb; }
.edit-btn:hover { color: #1d4ed8; }
.delete-btn { color: var(--danger-text); }
.delete-btn:hover { color: #b91c1c; }
/* Estilo específico para el Dueño de la organización */
.badge-role.owner-badge {
  background-color: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
</style>
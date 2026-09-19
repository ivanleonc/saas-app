<template>
  <AuthenticatedLayout>
    <div class="profile-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Mi Cuenta</h1>
          <p class="page-subtitle">Gestiona tu informacion personal de acceso y credenciales.</p>
        </div>
      </div>

      <!-- Profile Info Card -->
      <UiCard>
        <template #header>
          <div class="card-header-row">
            <h3 class="card-title">Datos del Perfil</h3>
            <UiButton variant="outline" size="sm" @click="openProfileModal" width="auto">
              <IconEdit :size="14" /> Editar
            </UiButton>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Nombre</span>
            <span class="info-value">{{ profileName || '---' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Correo Electronico</span>
            <span class="info-value">{{ profileEmail }}</span>
          </div>
        </div>
      </UiCard>

      <!-- Password Card -->
      <UiCard>
        <template #header>
          <div class="card-header-row">
            <h3 class="card-title">Cambiar Contrasena</h3>
            <UiButton variant="outline" size="sm" @click="openPasswordModal" width="auto">
              <IconEdit :size="14" /> Editar
            </UiButton>
          </div>
        </template>

        <p class="card-description">Tu contrasena se mantiene segura. Haz clic en editar para actualizarla.</p>
      </UiCard>

      <!-- Profile Edit Modal -->
      <UiModal v-model="isProfileModalOpen">
        <form @submit.prevent="handleProfileSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">Editar Perfil</h3>
              <p class="card-description">Actualiza tu informacion personal.</p>
            </template>

            <div class="form-body">
              <UiAlert v-if="errorMessage" type="error">{{ errorMessage }}</UiAlert>
              <UiAlert v-if="successMessage" type="success">{{ successMessage }}</UiAlert>

              <UiInput v-model="form.name" label="Nombre Completo" required />
              <UiInput v-model="form.email" label="Correo Electronico" type="email" required disabled />
            </div>

            <template #footer>
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isProfileModalOpen = false">
                  Cancelar
                </UiButton>
                <UiButton type="submit" :loading="isSavingProfile">
                  Guardar Cambios
                </UiButton>
              </div>
            </template>
          </UiCard>
        </form>
      </UiModal>

      <!-- Password Change Modal -->
      <UiModal v-model="isPasswordModalOpen">
        <form @submit.prevent="handlePasswordChange">
          <UiCard>
            <template #header>
              <h3 class="card-title">Cambiar Contrasena</h3>
              <p class="card-description">Ingresa tu contrasena actual y la nueva contrasena.</p>
            </template>

            <div class="form-body">
              <UiAlert v-if="passwordError" type="error">{{ passwordError }}</UiAlert>
              <UiAlert v-if="passwordSuccess" type="success">{{ passwordSuccess }}</UiAlert>

              <UiInput
                v-model="passwordForm.currentPassword"
                label="Contrasena Actual"
                type="password"
                required
              />
              <UiInput
                v-model="passwordForm.newPassword"
                label="Nueva Contrasena"
                type="password"
                required
              />
              <UiInput
                v-model="passwordForm.confirmPassword"
                label="Confirmar Nueva Contrasena"
                type="password"
                required
              />
            </div>

            <template #footer>
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isPasswordModalOpen = false">
                  Cancelar
                </UiButton>
                <UiButton type="submit" :loading="isChangingPassword">
                  Actualizar Contrasena
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import UiModal from '@/components/ui/UiModal.vue';
import { IconEdit } from '@tabler/icons-vue';

const authStore = useAuthStore();

// --- PROFILE ---
const isProfileModalOpen = ref(false);
const isSavingProfile = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref('');

const form = reactive({
  name: '',
  email: '',
});

const profileName = computed(() => authStore.user?.name || '');
const profileEmail = computed(() => authStore.user?.email || '');

onMounted(async () => {
  await authStore.fetchProfile();
});

const openProfileModal = () => {
  form.name = authStore.user?.name || '';
  form.email = authStore.user?.email || '';
  errorMessage.value = null;
  successMessage.value = '';
  isProfileModalOpen.value = true;
};

const handleProfileSubmit = async () => {
  isSavingProfile.value = true;
  errorMessage.value = null;
  successMessage.value = '';

  try {
    await userService.updateProfile({ name: form.name, email: form.email });
    authStore.updateProfileData({ name: form.name, email: form.email });
    successMessage.value = 'Perfil actualizado correctamente.';
    setTimeout(() => { isProfileModalOpen.value = false; }, 1000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Error al actualizar perfil';
  } finally {
    isSavingProfile.value = false;
  }
};

// --- PASSWORD ---
const isPasswordModalOpen = ref(false);
const passwordError = ref('');
const passwordSuccess = ref('');
const isChangingPassword = ref(false);

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const openPasswordModal = () => {
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordError.value = '';
  passwordSuccess.value = '';
  isPasswordModalOpen.value = true;
};

const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Las contrasenas no coinciden.';
    return;
  }

  isChangingPassword.value = true;
  passwordError.value = '';
  passwordSuccess.value = '';

  try {
    await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    passwordSuccess.value = 'Contrasena actualizada correctamente.';
    setTimeout(() => { isPasswordModalOpen.value = false; }, 1000);
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar contrasena';
  } finally {
    isChangingPassword.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 600px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 500;
}

.info-value {
  font-size: var(--text-sm);
  color: var(--text-main);
  font-weight: 600;
}

.modal-footer { display: flex; gap: var(--space-2); width: 100%; }
</style>

<template>
  <AuthenticatedLayout>
    <div class="profile-container">
      <div class="page-header">
        <h1 class="page-title">Mi Cuenta</h1>
        <p class="page-subtitle">Gestiona tu información personal de acceso y credenciales.</p>
      </div>

      <div class="form-section">
        <UiCard>
          <template #header>
            <h3 class="card-title">Datos del Perfil</h3>
          </template>

          <div class="form-body">
            <UiAlert v-if="errorMessage" type="error">{{ errorMessage }}</UiAlert>
            <UiAlert v-if="successMessage" type="success">{{ successMessage }}</UiAlert>

            <UiInput v-model="form.name" label="Nombre Completo" required />
            <UiInput v-model="form.email" label="Correo Electrónico" type="email" required disabled />
          </div>
        </UiCard>

        <form @submit.prevent="handlePasswordChange">
          <UiCard>
            <template #header>
              <h3 class="card-title">Cambiar Contraseña</h3>
            </template>

            <div class="form-body">
              <UiAlert v-if="passwordError" type="error">{{ passwordError }}</UiAlert>
              <UiAlert v-if="passwordSuccess" type="success">{{ passwordSuccess }}</UiAlert>

              <UiInput
                v-model="passwordForm.currentPassword"
                label="Contraseña Actual"
                type="password"
                required
              />
              <UiInput
                v-model="passwordForm.newPassword"
                label="Nueva Contraseña"
                type="password"
                required
              />
              <UiInput
                v-model="passwordForm.confirmPassword"
                label="Confirmar Nueva Contraseña"
                type="password"
                required
              />
            </div>

            <template #footer>
              <UiButton type="submit" :loading="isChangingPassword">Actualizar Contraseña</UiButton>
            </template>
          </UiCard>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const authStore = useAuthStore();

const errorMessage = ref<string | null>(null);
const successMessage = ref('');

const passwordError = ref('');
const passwordSuccess = ref('');
const isChangingPassword = ref(false);

const form = reactive({
  name: '',
  email: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

onMounted(async () => {
  await authStore.fetchProfile();
  if (authStore.user) {
    form.name = authStore.user.name || '';
    form.email = authStore.user.email;
  }
});

const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Las contraseñas no coinciden.';
    return;
  }

  isChangingPassword.value = true;
  passwordError.value = '';
  passwordSuccess.value = '';

  try {
    await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    passwordSuccess.value = 'Contraseña actualizada correctamente.';
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar contraseña';
  } finally {
    isChangingPassword.value = false;
  }
};
</script>

<style scoped>
.profile-container { display: flex; flex-direction: column; gap: 2rem; max-width: 600px; }
.page-title { margin: 0; font-size: 1.875rem; font-weight: 600; color: var(--text-main); letter-spacing: -0.025em; }
.page-subtitle { margin: 0.5rem 0 0; color: var(--text-muted); }
.card-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-main); }
.form-body { display: flex; flex-direction: column; gap: 1rem; }
.form-section { display: flex; flex-direction: column; gap: 1.5rem; }
</style>

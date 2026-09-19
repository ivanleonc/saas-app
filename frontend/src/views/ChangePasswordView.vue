<template>
  <AuthenticatedLayout>
    <div class="change-password-container">
      <div class="page-header">
        <h1 class="page-title">Cambiar Contraseña</h1>
        <p class="page-subtitle">Actualiza tu contraseña de acceso.</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <UiCard>
          <template #header>
            <h3 class="card-title">Nueva Contraseña</h3>
          </template>

          <div class="form-body">
            <UiAlert v-if="errorMsg" type="error">{{ errorMsg }}</UiAlert>
            <UiAlert v-if="successMsg" type="success">{{ successMsg }}</UiAlert>

            <UiInput
              v-model="form.currentPassword"
              label="Contraseña Actual"
              type="password"
              required
            />
            <UiInput
              v-model="form.newPassword"
              label="Nueva Contraseña"
              type="password"
              required
            />
            <UiInput
              v-model="form.confirmPassword"
              label="Confirmar Nueva Contraseña"
              type="password"
              required
            />
          </div>

          <template #footer>
            <UiButton type="submit" :loading="isLoading">Actualizar Contraseña</UiButton>
          </template>
        </UiCard>
      </form>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleSubmit = async () => {
  if (form.newPassword !== form.confirmPassword) {
    errorMsg.value = 'Las contraseñas no coinciden.';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    await authService.changePassword(form.currentPassword, form.newPassword);
    successMsg.value = 'Contraseña actualizada correctamente. Redirigiendo...';
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
    setTimeout(() => router.push('/dashboard'), 2000);
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar contraseña';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.change-password-container { display: flex; flex-direction: column; gap: 2rem; max-width: 500px; }
.page-title { margin: 0; font-size: 1.875rem; font-weight: 600; color: var(--text-main); letter-spacing: -0.025em; }
.page-subtitle { margin: 0.5rem 0 0; color: var(--text-muted); }
.card-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-main); }
.form-body { display: flex; flex-direction: column; gap: 1rem; }
</style>

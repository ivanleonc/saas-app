<template>
  <AuthenticatedLayout>
    <div class="change-password-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Cambiar Contrasena</h1>
          <p class="page-subtitle">Actualiza tu contrasena de acceso.</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <UiCard>
          <template #header>
            <h3 class="card-title">Nueva Contrasena</h3>
          </template>

          <div class="form-body">
            <UiAlert v-if="errorMsg" type="error">{{ errorMsg }}</UiAlert>
            <UiAlert v-if="successMsg" type="success">{{ successMsg }}</UiAlert>

            <UiInput
              v-model="form.currentPassword"
              label="Contrasena Actual"
              type="password"
              required
            />
            <UiInput
              v-model="form.newPassword"
              label="Nueva Contrasena"
              type="password"
              required
            />
            <UiInput
              v-model="form.confirmPassword"
              label="Confirmar Nueva Contrasena"
              type="password"
              required
            />
          </div>

          <template #footer>
            <UiButton type="submit" :loading="isLoading">Actualizar Contrasena</UiButton>
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
    errorMsg.value = 'Las contrasenas no coinciden.';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    await authService.changePassword(form.currentPassword, form.newPassword);
    successMsg.value = 'Contrasena actualizada correctamente. Redirigiendo...';
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
    setTimeout(() => router.push('/dashboard'), 2000);
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar contrasena';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.change-password-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 500px;
}

.form-section { display: flex; flex-direction: column; gap: var(--space-6); }
</style>

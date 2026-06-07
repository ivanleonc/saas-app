<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '@/services/auth.service';

import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const route = useRoute();
const router = useRouter();

const token = ref((route.query.token as string) || '');
const email = ref((route.query.email as string) || '');
const password = ref('');
const passwordConfirm = ref('');

const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

onMounted(() => {
  if (!token.value || !email.value) {
    errorMsg.value = 'Enlace de recuperación inválido o incompleto.';
  }
});

const handleSubmit = async () => {
  if (password.value !== passwordConfirm.value) {
    errorMsg.value = 'Las contraseñas no coinciden.';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';
  
  try {
    await authService.resetPassword({
      email: email.value,
      token: token.value,
      password: password.value
    });
    
    successMsg.value = 'Tu contraseña ha sido actualizada. Redirigiendo...';
    setTimeout(() => router.push('/login'), 3000);
  } catch (error: any) {
    errorMsg.value = error.response?.data?.error || 'El enlace caducó o es inválido.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <form @submit.prevent="handleSubmit" style="width: 100%; max-width: 400px;">
      <UiCard>
        <template #header>
          <h2 class="auth-title">Crear Nueva Contraseña</h2>
          <p class="auth-description">Ingresa una contraseña segura para tu cuenta.</p>
        </template>

        <div class="form-content">
          <UiAlert v-if="errorMsg" type="error">{{ errorMsg }}</UiAlert>
          <UiAlert v-if="successMsg" type="success">{{ successMsg }}</UiAlert>

          <template v-if="!successMsg && token && email">
            <UiInput
              v-model="password"
              label="Nueva Contraseña"
              type="password"
              required
            />
            <UiInput
              v-model="passwordConfirm"
              label="Confirmar Contraseña"
              type="password"
              required
            />
          </template>
        </div>

        <template #footer>
          <UiButton v-if="!successMsg && token && email" type="submit" :loading="isLoading">
            Actualizar Contraseña
          </UiButton>
          
          <div class="auth-footer-links">
            <p><router-link to="/login">Ir al Login</router-link></p>
          </div>
        </template>
      </UiCard>
    </form>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-app);
  padding: 1rem;
}
.auth-title { font-size: 1.5rem; font-weight: 600; margin: 0; color: var(--text-main); }
.auth-description { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
.form-content { display: flex; flex-direction: column; gap: 1rem; }
.auth-footer-links { text-align: center; font-size: 0.875rem; margin-top: 1rem; }
.auth-footer-links a { color: var(--text-main); font-weight: 500; text-decoration: underline; }
</style>
<script setup lang="ts">
import { ref } from 'vue';
import { authService } from '@/services/auth.service';

import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const email = ref('');
const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const handleSubmit = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  
  try {
    const response = await authService.forgotPassword(email.value);
    successMsg.value = 'Se han enviado las instrucciones a tu correo.';
    email.value = '';
  } catch (error: any) {
    errorMsg.value = error.response?.data?.error || 'Error procesando la solicitud.';
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
          <h2 class="auth-title">Recuperar Contraseña</h2>
          <p class="auth-description">Ingresa tu correo y te enviaremos un enlace temporal.</p>
        </template>

        <div class="form-content">
          <UiAlert v-if="errorMsg" type="error">{{ errorMsg }}</UiAlert>
          <UiAlert v-if="successMsg" type="success">{{ successMsg }}</UiAlert>

          <UiInput
            v-if="!successMsg"
            v-model="email"
            label="Correo electrónico"
            type="email"
            placeholder="nombre@empresa.com"
            required
          />
        </div>

        <template #footer>
          <UiButton v-if="!successMsg" type="submit" :loading="isLoading">
            Enviar Instrucciones
          </UiButton>
          
          <div class="auth-footer-links">
            <p><router-link to="/login">Volver al inicio de sesión</router-link></p>
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
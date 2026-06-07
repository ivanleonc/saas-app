<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  email: '',
  password: ''
});

const handleLogin = async () => {
  try {
    await authStore.login({ email: form.email, password: form.password });
    router.push('/dashboard');
  } catch (error) {
    // Error manejado por Pinia
  }
};
</script>
<template>
  <div class="auth-wrapper">
    <form @submit.prevent="handleLogin" style="width: 100%; max-width: 400px;">
      <UiCard>
        
        <template #header>
          <h2 class="auth-title">Iniciar Sesión</h2>
          <p class="auth-description">Ingresa tus credenciales para acceder a tu cuenta.</p>
        </template>

        <div class="form-content">
          <UiAlert v-if="authStore.error">
            {{ authStore.error }}
          </UiAlert>

          <UiInput
            v-model="form.email"
            label="Correo electrónico"
            type="email"
            placeholder="nombre@empresa.com"
            required
          />

          <UiInput
            v-model="form.password"
            label="Contraseña"
            type="password"
            required
          />
        </div>

        <template #footer>
          <UiButton type="submit" :loading="authStore.isLoading">
            Ingresar
          </UiButton>
          
          <div class="auth-footer-links">
            <p style="margin-bottom: 0.5rem;"><router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link></p>
            <p>¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link></p>
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

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1;
  margin: 0;
  color: var(--text-main);
}

.auth-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-footer-links {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.auth-footer-links a {
  color: var(--text-main);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
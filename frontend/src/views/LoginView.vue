<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import AuthLayout from '@/layouts/AuthLayout.vue';
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
  <AuthLayout>
    <form @submit.prevent="handleLogin" class="auth-form">
      <UiCard>
        <template #header>
          <h2 class="auth-title">Iniciar Sesión</h2>
          <p class="auth-description">Ingresa tus credenciales para acceder a tu cuenta.</p>
        </template>

        <div class="form-body">
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
            <p><router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link></p>
            <p>¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link></p>
          </div>
        </template>
      </UiCard>
    </form>
  </AuthLayout>
</template>

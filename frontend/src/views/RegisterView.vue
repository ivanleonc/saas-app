<template>
  <AuthLayout>
    <form @submit.prevent="handleRegister" class="auth-form">
      <UiCard>
        <template #header>
          <h2 class="auth-title">Crear Cuenta</h2>
          <p class="auth-description">Ingresa los datos de tu empresa para comenzar.</p>
        </template>

        <div class="form-body">
          <UiAlert v-if="authStore.error">
            {{ authStore.error }}
          </UiAlert>

          <UiInput
            v-model="form.name"
            label="Nombre de la Empresa"
            type="text"
            placeholder="Acme Corp"
            required
          />

          <UiInput
            v-model="form.email"
            label="Correo electrónico"
            type="email"
            placeholder="contacto@acme.com"
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
            Registrarse
          </UiButton>
          
          <div class="auth-footer-links">
            <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></p>
          </div>
        </template>
      </UiCard>
    </form>
  </AuthLayout>
</template>

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
  name: '',
  email: '',
  password: ''
});

const handleRegister = async () => {
  try {
    await authStore.register({ 
      name: form.name, 
      email: form.email, 
      password: form.password 
    });
    const tenantId = authStore.activeTenantId || authStore.user?.tenants?.[0]?.id;
    router.push(`/companies/${tenantId}/dashboard`);
  } catch (error) {
    // Error manejado por Pinia
  }
};
</script>

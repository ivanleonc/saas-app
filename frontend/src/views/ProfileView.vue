<template>
  <AuthenticatedLayout>
    <div class="profile-container">
      <div class="page-header">
        <h1 class="page-title">Mi Cuenta</h1>
        <p class="page-subtitle">Gestiona tu información personal de acceso y credenciales.</p>
      </div>

      <div class="form-section">
        <form @submit.prevent="handleSave">
          <UiCard>
            <template #header>
              <h3 class="card-title">Datos del Perfil</h3>
            </template>

            <div class="form-body">
              <UiAlert v-if="errorMessage" type="error">{{ errorMessage }}</UiAlert>
              <UiAlert v-if="successMessage" type="success">{{ successMessage }}</UiAlert>

              <UiInput v-model="form.name" label="Nombre Completo" required />
              <UiInput v-model="form.email" label="Correo Electrónico" type="email" required />
              
              <UiInput 
                v-model="form.password" 
                label="Nueva Contraseña (Dejar en blanco para no cambiar)" 
                type="password" 
                placeholder="******" 
              />
            </div>

            <template #footer>
              <UiButton type="submit" :loading="isSaving">Guardar Cambios</UiButton>
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
import { userService } from '@/services/user.service';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const authStore = useAuthStore();

const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref('');

const form = reactive({
  name: '',
  email: '',
  password: ''
});

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name;
    form.email = authStore.user.email;
  }
});

const handleSave = async () => {
  isSaving.value = true;
  errorMessage.value = null;
  successMessage.value = '';

  try {
    const response = await userService.updateProfile({
      name: form.name,
      email: form.email,
      password: form.password || undefined
    });

    // Actualizamos Pinia y LocalStorage con los datos devueltos por el backend
    authStore.updateProfileData({
      name: response.data.name,
      email: response.data.email
    });

    form.password = ''; // Limpiamos el campo visual de la contraseña
    successMessage.value = '¡Tu perfil ha sido actualizado con éxito!';
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Error al actualizar el perfil';
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.profile-container { display: flex; flex-direction: column; gap: 2rem; max-width: 600px; }
.page-title { margin: 0; font-size: 1.875rem; font-weight: 600; color: var(--text-main); letter-spacing: -0.025em; }
.page-subtitle { margin: 0.5rem 0 0; color: var(--text-muted); }
.card-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-main); }
.form-body { display: flex; flex-direction: column; gap: 1rem; }
</style>
<template>
  <AuthenticatedLayout>
    <div class="settings-container">
      <div class="page-header">
        <h1 class="page-title">Configuración de la Empresa</h1>
        <p class="page-subtitle">Administra la información general y fiscal de tu organización.</p>
      </div>

      <div class="form-section">
        <form @submit.prevent="handleSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">Perfil de la Empresa</h3>
            </template>
            
            <div class="form-body">
              <UiAlert v-if="companyStore.error" type="error">{{ companyStore.error }}</UiAlert>
              <UiAlert v-if="successMessage" type="success">{{ successMessage }}</UiAlert>
              
              <UiInput 
                v-model="form.name" 
                label="Nombre de la Empresa" 
                required 
              />
              
              <UiInput 
                v-model="form.tax_id" 
                label="Tax ID / NIT / RFC" 
                placeholder="Ej. TAX-12345" 
              />
            </div>

            <template #footer>
              <UiButton type="submit" :loading="companyStore.isLoading">
                Guardar Cambios
              </UiButton>
            </template>
          </UiCard>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useCompanyStore } from '@/stores/company.store';
import { useAuthStore } from '@/stores/auth.store';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const companyStore = useCompanyStore();
const authStore = useAuthStore();

const successMessage = ref('');
const form = reactive({
  name: '',
  tax_id: ''
});

// Precargar datos de la empresa en el formulario
const loadCompanyData = () => {
  const activeId = authStore.activeTenantId;
  if (activeId && authStore.user) {
    const currentCompany = authStore.user.tenants.find((t: any) => t.id === activeId);
    if (currentCompany) {
      form.name = currentCompany.name;
      form.tax_id = currentCompany.tax_id || '';
    }
  }
};

onMounted(() => {
  loadCompanyData();
});

// Reactividad: Si cambias de empresa en el Sidebar mientras estás en Settings
watch(() => authStore.activeTenantId, () => {
  loadCompanyData();
  successMessage.value = '';
  companyStore.error = null;
});

const handleSubmit = async () => {
  successMessage.value = '';
  if (!authStore.activeTenantId) return;

  try {
    await companyStore.updateCompany(authStore.activeTenantId, {
      name: form.name,
      tax_id: form.tax_id
    });
    
    successMessage.value = '¡Los datos se actualizaron correctamente!';
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (error) {
    // El error es manejado visualmente por la UiAlert vinculada a companyStore.error
  }
};
</script>

<style scoped>
.settings-container { display: flex; flex-direction: column; gap: 2rem; max-width: 600px; }
.page-title { margin: 0; font-size: 1.875rem; font-weight: 600; color: var(--text-main); letter-spacing: -0.025em; }
.page-subtitle { margin: 0.5rem 0 0; color: var(--text-muted); }
.card-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-main); }
.form-body { display: flex; flex-direction: column; gap: 1rem; }
</style>
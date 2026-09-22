<template>
  <AuthenticatedLayout>
    <div class="settings-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Configuracion de la Empresa</h1>
          <p class="page-subtitle">Administra la informacion general y fiscal de tu organizacion.</p>
        </div>
        <UiButton v-permission="Permissions.COMPANY.UPDATE" @click="openEditModal" width="auto">
          <IconEdit :size="16" /> Editar Empresa
        </UiButton>
      </div>

      <UiCard>
        <template #header>
          <h3 class="card-title">Perfil de la Empresa</h3>
        </template>

        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Nombre</span>
            <span class="info-value">{{ companyName || '---' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tax ID / NIT / RFC</span>
            <span class="info-value">{{ companyTaxId || 'No configurado' }}</span>
          </div>
        </div>
      </UiCard>

      <!-- Edit Modal -->
      <UiModal v-model="isEditModalOpen">
        <form @submit.prevent="handleSubmit">
          <UiCard>
            <template #header>
              <h3 class="card-title">Editar Empresa</h3>
              <p class="card-description">Actualiza la informacion de tu organizacion.</p>
            </template>
            
            <div class="form-body">
              <UiAlert v-if="companyStore.error" type="error">{{ companyStore.error }}</UiAlert>

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
              <div class="modal-footer">
                <UiButton type="button" variant="outline" @click="isEditModalOpen = false">
                  Cancelar
                </UiButton>
                <UiButton type="submit" :loading="companyStore.isLoading">
                  Guardar Cambios
                </UiButton>
              </div>
            </template>
          </UiCard>
        </form>
      </UiModal>
    </div>
  </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useCompanyStore } from '@/stores/company.store';
import { useAuthStore } from '@/stores/auth.store';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';
import UiModal from '@/components/ui/UiModal.vue';
import { IconEdit } from '@tabler/icons-vue';
import { useToast } from '@/composables/useToast';
import { Permissions } from '@/constants/permissions';

const companyStore = useCompanyStore();
const authStore = useAuthStore();
const toast = useToast();

const isEditModalOpen = ref(false);
const form = reactive({
  name: '',
  tax_id: ''
});

const companyName = computed(() => {
  const activeId = authStore.activeTenantId;
  if (activeId && authStore.user) {
    const company = authStore.user.tenants.find((t: any) => t.id === activeId);
    return company?.name;
  }
  return '';
});

const companyTaxId = computed(() => {
  const activeId = authStore.activeTenantId;
  if (activeId && authStore.user) {
    const company = authStore.user.tenants.find((t: any) => t.id === activeId);
    return company?.tax_id;
  }
  return '';
});

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

watch(() => authStore.activeTenantId, () => {
  loadCompanyData();
  companyStore.error = null;
});

const openEditModal = () => {
  loadCompanyData();
  companyStore.error = null;
  isEditModalOpen.value = true;
};

const handleSubmit = async () => {
  if (!authStore.activeTenantId) return;

  try {
    await companyStore.updateCompany(authStore.activeTenantId, {
      name: form.name,
      tax_id: form.tax_id
    });

    isEditModalOpen.value = false;
    toast.success('Empresa actualizada correctamente');
  } catch (error) {
    // Error manejado por UiAlert
  }
};
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.info-grid {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 500;
}

.info-value {
  font-size: var(--text-sm);
  color: var(--text-main);
  font-weight: 600;
}

.modal-footer { display: flex; gap: var(--space-2); width: 100%; }
</style>

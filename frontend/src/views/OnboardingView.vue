<template>
  <AuthLayout>
    <form @submit.prevent="handleSubmit" class="auth-form">
      <UiCard>
        <template #header>
          <h2 class="auth-title">Crea tu primera organización</h2>
          <p class="auth-description">Necesitas un espacio de trabajo para empezar. Podrás crear más después.</p>
        </template>

        <div class="form-body">
          <UiAlert v-if="companyStore.error" type="error">
            {{ companyStore.error }}
          </UiAlert>

          <UiInput
            v-model="form.name"
            label="Nombre de la organización"
            type="text"
            placeholder="Acme Corp"
            autocomplete="organization"
            required
          />

          <UiInput
            v-model="form.tax_id"
            label="Tax ID / NIT / RFC (Opcional)"
            type="text"
            placeholder="Ej. TAX-12345"
          />
        </div>

        <template #footer>
          <UiButton type="submit" :loading="companyStore.isLoading">
            Crear Organización
          </UiButton>
        </template>
      </UiCard>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useCompanyStore } from '@/stores/company.store';
import AuthLayout from '@/layouts/AuthLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiAlert from '@/components/ui/UiAlert.vue';

const router = useRouter();
const authStore = useAuthStore();
const companyStore = useCompanyStore();

const form = reactive({
  name: '',
  tax_id: ''
});

onMounted(() => {
  const tenantId = authStore.activeTenantId || authStore.user?.tenants?.[0]?.id;
  if (tenantId) {
    router.replace(`/companies/${tenantId}/dashboard`);
  }
});

const handleSubmit = async () => {
  try {
    await companyStore.createCompany({
      name: form.name.trim(),
      tax_id: form.tax_id.trim() || undefined
    });
    const tenantId = authStore.activeTenantId;
    if (tenantId) {
      router.push(`/companies/${tenantId}/dashboard`);
    }
  } catch (error) {
    // Error manejado por el store (UiAlert)
  }
};
</script>

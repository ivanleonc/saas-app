<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';

const authStore = useAuthStore();
</script>
<template>
  <AuthenticatedLayout>
    <div class="dashboard-content">
      <h1 class="page-title">Resumen</h1>
      <p class="page-subtitle">Bienvenido de nuevo, {{ authStore.user?.name }}.</p>
      
      </div>
  </AuthenticatedLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--text-main);
}
.page-subtitle {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
}
</style>
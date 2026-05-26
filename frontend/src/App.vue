<template>
  <router-view :key="$route.path + '-' + (authStore.activeTenantId || 'public')" />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

// Instanciamos el store globalmente para escuchar la empresa activa
const authStore = useAuthStore();
</script>

<style>
/* Reseteo básico o estilos base que afecten toda la app */
html, body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f3f4f6;
}
</style>
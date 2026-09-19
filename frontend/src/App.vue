<template>
  <router-view :key="routeKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/composables/useTheme';

const route = useRoute();
const authStore = useAuthStore();
useTheme();

const routeKey = computed(() => route.path + '-' + (authStore.activeTenantId || 'public'));
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
</style>

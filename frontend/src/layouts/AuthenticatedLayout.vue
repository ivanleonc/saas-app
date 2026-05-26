<template>
  <div class="layout-container">
    
    <AppSidebar />

    <main class="main-content">
      <header class="content-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); cursor: pointer;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
      </header>
      
      <div class="content-body">
        <slot></slot> 
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
</script>

<style scoped>
/* Aquí queda SOLO el CSS del contenedor principal (layout-container, main-content, etc) */
.layout-container { display: flex; height: 100vh; width: 100vw; overflow: hidden; background-color: var(--bg-app); }
.main-content { flex: 1; display: flex; flex-direction: column; background-color: var(--bg-card); }
.content-header { height: 52px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 1.5rem; }
.content-body { flex: 1; padding: 2rem; overflow-y: auto; }
</style>
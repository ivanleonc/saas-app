<template>
  <div class="layout-container">
    
    <AppSidebar />

    <main class="main-content">
      <header class="content-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); cursor: pointer; margin-right: 1rem;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        
        <nav class="breadcrumb">
          <ol>
            <li v-for="(item, index) in breadcrumbs" :key="index">
              <router-link v-if="!item.isLast" :to="item.url" class="breadcrumb-link">
                {{ item.name }}
              </router-link>
              <span v-else class="breadcrumb-current">{{ item.name }}</span>
              <svg v-if="!item.isLast" class="breadcrumb-separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </li>
          </ol>
        </nav>

      </header>
      
      <div class="content-body">
        <slot></slot> 
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';

const route = useRoute();

// Lógica para construir las migas de pan basadas en la URL actual
const breadcrumbs = computed(() => {
  // Separamos la URL (ej: /dashboard/members -> ['dashboard', 'members'])
  const paths = route.path.split('/').filter(p => p);
  
  return paths.map((path, index) => {
    // Reconstruimos la URL hasta este nivel
    const url = '/' + paths.slice(0, index + 1).join('/');
    
    // Capitalizamos la primera letra y traducimos rutas comunes
    let name = path.charAt(0).toUpperCase() + path.slice(1);
    if (name === 'Members') name = 'Miembros';
    if (name === 'Settings') name = 'Configuración';
    if (name === 'Roles') name = 'Roles y Permisos';
    
    return { name, url, isLast: index === paths.length - 1 };
  });
});
</script>

<style scoped>
.layout-container { display: flex; height: 100vh; width: 100vw; overflow: hidden; background-color: var(--bg-app); }
.main-content { flex: 1; display: flex; flex-direction: column; background-color: var(--bg-card); }
.content-header { height: 52px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 1.5rem; }
.content-body { flex: 1; padding: 2rem; overflow-y: auto; }

/* ESTILOS DEL BREADCRUMB */
.breadcrumb { display: flex; align-items: center; }
.breadcrumb ol { display: flex; align-items: center; list-style: none; margin: 0; padding: 0; }
.breadcrumb li { display: flex; align-items: center; }
.breadcrumb-link { color: var(--text-muted); text-decoration: none; font-size: 0.875rem; transition: color 0.2s; }
.breadcrumb-link:hover { color: var(--text-main); }
.breadcrumb-current { color: var(--text-main); font-weight: 500; font-size: 0.875rem; }
.breadcrumb-separator { color: var(--border); margin: 0 0.5rem; }
</style>
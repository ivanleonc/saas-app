<template>
  <div class="layout-container">
    <div class="app-window">
      <AppSidebar />

      <div class="main-wrapper">
        <aside class="left-nav">
          <div class="left-nav-top">
            <button class="icon-btn theme-toggle" @click="toggleTheme">
              <svg v-if="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
          </div>
          
          <div class="left-nav-center">
            <router-link to="/dashboard" class="nav-icon-link" exact-active-class="active">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </router-link>
            <router-link to="/dashboard/members" class="nav-icon-link" active-class="active">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </router-link>
            <router-link to="/dashboard/roles" class="nav-icon-link" active-class="active" v-permission="'roles:read'">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M4 21v-2a4 4 0 0 1 3-3.87"></path><path d="M8 3.13a4 4 0 0 0 0 7.75"></path></svg>
            </router-link>
            <router-link to="/dashboard/settings" class="nav-icon-link" active-class="active">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </router-link>
          </div>

          <div class="left-nav-bottom">
            <button class="icon-btn help-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </button>
            <div class="avatar-small">
              <img v-if="userAvatar" :src="userAvatar" alt="User" />
              <span v-else>{{ userInitials }}</span>
            </div>
          </div>
        </aside>

        <main class="main-content">
          <header class="content-header" v-if="breadcrumbs.length > 1">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import AppSidebar from '@/components/layout/AppSidebar.vue';

const route = useRoute();
const authStore = useAuthStore();
const isDarkMode = ref(false);

const userInitials = computed(() => {
  const name = authStore.user?.name || 'U';
  return name.substring(0, 2).toUpperCase();
});

const userAvatar = computed(() => {
  // Placeholder para cuando agreguemos avatar real al usuario
  return authStore.user?.avatar || null;
});

// Lógica de Modo Oscuro
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
});

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
.layout-container { 
  display: flex; 
  height: 100vh; 
  width: 100vw; 
  overflow: hidden; 
  background-color: var(--bg-app);
}

.app-window {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--bg-card);
  overflow: hidden;
}

.main-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* LEFT NAVIGATION MENU (MOCKUP STYLE) */
.left-nav {
  width: 72px;
  background-color: var(--bg-nav);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  z-index: 10;
}

.left-nav-top, .left-nav-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.left-nav-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  padding: 0;
}
.icon-btn:hover { color: var(--primary); }

.nav-icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  color: var(--text-muted);
  transition: all 0.2s;
}

.nav-icon-link:hover {
  background-color: var(--nav-icon-bg-hover);
  color: var(--primary);
}

.nav-icon-link.active {
  background-color: var(--nav-icon-active);
  color: var(--nav-icon-active-text);
  box-shadow: var(--btn-shadow);
}

.avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #a855f7;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--bg-card);
  box-shadow: 0 0 0 1px var(--border);
}
.avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  background-color: var(--bg-app); 
  border-top-left-radius: 1.5rem; /* Corner effect based on mockup */
  overflow: hidden;
}

.content-header { 
  height: 52px; 
  display: flex; 
  align-items: center; 
  padding: 0 1.5rem; 
}

.content-body { 
  flex: 1; 
  padding: 1.5rem; 
  overflow-y: auto; 
}

/* ESTILOS DEL BREADCRUMB */
.breadcrumb { display: flex; align-items: center; }
.breadcrumb ol { display: flex; align-items: center; list-style: none; margin: 0; padding: 0; }
.breadcrumb li { display: flex; align-items: center; }
.breadcrumb-link { color: var(--text-muted); text-decoration: none; font-size: 0.875rem; transition: color 0.2s; }
.breadcrumb-link:hover { color: var(--primary); }
.breadcrumb-current { color: var(--primary); font-weight: 600; font-size: 0.875rem; }
.breadcrumb-separator { color: var(--border); margin: 0 0.5rem; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .left-nav {
    display: none; /* Hide on mobile, relying on topbar mobile menu */
  }
  .main-content {
    border-top-left-radius: 0;
  }
}
</style>
<template>
  <div class="layout-container">
    <div class="app-window">
      <AppSidebar />

      <div class="main-wrapper">
        <aside class="left-nav">
          <div class="left-nav-top">
            <button class="icon-btn theme-toggle" @click="toggleTheme">
              <IconSun v-if="!isDarkMode" :size="20" stroke-width="2" />
              <IconMoon v-else :size="20" stroke-width="2" />
            </button>
          </div>
          
          <div class="left-nav-center">
            <router-link to="/dashboard" class="nav-icon-link" exact-active-class="active">
              <IconLayoutDashboard :size="22" stroke-width="1.8" />
            </router-link>
            <router-link to="/dashboard/members" class="nav-icon-link" active-class="active">
              <IconUsers :size="22" stroke-width="1.8" />
            </router-link>
            <router-link to="/dashboard/roles" class="nav-icon-link" active-class="active" v-permission="'roles:read'">
              <IconShieldLock :size="22" stroke-width="1.8" />
            </router-link>
            <router-link to="/dashboard/settings" class="nav-icon-link" active-class="active">
              <IconSettings :size="22" stroke-width="1.8" />
            </router-link>
          </div>

          <div class="left-nav-bottom">
            <button class="icon-btn help-btn">
              <IconHelpCircle :size="22" stroke-width="1.8" />
            </button>
            <div class="avatar-small">
              <img v-if="userAvatar" :src="userAvatar" alt="User" />
              <span v-else>{{ userInitials }}</span>
            </div>
          </div>
        </aside>

        <main class="main-content">
          <header class="content-header" v-if="breadcrumbs.length > 1">
            <IconLayoutSidebar :size="20" stroke-width="2" style="color: var(--text-muted); cursor: pointer; margin-right: 1rem;" />
            
            <nav class="breadcrumb">
              <ol>
                <li v-for="(item, index) in breadcrumbs" :key="index">
                  <router-link v-if="!item.isLast" :to="item.url" class="breadcrumb-link">
                    {{ item.name }}
                  </router-link>
                  <span v-else class="breadcrumb-current">{{ item.name }}</span>
                  <IconChevronRight v-if="!item.isLast" class="breadcrumb-separator" :size="16" stroke-width="2" />
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
import { 
  IconSun, 
  IconMoon, 
  IconLayoutDashboard, 
  IconUsers, 
  IconShieldLock, 
  IconSettings, 
  IconHelpCircle,
  IconLayoutSidebar,
  IconChevronRight
} from '@tabler/icons-vue';

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
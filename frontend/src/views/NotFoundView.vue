<template>
  <AuthLayout>
    <UiCard>
      <template #header>
        <div class="not-found-hero">
          <h2 class="auth-title">404</h2>
          <p class="auth-description">La página que buscas no existe o fue movida.</p>
        </div>
      </template>

      <template #footer>
        <UiButton type="button" @click="goHome">
          Volver al inicio de sesión
        </UiButton>

        <div class="auth-footer-links">
          <p>¿No tienes cuenta? <router-link to="/register">Regístrate</router-link></p>
        </div>
      </template>
    </UiCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiButton from '@/components/ui/UiButton.vue';

const router = useRouter();

const goHome = () => {
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.not-found-hero {
  text-align: center;
}

.not-found-hero .auth-title {
  font-size: 3rem;
  line-height: 1;
}
</style>

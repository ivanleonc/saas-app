<template>
  <div class="not-found">
    <h1 class="not-found-title">404</h1>
    <p class="not-found-text">La página que buscas no existe.</p>
    <router-link to="/" class="not-found-link">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8);
  background-color: var(--bg-app);
}

.not-found-title {
  font-size: 4rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.025em;
  line-height: 1;
  margin-bottom: var(--space-4);
}

.not-found-text {
  font-size: var(--text-base);
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.not-found-link {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-main);
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.15s;
}

.not-found-link:hover {
  color: var(--accent-blue);
}
</style>

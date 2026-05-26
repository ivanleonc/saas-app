<template>
  <div class="ui-card">
    <div v-if="$slots.header" class="ui-card-header">
      <slot name="header"></slot>
    </div>
    
    <div class="ui-card-content">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="ui-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.ui-card {
  width: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.ui-card-header {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 0.375rem;
}

.ui-card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Ajuste de padding si hay cabecera previa para evitar excesos de espacio */
.ui-card-header + .ui-card-content {
  padding-top: 0;
}

.ui-card-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
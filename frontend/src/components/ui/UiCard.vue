<template>
  <div class="ui-card" :class="{ 'ui-card-hover': hoverable }">
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

<script setup lang="ts">
withDefaults(defineProps<{
  hoverable?: boolean;
}>(), {
  hoverable: false,
});
</script>

<style scoped>
.ui-card {
  width: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.ui-card-hover:hover {
  border-color: var(--text-light);
  box-shadow: var(--shadow);
}

.ui-card-header {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;
  gap: 0.25rem;
}

.ui-card-content {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ui-card-header + .ui-card-content {
  padding-top: 0;
}

.ui-card-footer {
  padding: 0 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>

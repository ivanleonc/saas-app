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
  padding: var(--space-5) var(--space-6);
  gap: var(--space-1);
}

.ui-card-content {
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ui-card-header + .ui-card-content {
  padding-top: 0;
}

.ui-card-footer {
  padding: 0 var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>

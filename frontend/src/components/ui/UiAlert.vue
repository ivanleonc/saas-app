<template>
  <div :class="['ui-alert', `ui-alert-${type}`]">
    <IconAlertCircle v-if="type === 'error'" class="alert-icon" :size="16" stroke-width="2" />
    <IconCircleCheck v-else-if="type === 'success'" class="alert-icon" :size="16" stroke-width="2" />
    <div class="alert-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-vue';

withDefaults(defineProps<{
  type?: 'error' | 'success';
}>(), {
  type: 'error'
});
</script>

<style scoped>
.ui-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.ui-alert-error {
  background-color: var(--danger-bg, #fef2f2);
  color: var(--danger-text, #991b1b);
  border: 1px solid var(--danger-border, #fecaca);
}

.ui-alert-success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.alert-content {
  line-height: 1.25;
}
</style>
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="ui-button"
    :class="[
      `variant-${variant}`,
      { 'btn-sm': size === 'sm', 'btn-icon': icon, 'btn-auto': width === 'auto' }
    ]"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  icon?: boolean;
  width?: 'full' | 'auto';
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  loading: false,
  variant: 'primary',
  size: 'md',
  icon: false,
  width: 'full',
});
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  padding: 0 var(--space-4);
  width: 100%;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  gap: var(--space-2);
  border: 1px solid transparent;
  line-height: 1;
}

.btn-auto {
  width: auto;
}

.btn-sm {
  height: 1.875rem;
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
}

.btn-icon {
  width: 2.25rem;
  padding: 0;
}

/* Primary */
.variant-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.variant-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

/* Outline */
.variant-outline {
  background-color: transparent;
  color: var(--text-main);
  border-color: var(--border);
}
.variant-outline:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--text-light);
}

/* Danger */
.variant-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: var(--color-danger-border);
}
.variant-danger:hover:not(:disabled) {
  background-color: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

/* Ghost */
.variant-ghost {
  background-color: transparent;
  color: var(--text-muted);
  border-color: transparent;
}
.variant-ghost:hover:not(:disabled) {
  background-color: var(--bg-hover);
  color: var(--text-main);
}

.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

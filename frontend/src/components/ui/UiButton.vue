<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="ui-button"
    :class="`variant-${variant}`"
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
  variant?: 'primary' | 'outline' | 'danger';
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  loading: false,
  variant: 'primary'
});
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  gap: 0.5rem;
}

/* Primary Variant (Default) */
.variant-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border: 1px solid transparent;
}
.variant-primary:hover {
  background-color: var(--primary-hover);
}

/* Outline Variant */
.variant-outline {
  background-color: transparent;
  color: var(--text-main);
  border: 1px solid var(--border);
}
.variant-outline:hover {
  background-color: var(--nav-icon-bg-hover);
}

/* Danger Variant */
.variant-danger {
  background-color: var(--danger-bg);
  color: var(--danger-text);
  border: 1px solid var(--danger-border);
}
.variant-danger:hover {
  background-color: var(--danger-border);
  color: white;
}

.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
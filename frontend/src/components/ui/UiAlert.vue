<template>
  <div class="ui-alert">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <div class="alert-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.ui-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--danger-bg);
  color: var(--danger-text);
  border: 1px solid var(--danger-border);
}

.alert-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.alert-content {
  line-height: 1.25;
}
</style>
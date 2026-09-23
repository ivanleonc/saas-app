<template>
  <div class="ui-search">
    <IconSearch :size="15" stroke-width="1.8" class="ui-search-icon" />
    <input
      v-model="model"
      type="text"
      class="ui-search-input"
      :placeholder="placeholder"
      :aria-label="ariaLabel || placeholder"
    />
    <button
      v-if="model"
      type="button"
      class="ui-search-clear"
      @click="model = ''"
      aria-label="Limpiar búsqueda"
    >
      <IconX :size="14" stroke-width="2" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconSearch, IconX } from '@tabler/icons-vue';

withDefaults(defineProps<{
  placeholder?: string;
  ariaLabel?: string;
}>(), {
  placeholder: 'Buscar...',
  ariaLabel: '',
});

const model = defineModel<string>({ default: '' });
</script>

<style scoped>
.ui-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.ui-search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--text-muted);
  pointer-events: none;
  flex-shrink: 0;
}

.ui-search-input {
  height: 2rem;
  width: 100%;
  padding: 0 2rem 0 2.25rem;
  font-size: var(--text-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-app);
  color: var(--text-main);
  outline: none;
}
.ui-search-input:focus {
  border-color: var(--text-main);
  box-shadow: 0 0 0 1px var(--text-main);
}
.ui-search-input::placeholder {
  color: var(--text-muted);
}

.ui-search-clear {
  position: absolute;
  right: var(--space-1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
}
.ui-search-clear:hover {
  background-color: var(--bg-hover);
  color: var(--text-main);
}
</style>

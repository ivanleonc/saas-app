<template>
  <button
    type="button"
    :class="['ui-dropdown-item', { danger }]"
    role="menuitem"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { inject } from 'vue';

withDefaults(defineProps<{
  danger?: boolean;
}>(), {
  danger: false,
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const closeDropdown = inject<() => void>('ui-dropdown-close', () => {});

const handleClick = () => {
  emit('click');
  closeDropdown();
};
</script>

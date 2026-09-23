<template>
  <p v-if="message" :id="id" class="ui-field-error" role="alert">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
defineProps<{
  message?: string | null;
  id?: string;
}>();
</script>

<style scoped>
.ui-field-error {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-danger);
  line-height: 1.4;
}
</style>

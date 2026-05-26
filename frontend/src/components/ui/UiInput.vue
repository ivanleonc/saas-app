<template>
  <div class="input-group">
    <label v-if="label" :for="id" class="ui-label">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      class="ui-input"
    />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';

// Definición de Props genéricas y configurables
interface Props {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false
});

// Vinculación automática bidireccional del v-model externo
const model = defineModel<string>({ default: '' });

// Genera un ID único autogestionado para el label/input si no se provee
const id = useId();
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ui-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
  line-height: 1;
}

.ui-input {
  display: flex;
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background-color: transparent;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--text-main);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.ui-input::placeholder {
  color: var(--text-muted);
}

.ui-input:focus {
  border-color: var(--text-main);
  box-shadow: 0 0 0 1px var(--text-main);
}
</style>
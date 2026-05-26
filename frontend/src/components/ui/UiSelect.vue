<template>
  <div class="ui-select-wrapper">
    <label v-if="label" class="ui-label">
      {{ label }} <span v-if="required" class="required-mark">*</span>
    </label>
    
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="ui-select"
      :required="required"
      :disabled="disabled"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  options: { label: string; value: string | number }[];
  required?: boolean;
  disabled?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.ui-select-wrapper { display: flex; flex-direction: column; gap: 0.375rem; width: 100%; }
.ui-label { font-size: 0.875rem; font-weight: 500; color: var(--text-main); }
.required-mark { color: #ef4444; }
.ui-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background-color: var(--bg-card);
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none; /* Quitamos la flecha nativa fea en algunos navegadores */
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 0.65rem auto;
}
.ui-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.ui-select:disabled { background-color: #f3f4f6; cursor: not-allowed; }
</style>
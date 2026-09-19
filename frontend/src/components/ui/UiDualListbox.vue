<template>
  <div class="dual-listbox">
    <label v-if="label" class="ui-label">{{ label }}</label>

    <div class="dual-listbox-container">
      <!-- Available -->
      <div class="listbox-panel">
        <div class="panel-header">
          <span class="panel-title">{{ availableLabel }}</span>
          <span class="panel-count">{{ filteredAvailable.length }}</span>
        </div>
        <div class="panel-search">
          <input
            v-model="searchAvailable"
            type="text"
            class="panel-search-input"
            :placeholder="searchPlaceholder"
          />
        </div>
        <ul class="panel-list">
          <li
            v-for="item in filteredAvailable"
            :key="item.id"
            class="panel-item"
            :class="{ selected: tempAvailable.includes(item.id) }"
            @click="toggleTempAvailable(item.id)"
            @dblclick="moveToSelected([item.id])"
          >
            <span class="item-label">{{ item.label }}</span>
            <span v-if="item.description" class="item-description">{{ item.description }}</span>
          </li>
          <li v-if="filteredAvailable.length === 0" class="panel-empty">Sin resultados</li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="listbox-actions">
        <button
          type="button"
          class="action-btn"
          :disabled="tempAvailable.length === 0"
          title="Mover seleccionados a la derecha"
          @click="moveToSelected(tempAvailable)"
        >
          <IconChevronRight :size="16" />
        </button>
        <button
          type="button"
          class="action-btn"
          :disabled="tempSelected.length === 0"
          title="Mover seleccionados a la izquierda"
          @click="moveToAvailable(tempSelected)"
        >
          <IconChevronLeft :size="16" />
        </button>
        <div class="action-divider" />
        <button
          type="button"
          class="action-btn"
          :disabled="available.length === 0"
          title="Mover todos a la derecha"
          @click="moveAllToSelected"
        >
          <IconChevronsRight :size="16" />
        </button>
        <button
          type="button"
          class="action-btn"
          :disabled="selected.length === 0"
          title="Mover todos a la izquierda"
          @click="moveAllToAvailable"
        >
          <IconChevronsLeft :size="16" />
        </button>
      </div>

      <!-- Selected -->
      <div class="listbox-panel">
        <div class="panel-header">
          <span class="panel-title">{{ selectedLabel }}</span>
          <span class="panel-count">{{ filteredSelected.length }}</span>
        </div>
        <div class="panel-search">
          <input
            v-model="searchSelected"
            type="text"
            class="panel-search-input"
            :placeholder="searchPlaceholder"
          />
        </div>
        <ul class="panel-list">
          <li
            v-for="item in filteredSelected"
            :key="item.id"
            class="panel-item selected"
            :class="{ 'temp-selected': tempSelected.includes(item.id) }"
            @click="toggleTempSelected(item.id)"
            @dblclick="moveToAvailable([item.id])"
          >
            <span class="item-label">{{ item.label }}</span>
            <span v-if="item.description" class="item-description">{{ item.description }}</span>
          </li>
          <li v-if="filteredSelected.length === 0" class="panel-empty">Sin resultados</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IconChevronRight, IconChevronLeft, IconChevronsRight, IconChevronsLeft } from '@tabler/icons-vue';

export interface DualListboxItem {
  id: string;
  label: string;
  description?: string;
}

interface Props {
  modelValue: string[];
  available: DualListboxItem[];
  selected: DualListboxItem[];
  label?: string;
  availableLabel?: string;
  selectedLabel?: string;
  searchPlaceholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  availableLabel: 'Disponibles',
  selectedLabel: 'Seleccionados',
  searchPlaceholder: 'Buscar...',
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const searchAvailable = ref('');
const searchSelected = ref('');
const tempAvailable = ref<string[]>([]);
const tempSelected = ref<string[]>([]);

const filteredAvailable = computed(() => {
  const q = searchAvailable.value.toLowerCase();
  return props.available.filter(
    (item) => !props.modelValue.includes(item.id) && item.label.toLowerCase().includes(q)
  );
});

const filteredSelected = computed(() => {
  const q = searchSelected.value.toLowerCase();
  return props.selected.filter(
    (item) => props.modelValue.includes(item.id) && item.label.toLowerCase().includes(q)
  );
});

function toggleTempAvailable(id: string) {
  const idx = tempAvailable.value.indexOf(id);
  if (idx >= 0) tempAvailable.value.splice(idx, 1);
  else tempAvailable.value.push(id);
}

function toggleTempSelected(id: string) {
  const idx = tempSelected.value.indexOf(id);
  if (idx >= 0) tempSelected.value.splice(idx, 1);
  else tempSelected.value.push(id);
}

function moveToSelected(ids: string[]) {
  const newVal = [...props.modelValue, ...ids];
  emit('update:modelValue', newVal);
  tempAvailable.value = tempAvailable.value.filter((id) => !ids.includes(id));
}

function moveToAvailable(ids: string[]) {
  const newVal = props.modelValue.filter((id) => !ids.includes(id));
  emit('update:modelValue', newVal);
  tempSelected.value = tempSelected.value.filter((id) => !ids.includes(id));
}

function moveAllToSelected() {
  const allIds = filteredAvailable.value.map((i) => i.id);
  emit('update:modelValue', [...props.modelValue, ...allIds]);
  tempAvailable.value = [];
}

function moveAllToAvailable() {
  const keepIds = filteredAvailable.value.map((i) => i.id);
  emit('update:modelValue', keepIds);
  tempSelected.value = [];
}
</script>

<style scoped>
.dual-listbox {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.dual-listbox-container {
  display: flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  overflow: hidden;
}

.listbox-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.listbox-panel:first-child {
  border-right: 1px solid var(--border);
}

.listbox-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-1) 6px;
  background: var(--bg-app);
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px var(--space-2);
  border-bottom: 1px solid var(--border);
  background: var(--bg-app);
}

.panel-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-main);
}

.panel-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
}

.panel-search {
  padding: 4px var(--space-2);
  border-bottom: 1px solid var(--border);
}

.panel-search-input {
  width: 100%;
  height: 1.5rem;
  padding: 0 var(--space-2);
  font-size: var(--text-xs);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-main);
  outline: none;
}

.panel-search-input:focus {
  border-color: var(--text-main);
  box-shadow: 0 0 0 1px var(--text-main);
}

.panel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.panel-item {
  display: flex;
  flex-direction: column;
  padding: 6px var(--space-2);
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}

.panel-item:hover {
  background: var(--bg-hover);
}

.panel-item.selected {
  background: var(--bg-hover);
}

.panel-item.temp-selected {
  background: var(--color-primary-light, #dbeafe);
}

.item-label {
  font-size: var(--text-sm);
  color: var(--text-main);
}

.item-description {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.panel-empty {
  padding: var(--space-6) var(--space-4);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover:not(:disabled) {
  background: var(--text-main);
  color: var(--bg-card);
  border-color: var(--text-main);
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.action-divider {
  width: 1.5rem;
  height: 1px;
  background: var(--border);
  margin: var(--space-1) 0;
}

@media (max-width: 640px) {
  .dual-listbox-container {
    flex-direction: column;
  }

  .listbox-panel:first-child {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .listbox-actions {
    flex-direction: row;
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: var(--space-2);
  }

  .action-divider {
    width: 1px;
    height: 1.5rem;
    margin: 0 var(--space-1);
  }
}
</style>

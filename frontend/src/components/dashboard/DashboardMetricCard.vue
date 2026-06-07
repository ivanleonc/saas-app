<template>
  <UiCard>
    <template #header>
      <div class="metric-header">
        <span class="metric-title">{{ title }}</span>
        <slot name="icon"></slot>
      </div>
    </template>
    
    <!-- Contenido Principal -->
    <div :class="['metric-value', { 'text-ellipsis': isText }]">{{ value }}</div>
    
    <template #footer>
      <div class="metric-trend">
        <span :class="trendClass">{{ trendText }}</span>
      </div>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import UiCard from '@/components/ui/UiCard.vue';
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: string | number;
  trendText: string;
  trendType?: 'positive' | 'neutral' | 'negative';
  isText?: boolean;
}>();

const trendClass = computed(() => {
  if (props.trendType === 'positive') return 'trend-positive';
  if (props.trendType === 'negative') return 'trend-negative';
  return 'trend-neutral';
});
</script>

<style scoped>
.metric-header { display: flex; justify-content: space-between; align-items: center; }
.metric-title { font-size: 0.875rem; font-weight: 500; color: var(--text-main); }
.metric-value { font-size: 2rem; font-weight: 700; color: var(--text-main); line-height: 1; }
.text-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 1.5rem; }
.metric-trend { font-size: 0.75rem; }
.trend-positive { color: #16a34a; font-weight: 500; }
.trend-negative { color: #dc2626; font-weight: 500; }
.trend-neutral { color: var(--text-muted); }
</style>
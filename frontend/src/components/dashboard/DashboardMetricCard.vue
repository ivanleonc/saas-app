<template>
  <div class="metric-card">
    <div class="metric-header">
      <div :class="['metric-icon', `icon-${color}`]">
        <slot name="icon"></slot>
      </div>
      <span class="metric-title">{{ title }}</span>
    </div>
    <div class="metric-value" :class="{ 'text-ellipsis': isText }">{{ value }}</div>
    <div v-if="trendText" class="metric-trend">
      <span :class="trendClass">{{ trendText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  title: string;
  value: string | number;
  trendText?: string;
  trendType?: 'positive' | 'neutral' | 'negative';
  color?: 'purple' | 'blue' | 'green' | 'orange';
  isText?: boolean;
}>(), {
  color: 'purple',
  trendType: 'neutral',
});

const trendClass = computed(() => {
  if (props.trendType === 'positive') return 'trend-positive';
  if (props.trendType === 'negative') return 'trend-negative';
  return 'trend-neutral';
});
</script>

<style scoped>
.metric-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.metric-card:hover {
  border-color: var(--text-light);
  box-shadow: var(--shadow-sm);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-purple { background-color: var(--accent-purple-bg); color: var(--accent-purple); }
.icon-blue { background-color: var(--accent-blue-bg); color: var(--accent-blue); }
.icon-green { background-color: var(--accent-green-bg); color: var(--accent-green); }
.icon-orange { background-color: var(--accent-orange-bg); color: var(--accent-orange); }

.metric-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  letter-spacing: -0.025em;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.25rem;
}

.metric-trend {
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-positive { color: var(--color-success); }
.trend-negative { color: var(--color-danger); }
.trend-neutral { color: var(--text-muted); }
</style>

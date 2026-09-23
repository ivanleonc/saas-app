<template>
  <VChart
    :option="option"
    :loading="loading"
    :style="{ height }"
    autoresize
  />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import type { EChartsCoreOption } from 'echarts/core';

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

withDefaults(defineProps<{
  option: EChartsCoreOption;
  loading?: boolean;
  height?: string;
}>(), {
  loading: false,
  height: '320px',
});
</script>

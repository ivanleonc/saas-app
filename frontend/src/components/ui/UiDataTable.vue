<template>
  <div class="table-wrapper">
    <table v-if="!loading && rows.length > 0" class="ui-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.align ? { textAlign: col.align } : undefined"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="rowKey(row, i)">
          <td
            v-for="col in columns"
            :key="col.key"
            :style="col.align ? { textAlign: col.align } : undefined"
          >
            <slot :name="`cell-${col.key}`" :row="row" :index="i">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="loading" class="skeleton-list" aria-label="Cargando datos">
      <div v-for="n in skeletonRows" :key="n" class="skeleton-row">
        <div
          v-for="(col, c) in columns"
          :key="c"
          class="skeleton skeleton-text"
          :style="{ width: `${columnSkeletonWidth(col)}px` }"
        ></div>
      </div>
    </div>

    <slot v-else name="empty">
      <UiEmptyState :title="emptyTitle" :description="emptyDescription">
        <template v-if="$slots['empty-icon']" #icon>
          <slot name="empty-icon" />
        </template>
        <template v-if="$slots['empty-action']" #action>
          <slot name="empty-action" />
        </template>
      </UiEmptyState>
    </slot>
  </div>
</template>

<script setup lang="ts">
import UiEmptyState from '@/components/ui/UiEmptyState.vue';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

const props = withDefaults(defineProps<{
  columns: TableColumn[];
  rows: any[];
  loading?: boolean;
  skeletonRows?: number;
  rowKey?: string | ((row: any, index: number) => string | number);
  emptyTitle?: string;
  emptyDescription?: string;
}>(), {
  loading: false,
  skeletonRows: 5,
  rowKey: 'id',
  emptyTitle: 'Sin resultados',
  emptyDescription: '',
});

const rowKey = (row: any, index: number): string | number => {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index);
  return row[props.rowKey as string] ?? index;
};

const columnSkeletonWidth = (col: TableColumn): number => {
  if (!col || col.key === 'actions') return 32;
  const labelLength = col.label?.length || 0;
  return 120 + ((labelLength * 13) % 90);
};
</script>

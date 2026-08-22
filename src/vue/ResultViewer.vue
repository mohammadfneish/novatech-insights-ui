<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { QueryResult, Row } from '../core/types';
import { numericColumns, toBarData } from '../core/charts';
import BarChart from './BarChart.vue';

/**
 * Renders a query result as a table, bar chart, or raw JSON. Accepts either a full
 * `QueryResult` or bare `columns` + `rows`. All labels are overridable so the host
 * app controls i18n — no i18n dependency here.
 */
const props = withDefaults(
  defineProps<{
    result?: QueryResult | null;
    columns?: string[];
    rows?: Row[];
    chartCap?: number;
    labels?: Partial<typeof DEFAULT_LABELS>;
  }>(),
  { chartCap: 30 },
);

const DEFAULT_LABELS = {
  table: 'Table',
  chart: 'Chart',
  json: 'JSON',
  label: 'Label',
  value: 'Value',
  empty: 'No rows returned.',
  cappedNote: 'Showing the first {n} rows in the chart.',
};
const l = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));

const columns = computed(() => props.result?.columns ?? props.columns ?? []);
const rows = computed(() => props.result?.rows ?? props.rows ?? []);

const mode = ref<'table' | 'chart' | 'json'>('table');
const numeric = computed(() => numericColumns(columns.value, rows.value));
const canChart = computed(() => numeric.value.length > 0 && columns.value.length >= 2);

const labelCol = ref('');
const valueCol = ref('');
watch(
  columns,
  () => {
    valueCol.value = numeric.value[0] ?? '';
    labelCol.value = columns.value.find((c) => c !== valueCol.value) ?? columns.value[0] ?? '';
  },
  { immediate: true },
);

const bars = computed(() => toBarData(rows.value, labelCol.value, valueCol.value, props.chartCap));
const cappedNote = computed(() => l.value.cappedNote.replace('{n}', String(props.chartCap)));

function cell(v: unknown): string {
  return v == null ? '—' : String(v);
}
</script>

<template>
  <div class="iui-rv">
    <p v-if="!columns.length" class="iui-empty">{{ l.empty }}</p>

    <template v-else>
      <div class="iui-tabs">
        <button type="button" :class="{ active: mode === 'table' }" @click="mode = 'table'">{{ l.table }}</button>
        <button type="button" :class="{ active: mode === 'chart' }" :disabled="!canChart" @click="mode = 'chart'">{{ l.chart }}</button>
        <button type="button" :class="{ active: mode === 'json' }" @click="mode = 'json'">{{ l.json }}</button>
      </div>

      <div v-if="mode === 'table'" class="iui-table-wrap">
        <table class="iui-table">
          <thead>
            <tr>
              <th v-for="c in columns" :key="c">{{ c }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="i">
              <td v-for="c in columns" :key="c">{{ cell(row[c]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="mode === 'chart'">
        <div class="iui-axes">
          <label>
            {{ l.label }}
            <select v-model="labelCol">
              <option v-for="c in columns" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label>
            {{ l.value }}
            <select v-model="valueCol">
              <option v-for="c in numeric" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
        </div>
        <BarChart :labels="bars.map((b) => b.label)" :values="bars.map((b) => b.value)" />
        <p v-if="rows.length > chartCap" class="iui-note">{{ cappedNote }}</p>
      </div>

      <pre v-else class="iui-json">{{ JSON.stringify(rows, null, 2) }}</pre>
    </template>
  </div>
</template>

<style scoped>
.iui-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.iui-tabs button {
  border: 0;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--iui-muted, #6b7280);
}
.iui-tabs button.active {
  background: var(--iui-accent, #6366f1);
  color: #fff;
}
.iui-tabs button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.iui-table-wrap {
  overflow-x: auto;
}
.iui-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.iui-table th,
.iui-table td {
  padding: 8px 10px;
  text-align: start;
  border-bottom: 1px solid var(--iui-border, #e5e7eb);
  white-space: nowrap;
}
.iui-table th {
  color: var(--iui-muted, #6b7280);
  font-weight: 600;
}
.iui-axes {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--iui-muted, #6b7280);
}
.iui-axes select {
  display: block;
  margin-top: 4px;
}
.iui-json {
  max-height: 28rem;
  overflow: auto;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  font-size: 12px;
}
.iui-empty,
.iui-note {
  color: var(--iui-muted, #6b7280);
  font-size: 12px;
}
</style>

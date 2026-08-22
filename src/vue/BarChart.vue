<script setup lang="ts">
import { computed } from 'vue';

/** Dependency-free horizontal bar chart (SVG). Keeps the library free of chart.js so
 *  it drops into any app without extra peer deps. */
const props = withDefaults(defineProps<{ labels: string[]; values: number[]; barHeight?: number }>(), {
  barHeight: 26,
});

const max = computed(() => Math.max(1, ...props.values.map((v) => Math.abs(v))));
const gap = 8;
const labelWidth = 140;
const valueWidth = 72;
const height = computed(() => props.values.length * (props.barHeight + gap) + gap);

function fmt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}
</script>

<template>
  <svg :viewBox="`0 0 640 ${height}`" width="100%" :height="height" role="img" class="iui-bar">
    <g v-for="(v, i) in values" :key="i" :transform="`translate(0, ${gap + i * (barHeight + gap)})`">
      <text :x="labelWidth - 8" :y="barHeight / 2" dominant-baseline="central" text-anchor="end" class="iui-bar-label">
        {{ labels[i] }}
      </text>
      <rect
        :x="labelWidth"
        :y="0"
        :width="Math.max(2, (Math.abs(v) / max) * (640 - labelWidth - valueWidth))"
        :height="barHeight"
        rx="4"
        class="iui-bar-rect"
      />
      <text
        :x="labelWidth + Math.max(2, (Math.abs(v) / max) * (640 - labelWidth - valueWidth)) + 6"
        :y="barHeight / 2"
        dominant-baseline="central"
        class="iui-bar-value"
      >
        {{ fmt(v) }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
.iui-bar {
  display: block;
  max-width: 100%;
}
.iui-bar-label {
  font-size: 12px;
  fill: var(--iui-muted, #6b7280);
}
.iui-bar-rect {
  fill: var(--iui-accent, #6366f1);
}
.iui-bar-value {
  font-size: 11px;
  fill: var(--iui-text, #111827);
}
</style>

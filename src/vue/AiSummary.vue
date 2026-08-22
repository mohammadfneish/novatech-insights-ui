<script setup lang="ts">
import { computed } from 'vue';

/** Presentational panel for an AI narrative + optional suggestions. Purely display —
 *  the host fetches the text (e.g. from its narrative/analysis endpoint). */
const props = defineProps<{
  summary?: string;
  suggestions?: string[];
  loading?: boolean;
  labels?: Partial<typeof DEFAULT_LABELS>;
}>();

const DEFAULT_LABELS = { title: 'AI summary', suggestions: 'Suggestions', loading: 'Analysing…', empty: 'No summary yet.' };
const l = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));
</script>

<template>
  <div class="iui-ai">
    <div class="iui-ai-head">🧠 {{ l.title }}</div>
    <p v-if="loading" class="iui-ai-muted">{{ l.loading }}</p>
    <template v-else>
      <p v-if="summary" class="iui-ai-text">{{ summary }}</p>
      <p v-else class="iui-ai-muted">{{ l.empty }}</p>
      <template v-if="suggestions && suggestions.length">
        <div class="iui-ai-sub">{{ l.suggestions }}</div>
        <ul class="iui-ai-list">
          <li v-for="(s, i) in suggestions" :key="i">{{ s }}</li>
        </ul>
      </template>
    </template>
  </div>
</template>

<style scoped>
.iui-ai {
  border: 1px solid var(--iui-border, #e5e7eb);
  border-radius: 10px;
  padding: 16px;
  background: var(--iui-surface, #fff);
}
.iui-ai-head {
  font-size: 13px;
  font-weight: 600;
  color: var(--iui-text, #111827);
  margin-bottom: 8px;
}
.iui-ai-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--iui-text, #111827);
  white-space: pre-wrap;
}
.iui-ai-muted {
  font-size: 13px;
  color: var(--iui-muted, #6b7280);
}
.iui-ai-sub {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--iui-muted, #6b7280);
}
.iui-ai-list {
  margin: 6px 0 0;
  padding-inline-start: 18px;
  font-size: 13px;
  color: var(--iui-text, #111827);
}
.iui-ai-list li {
  margin-bottom: 4px;
}
</style>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { InsightsApi } from '../core/api';
import type { QueryResult, SqlReport } from '../core/types';
import { errorMessage } from './errors';
import ResultViewer from './ResultViewer.vue';

/**
 * Ad-hoc SQL report builder. Write SQL or draft it from a question via AI, run it
 * read-only, view the result, and save named reports. Bring your own API object
 * (`createInsightsApi(httpClient)`); errors surface via the `error` event.
 */
const props = defineProps<{ api: InsightsApi; labels?: Partial<typeof DEFAULT_LABELS> }>();
const emit = defineEmits<{ error: [message: string]; saved: [report: SqlReport] }>();

const DEFAULT_LABELS = {
  saved: 'Saved reports',
  noneSaved: 'No saved reports yet.',
  new: 'New',
  askAi: 'Ask AI',
  askAiPlaceholder: 'e.g. Top 10 products by revenue this month',
  generate: 'Generate',
  generating: 'Generating…',
  draftValid: 'Draft passed validation — review and run it.',
  draftInvalid: 'Draft did not pass validation: {error}',
  sql: 'SQL',
  sqlPlaceholder: 'SELECT ... FROM ... LIMIT 100',
  run: 'Run',
  running: 'Running…',
  name: 'Name',
  namePlaceholder: 'Report name',
  save: 'Save',
  result: 'Result',
  rows: '{n} rows',
  truncated: 'truncated',
  remove: 'Remove',
};
const l = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));

const reports = ref<SqlReport[]>([]);
const editing = reactive<{ id: number | null; name: string; sql: string }>({ id: null, name: '', sql: '' });
const question = ref('');
const generating = ref(false);
const running = ref(false);
const saving = ref(false);
const genNote = ref<{ valid: boolean; error: string | null } | null>(null);
const runError = ref<string | null>(null);
const result = ref<QueryResult | null>(null);

async function loadList() {
  try {
    reports.value = await props.api.listSqlReports();
  } catch (e) {
    emit('error', errorMessage(e));
  }
}

function newReport() {
  editing.id = null;
  editing.name = '';
  editing.sql = '';
  question.value = '';
  genNote.value = null;
  runError.value = null;
  result.value = null;
}

function openReport(r: SqlReport) {
  editing.id = r.id;
  editing.name = r.name;
  editing.sql = r.sql;
  genNote.value = null;
  runError.value = null;
  result.value = null;
}

async function generate() {
  if (!question.value.trim()) return;
  generating.value = true;
  genNote.value = null;
  try {
    const draft = await props.api.generateSql(question.value.trim());
    editing.sql = draft.sql;
    genNote.value = { valid: draft.valid, error: draft.error };
  } catch (e) {
    emit('error', errorMessage(e));
  } finally {
    generating.value = false;
  }
}

async function run() {
  if (!editing.sql.trim()) return;
  running.value = true;
  runError.value = null;
  try {
    result.value = await props.api.runSql({ sql: editing.sql });
  } catch (e) {
    runError.value = errorMessage(e);
    result.value = null;
  } finally {
    running.value = false;
  }
}

async function save() {
  if (!editing.name.trim() || !editing.sql.trim()) return;
  saving.value = true;
  try {
    const payload = { name: editing.name.trim(), sql: editing.sql };
    const report = editing.id
      ? await props.api.updateSqlReport(editing.id, payload)
      : await props.api.saveSqlReport(payload);
    const idx = reports.value.findIndex((r) => r.id === report.id);
    if (idx !== -1) reports.value[idx] = report;
    else reports.value.unshift(report);
    editing.id = report.id;
    emit('saved', report);
  } catch (e) {
    emit('error', errorMessage(e));
  } finally {
    saving.value = false;
  }
}

async function remove(r: SqlReport) {
  try {
    await props.api.deleteSqlReport(r.id);
    reports.value = reports.value.filter((x) => x.id !== r.id);
    if (editing.id === r.id) newReport();
  } catch (e) {
    emit('error', errorMessage(e));
  }
}

const rowNote = computed(() =>
  result.value ? l.value.rows.replace('{n}', String(result.value.row_count)) : '',
);

onMounted(loadList);
</script>

<template>
  <div class="iui-sql">
    <aside class="iui-panel iui-saved">
      <div class="iui-panel-head">
        <span>{{ l.saved }}</span>
        <button type="button" class="iui-btn iui-btn-ghost" @click="newReport">{{ l.new }}</button>
      </div>
      <p v-if="!reports.length" class="iui-muted">{{ l.noneSaved }}</p>
      <ul v-else class="iui-list">
        <li v-for="r in reports" :key="r.id" :class="{ active: editing.id === r.id }">
          <button type="button" class="iui-list-name" @click="openReport(r)">{{ r.name }}</button>
          <button type="button" class="iui-list-x" :title="l.remove" @click="remove(r)">✕</button>
        </li>
      </ul>
    </aside>

    <div class="iui-main">
      <div class="iui-panel">
        <label class="iui-field">
          <span>{{ l.askAi }}</span>
          <div class="iui-row">
            <input v-model="question" type="text" :placeholder="l.askAiPlaceholder" @keydown.enter.prevent="generate" />
            <button type="button" class="iui-btn iui-btn-secondary" :disabled="generating || !question.trim()" @click="generate">
              {{ generating ? l.generating : l.generate }}
            </button>
          </div>
        </label>
        <p v-if="genNote && genNote.valid" class="iui-ok">{{ l.draftValid }}</p>
        <p v-else-if="genNote && !genNote.valid" class="iui-warn">{{ l.draftInvalid.replace('{error}', genNote.error ?? '') }}</p>

        <label class="iui-field">
          <span>{{ l.sql }}</span>
          <textarea v-model="editing.sql" rows="8" spellcheck="false" class="iui-code" :placeholder="l.sqlPlaceholder"></textarea>
        </label>

        <div class="iui-actions">
          <button type="button" class="iui-btn iui-btn-primary" :disabled="running || !editing.sql.trim()" @click="run">
            {{ running ? l.running : l.run }}
          </button>
          <input v-model="editing.name" type="text" class="iui-name" :placeholder="l.namePlaceholder" :aria-label="l.name" />
          <button type="button" class="iui-btn iui-btn-secondary" :disabled="saving || !editing.name.trim() || !editing.sql.trim()" @click="save">
            {{ l.save }}
          </button>
        </div>
      </div>

      <div v-if="runError" class="iui-panel iui-error">{{ runError }}</div>
      <div v-else-if="result" class="iui-panel">
        <div class="iui-panel-head">
          <span>{{ l.result }}</span>
          <span class="iui-muted">{{ rowNote }}<template v-if="result.truncated"> · {{ l.truncated }}</template></span>
        </div>
        <ResultViewer :result="result" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.iui-sql {
  display: grid;
  grid-template-columns: 15rem 1fr;
  gap: 20px;
}
@media (max-width: 720px) {
  .iui-sql {
    grid-template-columns: 1fr;
  }
}
.iui-panel {
  border: 1px solid var(--iui-border, #e5e7eb);
  border-radius: 10px;
  padding: 16px;
  background: var(--iui-surface, #fff);
}
.iui-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.iui-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--iui-text, #111827);
  margin-bottom: 10px;
}
.iui-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.iui-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  padding: 4px 8px;
}
.iui-list li.active {
  background: color-mix(in srgb, var(--iui-accent, #6366f1) 12%, transparent);
}
.iui-list-name {
  flex: 1;
  text-align: start;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.iui-list-x {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--iui-muted, #9ca3af);
}
.iui-field {
  display: block;
  font-size: 12px;
  color: var(--iui-muted, #6b7280);
  margin-bottom: 12px;
}
.iui-field > span {
  display: block;
  margin-bottom: 4px;
}
.iui-row {
  display: flex;
  gap: 8px;
}
.iui-row input {
  flex: 1;
}
input,
textarea,
select {
  font: inherit;
  border: 1px solid var(--iui-border, #e5e7eb);
  border-radius: 6px;
  padding: 8px 10px;
  background: var(--iui-surface, #fff);
  color: var(--iui-text, #111827);
}
.iui-code {
  width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}
.iui-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.iui-name {
  flex: 1;
  min-width: 8rem;
}
.iui-btn {
  border: 0;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.iui-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.iui-btn-primary {
  background: var(--iui-accent, #6366f1);
  color: #fff;
}
.iui-btn-secondary {
  background: var(--iui-border, #e5e7eb);
  color: var(--iui-text, #111827);
}
.iui-btn-ghost {
  background: transparent;
  color: var(--iui-muted, #6b7280);
}
.iui-muted {
  color: var(--iui-muted, #6b7280);
  font-size: 12px;
  font-weight: 400;
}
.iui-ok {
  color: #16a34a;
  font-size: 12px;
  margin: -6px 0 12px;
}
.iui-warn {
  color: #d97706;
  font-size: 12px;
  margin: -6px 0 12px;
}
.iui-error {
  color: #dc2626;
  border-color: color-mix(in srgb, #dc2626 40%, transparent);
  font-size: 13px;
}
</style>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { DeliveryChannel, ScheduleInput } from '../core/types';

/**
 * Presentational schedule form. Emits a validated `ScheduleInput` on submit; the host
 * wires it to `api.createSchedule` / `api.updateSchedule`. Recipients are required only
 * when the email channel is selected.
 */
const props = defineProps<{ initial?: Partial<ScheduleInput>; labels?: Partial<typeof DEFAULT_LABELS> }>();
const emit = defineEmits<{ submit: [payload: ScheduleInput]; cancel: [] }>();

const DEFAULT_LABELS = {
  reportType: 'Report type',
  daily: 'Daily',
  monthly: 'Monthly',
  managementSummary: 'Management summary',
  format: 'Format',
  frequency: 'Frequency',
  freqDaily: 'Daily',
  freqWeekly: 'Weekly',
  freqMonthly: 'Monthly',
  channels: 'Delivery channels',
  email: 'Email',
  telegram: 'Telegram',
  recipients: 'Recipients',
  recipientsHelp: 'One email per line.',
  save: 'Save',
  cancel: 'Cancel',
};
const l = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));

const form = reactive({
  report_type: props.initial?.report_type ?? 'daily',
  format: props.initial?.format ?? 'pdf',
  frequency: props.initial?.frequency ?? 'daily',
  channels: (props.initial?.channels ?? ['email']) as DeliveryChannel[],
  recipientsText: (props.initial?.recipients ?? []).join('\n'),
});

const emailSelected = computed(() => form.channels.includes('email'));

function toggleChannel(c: DeliveryChannel) {
  form.channels = form.channels.includes(c) ? form.channels.filter((x) => x !== c) : [...form.channels, c];
}

function submit() {
  const recipients = form.recipientsText.split('\n').map((r) => r.trim()).filter(Boolean);
  if (form.channels.length === 0) return;
  if (emailSelected.value && recipients.length === 0) return;
  emit('submit', {
    report_type: form.report_type,
    format: form.format,
    frequency: form.frequency,
    channels: form.channels,
    recipients,
  });
}
</script>

<template>
  <form class="iui-sf" @submit.prevent="submit">
    <label class="iui-field">
      <span>{{ l.reportType }}</span>
      <select v-model="form.report_type">
        <option value="daily">{{ l.daily }}</option>
        <option value="monthly">{{ l.monthly }}</option>
        <option value="management_summary">{{ l.managementSummary }}</option>
      </select>
    </label>

    <label class="iui-field">
      <span>{{ l.format }}</span>
      <select v-model="form.format">
        <option value="pdf">PDF</option>
        <option value="xlsx">XLSX</option>
        <option value="csv">CSV</option>
      </select>
    </label>

    <label class="iui-field">
      <span>{{ l.frequency }}</span>
      <select v-model="form.frequency">
        <option value="daily">{{ l.freqDaily }}</option>
        <option value="weekly">{{ l.freqWeekly }}</option>
        <option value="monthly">{{ l.freqMonthly }}</option>
      </select>
    </label>

    <div class="iui-field">
      <span>{{ l.channels }}</span>
      <div class="iui-channels">
        <label><input type="checkbox" :checked="form.channels.includes('email')" @change="toggleChannel('email')" /> {{ l.email }}</label>
        <label><input type="checkbox" :checked="form.channels.includes('telegram')" @change="toggleChannel('telegram')" /> {{ l.telegram }}</label>
      </div>
    </div>

    <label v-if="emailSelected" class="iui-field">
      <span>{{ l.recipients }}</span>
      <textarea v-model="form.recipientsText" rows="4" :required="emailSelected"></textarea>
      <small>{{ l.recipientsHelp }}</small>
    </label>

    <div class="iui-actions">
      <button type="button" class="iui-btn iui-btn-secondary" @click="emit('cancel')">{{ l.cancel }}</button>
      <button type="submit" class="iui-btn iui-btn-primary">{{ l.save }}</button>
    </div>
  </form>
</template>

<style scoped>
.iui-sf {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.iui-field > span {
  display: block;
  font-size: 12px;
  color: var(--iui-muted, #6b7280);
  margin-bottom: 4px;
}
.iui-field small {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--iui-muted, #9ca3af);
}
select,
textarea {
  width: 100%;
  font: inherit;
  border: 1px solid var(--iui-border, #e5e7eb);
  border-radius: 6px;
  padding: 8px 10px;
  background: var(--iui-surface, #fff);
  color: var(--iui-text, #111827);
}
.iui-channels {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--iui-text, #111827);
}
.iui-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.iui-btn {
  border: 0;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.iui-btn-primary {
  background: var(--iui-accent, #6366f1);
  color: #fff;
}
.iui-btn-secondary {
  background: var(--iui-border, #e5e7eb);
  color: var(--iui-text, #111827);
}
</style>

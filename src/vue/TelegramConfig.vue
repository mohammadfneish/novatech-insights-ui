<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { InsightsApi } from '../core/api';
import type { TelegramConfigState } from '../core/types';
import { errorMessage } from './errors';

/** Per-tenant Telegram bot settings. The bot token is write-only — only sent when
 *  the user types a new one. Bring your own API object; errors surface via `error`. */
const props = defineProps<{ api: InsightsApi; labels?: Partial<typeof DEFAULT_LABELS> }>();
const emit = defineEmits<{ error: [message: string]; saved: [state: TelegramConfigState] }>();

const DEFAULT_LABELS = {
  botToken: 'Bot token',
  tokenPlaceholder: '123456:ABC-DEF…',
  tokenKeep: 'Leave blank to keep the current token',
  connected: 'Connected',
  defaultChatId: 'Default chat ID',
  allowedChats: 'Allowed chats (inbound)',
  addChat: 'Add a chat ID and press Enter',
  active: 'Active',
  save: 'Save',
  webhook: 'Inbound webhook URL',
  copy: 'Copy',
  copied: 'Copied.',
};
const l = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));

const state = ref<TelegramConfigState | null>(null);
const saving = ref(false);
const showToken = ref(false);
const chatInput = ref('');
const form = reactive({ bot_token: '', default_chat_id: '', allowed_chat_ids: [] as string[], is_active: true });

async function load() {
  try {
    const s = await props.api.getTelegramConfig();
    state.value = s;
    form.bot_token = '';
    form.default_chat_id = s.default_chat_id ?? '';
    form.allowed_chat_ids = s.allowed_chat_ids ?? [];
    form.is_active = s.configured ? s.is_active : true;
  } catch (e) {
    emit('error', errorMessage(e));
  }
}

function addChat() {
  const v = chatInput.value.trim();
  if (v && !form.allowed_chat_ids.includes(v)) form.allowed_chat_ids.push(v);
  chatInput.value = '';
}
function removeChat(v: string) {
  form.allowed_chat_ids = form.allowed_chat_ids.filter((c) => c !== v);
}

async function save() {
  saving.value = true;
  try {
    const payload: Record<string, unknown> = {
      default_chat_id: form.default_chat_id || null,
      allowed_chat_ids: form.allowed_chat_ids,
      is_active: form.is_active,
    };
    if (form.bot_token.trim()) payload.bot_token = form.bot_token.trim();
    const s = await props.api.updateTelegramConfig(payload);
    state.value = s;
    form.bot_token = '';
    emit('saved', s);
  } catch (e) {
    emit('error', errorMessage(e));
  } finally {
    saving.value = false;
  }
}

async function copyWebhook() {
  if (!state.value?.webhook_url) return;
  try {
    await navigator.clipboard.writeText(state.value.webhook_url);
  } catch (e) {
    emit('error', errorMessage(e, 'Could not copy.'));
  }
}

onMounted(load);
</script>

<template>
  <form class="iui-tg" @submit.prevent="save">
    <div class="iui-field">
      <span>
        {{ l.botToken }}
        <em v-if="state?.has_token" class="iui-badge">{{ l.connected }}</em>
      </span>
      <div class="iui-row">
        <input
          v-model="form.bot_token"
          :type="showToken ? 'text' : 'password'"
          :placeholder="state?.has_token ? l.tokenKeep : l.tokenPlaceholder"
          :required="!state?.has_token"
        />
        <button type="button" class="iui-btn iui-btn-ghost" @click="showToken = !showToken">👁</button>
      </div>
    </div>

    <label class="iui-field">
      <span>{{ l.defaultChatId }}</span>
      <input v-model="form.default_chat_id" type="text" placeholder="-1001234567890" />
    </label>

    <div class="iui-field">
      <span>{{ l.allowedChats }}</span>
      <div class="iui-tags">
        <span v-for="c in form.allowed_chat_ids" :key="c" class="iui-tag">
          {{ c }}<button type="button" @click="removeChat(c)">✕</button>
        </span>
        <input v-model="chatInput" type="text" :placeholder="l.addChat" @keydown.enter.prevent="addChat" @blur="addChat" />
      </div>
    </div>

    <label class="iui-check">
      <input v-model="form.is_active" type="checkbox" />
      {{ l.active }}
    </label>

    <div class="iui-actions">
      <button type="submit" class="iui-btn iui-btn-primary" :disabled="saving">{{ l.save }}</button>
    </div>

    <div v-if="state?.webhook_url" class="iui-field">
      <span>{{ l.webhook }}</span>
      <div class="iui-row">
        <code class="iui-webhook">{{ state.webhook_url }}</code>
        <button type="button" class="iui-btn iui-btn-secondary" @click="copyWebhook">{{ l.copy }}</button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.iui-tg {
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.iui-field > span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--iui-muted, #6b7280);
  margin-bottom: 4px;
}
.iui-badge {
  font-style: normal;
  font-size: 11px;
  color: #16a34a;
  background: color-mix(in srgb, #16a34a 12%, transparent);
  border-radius: 999px;
  padding: 1px 8px;
}
.iui-row {
  display: flex;
  gap: 8px;
}
.iui-row input,
.iui-row .iui-webhook {
  flex: 1;
}
input {
  font: inherit;
  border: 1px solid var(--iui-border, #e5e7eb);
  border-radius: 6px;
  padding: 8px 10px;
  width: 100%;
  background: var(--iui-surface, #fff);
  color: var(--iui-text, #111827);
}
.iui-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--iui-border, #e5e7eb);
  border-radius: 6px;
  padding: 6px 8px;
}
.iui-tags input {
  flex: 1;
  min-width: 8rem;
  border: 0;
  padding: 2px;
}
.iui-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  background: color-mix(in srgb, var(--iui-accent, #6366f1) 12%, transparent);
  color: var(--iui-accent, #6366f1);
  border-radius: 999px;
  padding: 2px 8px;
}
.iui-tag button {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: inherit;
}
.iui-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--iui-text, #111827);
}
.iui-check input {
  width: auto;
}
.iui-webhook {
  border: 1px solid var(--iui-border, #e5e7eb);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--iui-code-bg, #f3f4f6);
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
}
.iui-actions {
  text-align: end;
}
</style>

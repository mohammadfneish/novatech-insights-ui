# @novatech/insights-ui

Framework-light **Vue 3** components for AI-powered reporting — extracted from the
Novatech **AI Reports** hub so they can be reused across product apps.

- **SqlReportBuilder** — write SQL or draft it with AI, run read-only, save named reports
- **ResultViewer** — a result set as **table / bar chart / JSON** (zero chart deps — SVG)
- **TelegramConfig** — per-tenant Telegram bot settings + inbound webhook URL
- **ScheduleForm** — report schedule with email / Telegram delivery channels
- **AiSummary** — presentational AI narrative + suggestions
- **createInsightsApi** — a typed API layer over your own HTTP client

**Secret-free by design.** The library never handles auth or base URLs — you pass your
own configured HTTP client (axios or anything with `get/post/put/delete`). Nothing here
stores credentials, so it's safe to publish and install publicly.

## Install

```bash
npm i @novatech/insights-ui
```

`vue` (^3.4) is a peer dependency. No chart library required.

## Quick start

```ts
import axios from 'axios';
import { createInsightsApi } from '@novatech/insights-ui';
import '@novatech/insights-ui/style.css'; // optional theme tokens + dark mode

// Your app's client — carries base URL, auth header, tenant context, interceptors.
const http = axios.create({ baseURL: '/api/v1', headers: { Accept: 'application/json' } });

export const insights = createInsightsApi(http);
```

```vue
<script setup lang="ts">
import { SqlReportBuilder, TelegramConfig } from '@novatech/insights-ui';
import { insights } from './insights';
import { useToast } from './toast';

const toast = useToast();
</script>

<template>
  <SqlReportBuilder :api="insights" @error="toast.error" />
  <TelegramConfig :api="insights" @error="toast.error" @saved="toast.success('Saved')" />
</template>
```

Standalone result rendering (no API needed):

```vue
<ResultViewer :columns="['store', 'revenue']" :rows="rows" />
```

Global registration (optional):

```ts
import { InsightsUi } from '@novatech/insights-ui';
app.use(InsightsUi);
```

## Endpoints

`createInsightsApi(http, paths?)` targets these routes (relative to your client's base
URL). Override any via the second argument:

| Method | Default path |
|---|---|
| `getTelegramConfig` / `updateTelegramConfig` | `GET` / `PUT /settings/telegram` |
| `listSqlReports` · `saveSqlReport` · `updateSqlReport` · `deleteSqlReport` | `/admin/sql-reports` |
| `runSql` | `POST /admin/sql-reports/run` |
| `generateSql` | `POST /admin/sql-reports/generate` |
| `listSchedules` · `createSchedule` · `updateSchedule` · `deleteSchedule` | `/reports/schedules` |

The API expects Laravel-style `{ data: ... }` envelopes.

## Theming

Components ship scoped styles with fallbacks, so they render without any CSS import.
Import `@novatech/insights-ui/style.css` for the default light/dark tokens, then override
any CSS custom property to re-brand:

```css
:root { --iui-accent: #0ea5e9; }
```

Tokens: `--iui-accent`, `--iui-text`, `--iui-muted`, `--iui-border`, `--iui-surface`,
`--iui-code-bg`. Dark mode follows `prefers-color-scheme` or an explicit
`[data-theme="dark"]`.

## i18n

No i18n dependency. Every user-facing string has an English default and is overridable
via each component's `labels` prop:

```vue
<SqlReportBuilder :api="insights" :labels="{ run: 'Exécuter', save: 'Enregistrer' }" />
```

## Framework-neutral core

`createInsightsApi`, the types, and the chart helpers (`numericColumns`, `toBarData`)
are plain TypeScript with no Vue import — a React wrapper can reuse them directly.

## License

MIT

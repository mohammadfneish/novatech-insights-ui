# Changelog

## 0.1.1

- Build `dist/` on install via a `prepare` script, so the package can be installed
  directly from GitHub (`npm i github:mohammadfneish/novatech-insights-ui#v0.1.1`)
  without publishing to npm.
- Add `.npmignore` so a git install ships `dist/` (the `files` allowlist governs; this
  stops npm from falling back to `.gitignore`, which excludes `dist`).

## 0.1.0

Initial release. Extracted from the Novatech AI Reports admin.

- `createInsightsApi(http, paths?)` — typed API over a host-provided HTTP client
- `ResultViewer` — table / SVG bar chart / JSON views of a query result
- `SqlReportBuilder` — write/AI-draft SQL, run read-only, save named reports
- `TelegramConfig` — per-tenant bot settings + inbound webhook URL
- `ScheduleForm` — report schedule with email / Telegram channels
- `AiSummary` — AI narrative + suggestions panel
- Framework-neutral core (types + chart helpers), optional theme tokens, no chart deps

import {
  DEFAULT_PATHS,
  type Envelope,
  type GeneratedSql,
  type HttpClient,
  type InsightsPaths,
  type QueryResult,
  type ReportSchedule,
  type ScheduleInput,
  type SqlReport,
  type TelegramConfigInput,
  type TelegramConfigState,
} from './types';

/**
 * Typed AI-Reports API bound to a host-provided HTTP client. The client carries auth
 * and base URL; this factory only knows the endpoint shapes. Pass `paths` to override
 * routes if your backend mounts them elsewhere.
 */
export function createInsightsApi(http: HttpClient, paths: Partial<InsightsPaths> = {}) {
  const p: InsightsPaths = { ...DEFAULT_PATHS, ...paths };
  const unwrap = <T>(r: { data: Envelope<T> }): T => r.data.data;

  return {
    // --- Telegram ---
    getTelegramConfig: () => http.get<Envelope<TelegramConfigState>>(p.telegramConfig).then(unwrap),
    updateTelegramConfig: (input: TelegramConfigInput) =>
      http.put<Envelope<TelegramConfigState>>(p.telegramConfig, input).then(unwrap),

    // --- SQL reports ---
    listSqlReports: () => http.get<Envelope<SqlReport[]>>(p.sqlReports).then(unwrap),
    runSql: (payload: { sql: string } | { report_id: number }) =>
      http.post<Envelope<QueryResult>>(p.sqlRun, payload).then(unwrap),
    generateSql: (question: string) =>
      http.post<Envelope<GeneratedSql>>(p.sqlGenerate, { question }).then(unwrap),
    saveSqlReport: (input: { name: string; sql: string; viz?: Record<string, unknown> }) =>
      http.post<Envelope<SqlReport>>(p.sqlReports, input).then(unwrap),
    updateSqlReport: (id: number, input: Partial<{ name: string; sql: string; viz: Record<string, unknown> }>) =>
      http.put<Envelope<SqlReport>>(`${p.sqlReports}/${id}`, input).then(unwrap),
    deleteSqlReport: (id: number) => http.delete<void>(`${p.sqlReports}/${id}`).then(() => undefined),

    // --- Schedules ---
    listSchedules: () => http.get<Envelope<ReportSchedule[]>>(p.schedules).then(unwrap),
    createSchedule: (input: ScheduleInput) => http.post<Envelope<ReportSchedule>>(p.schedules, input).then(unwrap),
    updateSchedule: (id: number, input: Partial<ScheduleInput> & { is_active?: boolean }) =>
      http.put<Envelope<ReportSchedule>>(`${p.schedules}/${id}`, input).then(unwrap),
    deleteSchedule: (id: number) => http.delete<void>(`${p.schedules}/${id}`).then(() => undefined),
  };
}

export type InsightsApi = ReturnType<typeof createInsightsApi>;

/** Framework-neutral types shared by the core API and the Vue components. */

/** Minimal axios-compatible client. The host app passes its own configured instance
 *  (base URL, auth headers, tenant context) — this library never handles credentials. */
export interface HttpClient {
  get<T = unknown>(url: string): Promise<{ data: T }>;
  post<T = unknown>(url: string, body?: unknown): Promise<{ data: T }>;
  put<T = unknown>(url: string, body?: unknown): Promise<{ data: T }>;
  delete<T = unknown>(url: string): Promise<{ data: T }>;
}

/** The Laravel API wraps payloads as `{ data: ... }`. */
export interface Envelope<T> {
  data: T;
}

export type Row = Record<string, unknown>;

export interface QueryResult {
  columns: string[];
  rows: Row[];
  row_count: number;
  truncated: boolean;
  sql: string;
}

export interface SqlReport {
  id: number;
  name: string;
  sql: string;
  viz?: Record<string, unknown> | null;
}

export interface GeneratedSql {
  sql: string;
  valid: boolean;
  error: string | null;
}

export interface TelegramConfigState {
  configured: boolean;
  has_token: boolean;
  default_chat_id: string | null;
  allowed_chat_ids: string[];
  is_active: boolean;
  webhook_url?: string;
}

export interface TelegramConfigInput {
  bot_token?: string;
  default_chat_id?: string | null;
  allowed_chat_ids?: string[];
  is_active?: boolean;
}

export type DeliveryChannel = 'email' | 'telegram';

export interface ReportSchedule {
  id: number;
  report_type: 'daily' | 'monthly' | 'management_summary';
  format: 'pdf' | 'xlsx' | 'csv';
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  channels?: DeliveryChannel[];
  is_active: boolean;
  last_run_at?: string | null;
  filters?: { store_id?: number } | null;
}

export interface ScheduleInput {
  report_type: ReportSchedule['report_type'];
  format: ReportSchedule['format'];
  frequency: ReportSchedule['frequency'];
  recipients: string[];
  channels: DeliveryChannel[];
  filters?: { store_id?: number } | null;
}

/** Overridable endpoint paths (relative to the host client's base URL). */
export interface InsightsPaths {
  telegramConfig: string;
  sqlReports: string;
  sqlRun: string;
  sqlGenerate: string;
  schedules: string;
}

export const DEFAULT_PATHS: InsightsPaths = {
  telegramConfig: '/settings/telegram',
  sqlReports: '/admin/sql-reports',
  sqlRun: '/admin/sql-reports/run',
  sqlGenerate: '/admin/sql-reports/generate',
  schedules: '/reports/schedules',
};

import type { Row } from './types';

/** Pure, framework-neutral helpers for turning a tabular result into a bar chart.
 *  Kept out of the Vue layer so a React wrapper can reuse them verbatim. */

/** Columns whose every present value parses as a finite number. */
export function numericColumns(columns: string[], rows: Row[]): string[] {
  if (rows.length === 0) return [];
  return columns.filter((c) => rows.every((r) => r[c] == null || r[c] === '' || Number.isFinite(Number(r[c]))));
}

export interface BarDatum {
  label: string;
  value: number;
}

/** Build (label, value) pairs for a bar chart, capped to `cap` rows. */
export function toBarData(rows: Row[], labelCol: string, valueCol: string, cap = 30): BarDatum[] {
  return rows.slice(0, cap).map((r) => ({
    label: String(r[labelCol] ?? ''),
    value: Number(r[valueCol]) || 0,
  }));
}

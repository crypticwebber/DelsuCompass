import { parse } from "csv-parse/sync";

export function parseCsv(buffer: Buffer): Array<{ sheet: string; values: string[] }> {
  const rows = parse(buffer.toString("utf8"), { relax_column_count: true, skip_empty_lines: true }) as unknown[][];
  return rows.map((row) => ({ sheet: "CSV", values: row.map((v) => String(v ?? "").trim()) }));
}

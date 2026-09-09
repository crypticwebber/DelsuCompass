import ExcelJS from "exceljs";
import { PassThrough } from "node:stream";

export interface RawSheetRow {
  sheet: string;
  values: string[];
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    const cell = value as {
      text?: string;

      result?: unknown;

      richText?: Array<{
        text?: string;
      }>;

      hyperlink?: string;
    };

    if (cell.result !== undefined && cell.result !== null) {
      return normalizeCellValue(cell.result);
    }

    if (Array.isArray(cell.richText)) {
      return cell.richText
        .map((part) => part.text ?? "")
        .join("")
        .trim();
    }

    if (typeof cell.text === "string") {
      return cell.text.trim();
    }

    if (typeof cell.hyperlink === "string") {
      return cell.hyperlink.trim();
    }
  }

  return String(value).trim();
}

export async function parseXlsx(buffer: Buffer): Promise<RawSheetRow[]> {
  const workbook = new ExcelJS.Workbook();

  const stream = new PassThrough();

  stream.end(buffer);

  await workbook.xlsx.read(stream);

  const rows: RawSheetRow[] = [];

  workbook.eachSheet((worksheet) => {
    worksheet.eachRow(
      {
        includeEmpty: true,
      },
      (row) => {
        const values: string[] = [];

        const cellCount = Math.max(row.cellCount, worksheet.actualColumnCount);

        for (let column = 1; column <= cellCount; column += 1) {
          values.push(normalizeCellValue(row.getCell(column).value));
        }

        while (values.length > 0 && values[values.length - 1] === "") {
          values.pop();
        }

        if (values.some((value) => value !== "")) {
          rows.push({
            sheet: worksheet.name,

            values,
          });
        }
      },
    );
  });

  return rows;
}

import crypto from "node:crypto";

import type { WeekDay } from "../timetable.types.js";

import { detectLevel } from "./normalizers/level.normalizer.js";

import {
  extractTimeRange,
  normalizeTime,
} from "./normalizers/time.normalizer.js";

import type {
  ParsedTimetableEntry,
  ParsedTimetableSection,
} from "./timetable-import.types.js";

type SourceRow = {
  sheet: string;
  values: string[];
};

type Context = {
  department?: string;
  level?: number;
  faculty?: string;
};

type TimeSlot = {
  idx: number;
  startTime: string;
  endTime: string;
};

const dayMap: Array<[RegExp, WeekDay]> = [
  [/\bmon(?:day)?\b/i, "monday"],

  [/\b(?:tue|tues|tuesday)\b/i, "tuesday"],

  [/\bwed(?:nesday)?\b/i, "wednesday"],

  [/\b(?:thu|thur|thurs|thursday)\b/i, "thursday"],

  [/\bfri(?:day)?\b/i, "friday"],

  [/\bsat(?:urday)?\b/i, "saturday"],

  [/\bsun(?:day)?\b/i, "sunday"],
];

/* =========================================================
   BASIC NORMALIZATION
   ========================================================= */

function cleanCell(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectDay(value: string): WeekDay | undefined {
  const cleaned = cleanCell(value);

  return dayMap.find(([pattern]) => pattern.test(cleaned))?.[1];
}

function courseCode(value: string): string | undefined {
  const match = cleanCell(value).match(
    /\b([A-Z]{2,8})\s*[-/]?\s*(\d{3})([A-Z]?)\b/i,
  );

  if (!match) {
    return undefined;
  }

  return `${match[1].toUpperCase()} ${match[2]}${(
    match[3] ?? ""
  ).toUpperCase()}`;
}

function newSection(
  department?: string,
  level?: number,
  faculty?: string,
): ParsedTimetableSection {
  return {
    id: crypto.randomUUID(),

    department,
    level,
    faculty,

    entries: [],
  };
}

/* =========================================================
   HEADING DETECTION
   ========================================================= */

function maybeHeading(text: string) {
  const cleaned = cleanCell(text);

  const level = detectLevel(cleaned);

  const department = cleaned
    .match(
      /(?:department(?:\s+of)?|dept\.?)\s*[:\-]?\s*([a-z &/\-]{3,80})/i,
    )?.[1]
    ?.trim();

  const faculty = cleaned
    .match(/faculty(?:\s+of)?\s*[:\-]?\s*([a-z &/\-]{3,80})/i)?.[1]
    ?.trim();

  const knownDepartment = !department
    ? cleaned.match(
        /\b(?:computer science|software engineering|cyber ?security|information technology|mathematics|statistics)\b/i,
      )?.[0]
    : undefined;

  return {
    level,

    department: department ?? knownDepartment,

    faculty,
  };
}

/* =========================================================
   TIME HELPERS
   ========================================================= */

function timeToMinutes(value: string) {
  const [hourText, minuteText] = value.split(":");

  const hour = Number(hourText);

  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function minutesToTime(value: number) {
  const normalized = ((value % 1440) + 1440) % 1440;

  const hour = Math.floor(normalized / 60);

  const minute = normalized % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function normalizeStandaloneTime(value: string): string | undefined {
  const cleaned = cleanCell(value)
    .toLowerCase()
    .replace(/\./g, ":")
    .replace(/\s+/g, " ");

  if (!cleaned) {
    return undefined;
  }

  const normalized = normalizeTime(cleaned);

  if (normalized) {
    return normalized;
  }

  /*
   * Supports headers such as:
   * 8
   * 8am
   * 8:00
   * 08:00
   * 1pm
   */
  const match = cleaned.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/i);

  if (!match) {
    return undefined;
  }

  let hour = Number(match[1]);

  const minute = Number(match[2] ?? 0);

  const meridiem = match[3]?.toLowerCase();

  if (hour > 23 || minute > 59) {
    return undefined;
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      return undefined;
    }

    if (meridiem === "pm" && hour !== 12) {
      hour += 12;
    }

    if (meridiem === "am" && hour === 12) {
      hour = 0;
    }
  } else if (hour >= 1 && hour <= 7) {
    /*
     * University timetable headers commonly move
     * from morning into afternoon:
     * 8 9 10 11 12 1 2 3 4
     *
     * Individual values 1-7 without AM/PM are
     * interpreted as afternoon.
     */
    hour += 12;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function inferLastEnd(previousStart: string, currentStart: string) {
  const previous = timeToMinutes(previousStart);

  const current = timeToMinutes(currentStart);

  if (previous === null || current === null) {
    return undefined;
  }

  let duration = current - previous;

  if (duration <= 0) {
    duration += 1440;
  }

  if (duration <= 0 || duration > 240) {
    return undefined;
  }

  return minutesToTime(current + duration);
}

function detectTimeSlots(header: string[]): TimeSlot[] {
  /*
   * First support complete ranges:
   *
   * 8:00-9:00
   * 9:00-10:00
   */
  const directRanges = header
    .map((value, idx) => {
      const range = extractTimeRange(value);

      return {
        idx,
        startTime: range.startTime,
        endTime: range.endTime,
      };
    })
    .filter(
      (
        slot,
      ): slot is {
        idx: number;
        startTime: string;
        endTime: string;
      } => Boolean(slot.startTime && slot.endTime),
    );

  if (directRanges.length >= 2) {
    return directRanges;
  }

  /*
   * Then support boundary headers:
   *
   * 8:00 | 9:00 | 10:00 | 11:00
   */
  const boundaries = header
    .map((value, idx) => ({
      idx,

      time: normalizeStandaloneTime(value),
    }))
    .filter(
      (
        item,
      ): item is {
        idx: number;
        time: string;
      } => Boolean(item.time),
    );

  if (boundaries.length < 2) {
    return [];
  }

  const slots: TimeSlot[] = [];

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const current = boundaries[index];

    const next = boundaries[index + 1];

    slots.push({
      idx: current.idx,

      startTime: current.time,

      endTime: next.time,
    });
  }

  /*
   * Infer the final class period using the duration
   * between the previous two boundaries.
   */
  if (boundaries.length >= 2) {
    const previous = boundaries[boundaries.length - 2];

    const last = boundaries[boundaries.length - 1];

    const inferredEnd = inferLastEnd(previous.time, last.time);

    if (inferredEnd) {
      slots.push({
        idx: last.idx,

        startTime: last.time,

        endTime: inferredEnd,
      });
    }
  }

  return slots;
}

/* =========================================================
   COURSE CELL DETAILS
   ========================================================= */

function splitDetails(cell: string, code: string) {
  const cleaned = cleanCell(cell);

  const escapedCode = code
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s*[-/]?\\s*");

  const rest = cleanCell(
    cleaned
      .replace(new RegExp(escapedCode, "i"), "")
      .replace(/^[-–—:|,;/]+/, ""),
  );

  if (!rest) {
    return {
      title: code,

      venue: "Venue not specified",
    };
  }

  /*
   * Example:
   * CSC 401 - Software Engineering - LT 2
   *
   * or
   *
   * CSC401 | Software Engineering | Hall A
   */
  const parts = rest
    .split(/\s*[|;]\s*|\s+[-–—]\s+/)
    .map(cleanCell)
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      title: parts.slice(0, -1).join(" - ") || code,

      venue: parts[parts.length - 1],
    };
  }

  /*
   * Compact timetable cells:
   * CSC401 LT2
   * CSC401 LAB1
   * CSC401 HALL A
   */
  const venueMatch = rest.match(
    /\b(?:LT|LH|HALL|LAB|ROOM|RM|AUD|AUDITORIUM|THEATRE)\s*[-:]?\s*[A-Z0-9 -]*\b/i,
  );

  if (venueMatch) {
    const venue = cleanCell(venueMatch[0]);

    const title = cleanCell(rest.replace(venueMatch[0], ""));

    return {
      title: title || code,

      venue: venue || "Venue not specified",
    };
  }

  return {
    title: rest || code,

    venue: "Venue not specified",
  };
}

/* =========================================================
   ENTRY CREATION
   ========================================================= */

function makeEntry(
  cell: string,
  day: WeekDay,
  startTime: string,
  endTime: string,
  context: Context,
): ParsedTimetableEntry | undefined {
  const cleaned = cleanCell(cell);

  const code = courseCode(cleaned);

  if (!code) {
    return undefined;
  }

  const details = splitDetails(cleaned, code);

  return {
    tempId: crypto.randomUUID(),

    courseCode: code,

    courseTitle: details.title,

    day,

    startTime,

    endTime,

    venue: details.venue,

    department: context.department,

    level: context.level,

    sourceLevel: context.level,

    isCarryOver: false,

    source: "imported_current_level",

    confidence: context.level || context.department ? "high" : "medium",

    warnings:
      details.venue === "Venue not specified" ? ["Venue was not detected"] : [],
  };
}

/* =========================================================
   ROW-BASED TIMETABLE
   ========================================================= */

function createEntry(
  values: string[],
  context: Context,
): ParsedTimetableEntry | undefined {
  const cleanedValues = values.map(cleanCell).filter(Boolean);

  const joined = cleanedValues.join(" | ");

  const code = courseCode(joined);

  const day = detectDay(joined);

  if (!code || !day) {
    return undefined;
  }

  const timeCell = cleanedValues.find((value) => {
    const range = extractTimeRange(value);

    return Boolean(range.startTime && range.endTime);
  });

  let { startTime, endTime } = extractTimeRange(timeCell ?? joined);

  if (!startTime || !endTime) {
    const times = cleanedValues
      .map(normalizeStandaloneTime)
      .filter((value): value is string => Boolean(value));

    startTime = times[0];

    endTime = times[1];
  }

  if (!startTime || !endTime) {
    return undefined;
  }

  return makeEntry(joined, day, startTime, endTime, context);
}

/* =========================================================
   MERGE CONTIGUOUS CELLS
   ========================================================= */

function mergeAdjacentEntries(entries: ParsedTimetableEntry[]) {
  const grouped = new Map<string, ParsedTimetableEntry[]>();

  for (const entry of entries) {
    const key = `${entry.day}|${entry.courseCode}|${entry.venue}`;

    const group = grouped.get(key) ?? [];

    group.push(entry);

    grouped.set(key, group);
  }

  const output: ParsedTimetableEntry[] = [];

  for (const group of grouped.values()) {
    const sorted = [...group].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );

    for (const entry of sorted) {
      const previous = output[output.length - 1];

      const canMerge =
        previous &&
        previous.day === entry.day &&
        previous.courseCode === entry.courseCode &&
        previous.venue === entry.venue &&
        previous.endTime === entry.startTime;

      if (canMerge) {
        previous.endTime = entry.endTime;

        previous.warnings = [
          ...new Set([...previous.warnings, ...entry.warnings]),
        ];

        continue;
      }

      output.push({
        ...entry,
      });
    }
  }

  return output;
}

/* =========================================================
   MATRIX / GRID PARSING
   ========================================================= */

function matrixEntries(rows: SourceRow[], defaultContext: Context) {
  const output: ParsedTimetableEntry[] = [];

  /*
   * Track headings while reading the sheet so a faculty
   * timetable containing multiple levels does not assign
   * every grid to one global level.
   */
  let context: Context = {
    ...defaultContext,
  };

  let currentSheet: string | undefined;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    if (currentSheet !== row.sheet) {
      currentSheet = row.sheet;

      const sheetHeading = maybeHeading(row.sheet);

      context = {
        department: sheetHeading.department ?? defaultContext.department,

        level: sheetHeading.level ?? defaultContext.level,

        faculty: sheetHeading.faculty ?? defaultContext.faculty,
      };
    }

    const header = row.values.map(cleanCell);

    const headerText = `${row.sheet} ${header.join(" ")}`;

    const heading = maybeHeading(headerText);

    if (heading.department) {
      context.department = heading.department;
    }

    if (heading.level) {
      context.level = heading.level;
    }

    if (heading.faculty) {
      context.faculty = heading.faculty;
    }

    /* =====================================================
       FORMAT A

             8:00   9:00   10:00   11:00
       MON   CSC401 CSC401 CSC403   CSC403
       ===================================================== */

    const timeSlots = detectTimeSlots(header);

    if (timeSlots.length >= 2) {
      const headerContext = {
        ...context,
      };

      for (let j = i + 1; j < Math.min(rows.length, i + 45); j += 1) {
        const nextRow = rows[j];

        if (nextRow.sheet !== row.sheet) {
          break;
        }

        const values = nextRow.values.map(cleanCell);

        const joined = values.join(" ");

        const nextHeading = maybeHeading(`${nextRow.sheet} ${joined}`);

        /*
         * Stop before another explicit level or
         * department section begins.
         */
        if (
          j > i + 1 &&
          (nextHeading.department || nextHeading.level) &&
          !detectDay(joined)
        ) {
          break;
        }

        const day = detectDay(joined);

        if (!day) {
          continue;
        }

        const rowContext: Context = {
          department: nextHeading.department ?? headerContext.department,

          level: nextHeading.level ?? headerContext.level,

          faculty: nextHeading.faculty ?? headerContext.faculty,
        };

        for (const slot of timeSlots) {
          const cell = values[slot.idx] ?? "";

          const entry = makeEntry(
            cell,
            day,
            slot.startTime,
            slot.endTime,
            rowContext,
          );

          if (entry) {
            output.push(entry);
          }
        }
      }
    }

    /* =====================================================
       FORMAT B

       TIME      MONDAY  TUESDAY  WEDNESDAY
       8-9       CSC401  CSC405   CSC407
       9-10      CSC401  CSC405   CSC409
       ===================================================== */

    const dayColumns = header
      .map((value, idx) => ({
        idx,

        day: detectDay(value),
      }))
      .filter(
        (
          item,
        ): item is {
          idx: number;
          day: WeekDay;
        } => Boolean(item.day),
      );

    if (dayColumns.length >= 2) {
      const headerContext = {
        ...context,
      };

      for (let j = i + 1; j < Math.min(rows.length, i + 60); j += 1) {
        const nextRow = rows[j];

        if (nextRow.sheet !== row.sheet) {
          break;
        }

        const values = nextRow.values.map(cleanCell);

        const joined = values.join(" ");

        const nextHeading = maybeHeading(`${nextRow.sheet} ${joined}`);

        if (
          j > i + 1 &&
          (nextHeading.level || nextHeading.department) &&
          !courseCode(joined)
        ) {
          break;
        }

        const rangeCell = values.find((value) => {
          const range = extractTimeRange(value);

          return Boolean(range.startTime && range.endTime);
        });

        let range = extractTimeRange(rangeCell ?? joined);

        /*
         * Some sheets give start/end as two separate cells.
         */
        if (!range.startTime || !range.endTime) {
          const standaloneTimes = values
            .map(normalizeStandaloneTime)
            .filter((value): value is string => Boolean(value));

          if (standaloneTimes.length >= 2) {
            range = {
              startTime: standaloneTimes[0],

              endTime: standaloneTimes[1],
            };
          }
        }

        if (!range.startTime || !range.endTime) {
          continue;
        }

        const rowContext: Context = {
          department: nextHeading.department ?? headerContext.department,

          level: nextHeading.level ?? headerContext.level,

          faculty: nextHeading.faculty ?? headerContext.faculty,
        };

        for (const column of dayColumns) {
          const cell = values[column.idx] ?? "";

          const entry = makeEntry(
            cell,
            column.day,
            range.startTime,
            range.endTime,
            rowContext,
          );

          if (entry) {
            output.push(entry);
          }
        }
      }
    }
  }

  return mergeAdjacentEntries(output);
}

/* =========================================================
   LOOSE FALLBACK
   ========================================================= */

function looseEntries(rows: SourceRow[], defaultContext: Context) {
  const output: ParsedTimetableEntry[] = [];

  let context: Context = {
    ...defaultContext,
  };

  let currentSheet: string | undefined;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    if (currentSheet !== row.sheet) {
      currentSheet = row.sheet;

      const sheetHeading = maybeHeading(row.sheet);

      context = {
        department: sheetHeading.department ?? defaultContext.department,

        level: sheetHeading.level ?? defaultContext.level,

        faculty: sheetHeading.faculty ?? defaultContext.faculty,
      };
    }

    const current = cleanCell(row.values.join(" | "));

    const heading = maybeHeading(`${row.sheet} ${current}`);

    if (heading.department) {
      context.department = heading.department;
    }

    if (heading.level) {
      context.level = heading.level;
    }

    if (heading.faculty) {
      context.faculty = heading.faculty;
    }

    if (!courseCode(current)) {
      continue;
    }

    const nearbyRows = [
      rows[i - 3],
      rows[i - 2],
      rows[i - 1],
      rows[i],
      rows[i + 1],
      rows[i + 2],
      rows[i + 3],
    ].filter((nearby): nearby is SourceRow =>
      Boolean(nearby && nearby.sheet === row.sheet),
    );

    const nearbyCells = nearbyRows
      .flatMap((nearby) => nearby.values)
      .map(cleanCell)
      .filter(Boolean);

    const nearbyText = nearbyCells.join(" | ");

    const day = detectDay(current) ?? detectDay(nearbyText);

    if (!day) {
      continue;
    }

    let { startTime, endTime } = extractTimeRange(current);

    if (!startTime || !endTime) {
      for (const value of nearbyCells) {
        const range = extractTimeRange(value);

        if (range.startTime && range.endTime) {
          startTime = range.startTime;

          endTime = range.endTime;

          break;
        }
      }
    }

    if (!startTime || !endTime) {
      const times = nearbyCells
        .map(normalizeStandaloneTime)
        .filter((value): value is string => Boolean(value));

      if (times.length >= 2) {
        startTime = times[0];

        endTime = times[1];
      }
    }

    if (startTime && endTime) {
      const entry = makeEntry(current, day, startTime, endTime, context);

      if (entry) {
        output.push(entry);
      }
    }
  }

  return output;
}

/* =========================================================
   DEDUPE
   ========================================================= */

function dedupe(entries: ParsedTimetableEntry[]) {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = `${entry.courseCode}|${entry.day}|${entry.startTime}|${entry.endTime}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

/* =========================================================
   SECTION HELPERS
   ========================================================= */

function sameSectionContext(
  section: ParsedTimetableSection,
  entry: ParsedTimetableEntry,
) {
  const levelMatches =
    section.level === entry.level || (!section.level && !entry.level);

  const departmentMatches =
    section.department === entry.department ||
    (!section.department && !entry.department);

  return levelMatches && departmentMatches;
}

function addEntryToBestSection(
  sections: ParsedTimetableSection[],
  entry: ParsedTimetableEntry,
  fallbackContext: Context,
) {
  let target = sections.find((section) => sameSectionContext(section, entry));

  if (!target) {
    target = newSection(
      entry.department ?? fallbackContext.department,

      entry.level ?? fallbackContext.level,

      fallbackContext.faculty,
    );

    sections.push(target);
  }

  target.entries.push(entry);
}

/* =========================================================
   MAIN NORMALIZATION
   ========================================================= */

export function normalizeRows(rows: SourceRow[]): ParsedTimetableSection[] {
  const sections: ParsedTimetableSection[] = [];

  let current = newSection();

  sections.push(current);

  let currentSheet: string | undefined;

  for (const row of rows) {
    if (currentSheet !== row.sheet) {
      currentSheet = row.sheet;

      const sheetHeading = maybeHeading(row.sheet);

      if (
        sheetHeading.department ||
        sheetHeading.level ||
        sheetHeading.faculty
      ) {
        current = newSection(
          sheetHeading.department,
          sheetHeading.level,
          sheetHeading.faculty,
        );

        sections.push(current);
      }
    }

    const text = row.values.filter(Boolean).map(cleanCell).join(" ").trim();

    if (!text) {
      continue;
    }

    const heading = maybeHeading(`${row.sheet} ${text}`);

    if (heading.level || heading.department || heading.faculty) {
      const nextDepartment = heading.department ?? current.department;

      const nextLevel = heading.level ?? current.level;

      const nextFaculty = heading.faculty ?? current.faculty;

      const changedSection =
        Boolean(heading.level && heading.level !== current.level) ||
        Boolean(
          heading.department && heading.department !== current.department,
        );

      if (changedSection) {
        current = newSection(nextDepartment, nextLevel, nextFaculty);

        sections.push(current);
      } else {
        current.department = nextDepartment;

        current.level = nextLevel;

        current.faculty = nextFaculty;
      }
    }

    const entry = createEntry(row.values, {
      department: current.department,

      level: current.level,

      faculty: current.faculty,
    });

    if (entry) {
      current.entries.push(entry);
    }
  }

  const fallbackContext: Context = {
    department: sections.find((section) => section.department)?.department,

    level: sections.find((section) => section.level)?.level,

    faculty: sections.find((section) => section.faculty)?.faculty,
  };

  const fallback = dedupe([
    ...matrixEntries(rows, fallbackContext),

    ...looseEntries(rows, fallbackContext),
  ]);

  for (const entry of fallback) {
    addEntryToBestSection(sections, entry, fallbackContext);
  }

  for (const section of sections) {
    section.entries = dedupe(mergeAdjacentEntries(section.entries));
  }

  return sections.filter((section) => section.entries.length > 0);
}

/* =========================================================
   DOCX / PDF TEXT NORMALIZATION
   ========================================================= */

export function normalizeText(text: string): ParsedTimetableSection[] {
  const normalized = text.replace(/\f/g, "\n").replace(/\u00a0/g, " ");

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = lines.map((line) => ({
    sheet: "Document",

    values: line
      .split(/\t|\s{2,}|\|/)
      .map((value) => value.trim())
      .filter(Boolean),
  }));

  return normalizeRows(rows);
}

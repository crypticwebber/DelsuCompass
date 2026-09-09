import path from "node:path";

import { UserModel } from "../../users/user.model.js";
import { AppError } from "../../../utils/AppError.js";
import { TimetableEntryModel } from "../timetable.model.js";
import { ReminderModel } from "../../reminders/reminder.model.js";

import { parseCsv } from "./parsers/csv.parser.js";
import { parseXlsx } from "./parsers/xlsx.parser.js";
import { parseDocx } from "./parsers/docx.parser.js";
import { parsePdf } from "./parsers/pdf.parser.js";

import { normalizeRows, normalizeText } from "./timetable-import.normalizer.js";

import { matchCurrentSections } from "./utils/timetable-matcher.js";

import { sameDepartment } from "./normalizers/department.normalizer.js";

import type {
  ImportSourceType,
  ParsedTimetableEntry,
} from "./timetable-import.types.js";

/* =========================================================
   FILE TYPE
   ========================================================= */

function sourceType(filename: string): ImportSourceType {
  const ext = path.extname(filename).toLowerCase().slice(1);

  if (["csv", "xlsx", "docx", "pdf"].includes(ext)) {
    return ext as ImportSourceType;
  }

  throw new AppError(
    400,
    "UNSUPPORTED_TIMETABLE_FILE",
    "Upload a CSV, XLSX, DOCX or text-based PDF timetable",
  );
}

/* =========================================================
   SCHEDULE OVERLAP
   ========================================================= */

function hasOverlap(
  a: {
    day: string;
    startTime: string;
    endTime: string;
  },
  b: {
    day: string;
    startTime: string;
    endTime: string;
  },
) {
  return a.day === b.day && a.startTime < b.endTime && a.endTime > b.startTime;
}

/* =========================================================
   ENTRY DEDUPLICATION
   ========================================================= */

function dedupeEntries(
  entries: ParsedTimetableEntry[],
): ParsedTimetableEntry[] {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = [
      entry.courseCode,
      entry.day,
      entry.startTime,
      entry.endTime,
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

/* =========================================================
   IMPORT SERVICE
   ========================================================= */

export const timetableImportService = {
  /* =======================================================
     ANALYZE TIMETABLE
     ======================================================= */

  async analyze(userId: string, file: Express.Multer.File) {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User was not found");
    }

    if (!user.department || !user.level) {
      throw new AppError(
        400,
        "PROFILE_INCOMPLETE",
        "Add your department and level to your profile before importing a timetable",
      );
    }

    const type = sourceType(file.originalname);

    /* -----------------------------------------------------
       Parse uploaded document
       ----------------------------------------------------- */

    let sections;

    if (type === "csv") {
      sections = normalizeRows(parseCsv(file.buffer));
    } else if (type === "xlsx") {
      sections = normalizeRows(await parseXlsx(file.buffer));
    } else if (type === "docx") {
      sections = normalizeText(await parseDocx(file.buffer));
    } else {
      sections = normalizeText(await parsePdf(file.buffer));
    }

    /* -----------------------------------------------------
       Nothing recognizable
       ----------------------------------------------------- */

    if (!sections.length) {
      throw new AppError(
        422,
        "TIMETABLE_NOT_RECOGNIZED",
        "The timetable file was opened successfully, but no classes could be detected. Excel timetables work best when course codes, weekdays and class times are visible as text. You can try another copy of the faculty timetable or add classes manually.",
      );
    }

    /* -----------------------------------------------------
       Student academic profile
       ----------------------------------------------------- */

    const profile = {
      faculty: user.faculty,
      department: user.department,
      level: user.level,
    };

    /* -----------------------------------------------------
       Match timetable sections against student profile
       ----------------------------------------------------- */

    const match = matchCurrentSections(sections, profile);

    const currentIds = new Set(match.ids);

    /*
     * IMPORTANT:
     *
     * Explicitly declare this as ParsedTimetableEntry[].
     *
     * Without this annotation TypeScript infers the source
     * property as the literal:
     *
     * "imported_current_level"
     *
     * which prevents us from later assigning the result of
     * dedupeEntries(), because that function correctly
     * returns ParsedTimetableEntry[].
     */

    let currentLevelEntries: ParsedTimetableEntry[] = sections
      .filter((section) => currentIds.has(section.id))
      .flatMap((section) => section.entries)
      .map(
        (entry): ParsedTimetableEntry => ({
          ...entry,

          isCarryOver: false,

          source: "imported_current_level",
        }),
      );

    /* -----------------------------------------------------
       Faculty timetable fallback
       -----------------------------------------------------

       Some faculty timetables do not contain reliable
       department or level headings.

       If the timetable parser successfully found classes,
       but the section matcher could not confidently identify
       the student's section, expose suitable entries for
       manual review instead of rejecting the upload.
       ----------------------------------------------------- */

    if (!currentLevelEntries.length) {
      const fallbackSections = sections.filter(
        (section) => !section.level || section.level === user.level,
      );

      /*
       * Prefer sections matching the student's department
       * where department information exists.
       */

      const sameDepartmentSections = fallbackSections.filter(
        (section) =>
          !section.department ||
          sameDepartment(section.department, user.department ?? undefined),
      );

      const preferredSections = sameDepartmentSections.length
        ? sameDepartmentSections
        : fallbackSections;

      const fallbackEntries = preferredSections.flatMap(
        (section) => section.entries,
      );

      if (fallbackEntries.length) {
        currentLevelEntries = fallbackEntries.map(
          (entry): ParsedTimetableEntry => ({
            ...entry,

            isCarryOver: false,

            source: "imported_current_level",
          }),
        );
      } else if (sections.length === 1) {
        currentLevelEntries = sections[0].entries.map(
          (entry): ParsedTimetableEntry => ({
            ...entry,

            isCarryOver: false,

            source: "imported_current_level",
          }),
        );
      }
    }

    /*
     * This assignment is now valid because
     * currentLevelEntries is explicitly
     * ParsedTimetableEntry[].
     */

    currentLevelEntries = dedupeEntries(currentLevelEntries);

    /* -----------------------------------------------------
       Detect possible carry-over courses
       ----------------------------------------------------- */

    const carryOverCandidates: ParsedTimetableEntry[] = dedupeEntries(
      sections
        .filter(
          (section) =>
            Boolean(section.level && section.level < user.level!) &&
            (sameDepartment(section.department, user.department ?? undefined) ||
              !section.department),
        )
        .flatMap((section) => section.entries)
        .map(
          (entry): ParsedTimetableEntry => ({
            ...entry,

            isCarryOver: true,

            source: "imported_carry_over",
          }),
        ),
    );

    /* -----------------------------------------------------
       Analysis warnings
       ----------------------------------------------------- */

    const warnings: string[] = [];

    if (!match.ids.length && currentLevelEntries.length) {
      warnings.push(
        "The file did not contain a reliable department/level heading. Detected classes are shown for manual review before import.",
      );
    }

    if (!currentLevelEntries.length) {
      warnings.push(
        "Classes were detected, but your current-level section could not be matched confidently. Review the detected timetable structure or add the required classes manually.",
      );
    }

    if (currentLevelEntries.some((entry) => entry.warnings.length > 0)) {
      warnings.push(
        "Some class details such as venues could not be detected automatically. Review the detected rows before importing.",
      );
    }

    if (type === "pdf") {
      warnings.push(
        "PDF extraction works best for text-based PDFs. Scanned or image-only PDFs may not be readable.",
      );
    }

    /* -----------------------------------------------------
       Return preview
       ----------------------------------------------------- */

    return {
      fileName: file.originalname,

      sourceType: type,

      studentProfile: profile,

      matchedCurrentSectionIds: match.ids,

      confidence: match.confidence,

      currentLevelEntries,

      carryOverCandidates,

      detectedSections: sections.map((section) => ({
        id: section.id,

        department: section.department,

        level: section.level,

        faculty: section.faculty,

        entryCount: section.entries.length,
      })),

      warnings,
    };
  },

  /* =======================================================
     CONFIRM IMPORT
     ======================================================= */

  async confirm(
    userId: string,
    input: {
      entries: ParsedTimetableEntry[];

      mode: "add" | "replace";

      defaultReminderMinutes: number | null;

      allowConflicts: boolean;
    },
  ) {
    /* -----------------------------------------------------
       Validate imported times
       ----------------------------------------------------- */

    if (input.entries.some((entry) => entry.endTime <= entry.startTime)) {
      throw new AppError(
        400,
        "INVALID_CLASS_TIME",
        "Every imported class must end after it starts",
      );
    }

    /* -----------------------------------------------------
       Get existing timetable
       ----------------------------------------------------- */

    const existing =
      input.mode === "add"
        ? await TimetableEntryModel.find({
            userId,
          }).lean()
        : [];

    /* -----------------------------------------------------
       Remove duplicates
       ----------------------------------------------------- */

    const existingKeys = new Set(
      existing.map((entry) =>
        [entry.courseCode, entry.day, entry.startTime, entry.endTime].join("|"),
      ),
    );

    const importKeys = new Set<string>();

    const entries = input.entries.filter((entry) => {
      const key = [
        entry.courseCode,
        entry.day,
        entry.startTime,
        entry.endTime,
      ].join("|");

      if (existingKeys.has(key) || importKeys.has(key)) {
        return false;
      }

      importKeys.add(key);

      return true;
    });

    if (!entries.length) {
      throw new AppError(
        409,
        "NO_NEW_TIMETABLE_ENTRIES",
        "All selected classes already exist on your timetable",
      );
    }

    /* -----------------------------------------------------
       Detect timetable conflicts
       ----------------------------------------------------- */

    const combined = [
      ...existing.map((entry) => ({
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        courseCode: entry.courseCode,
      })),

      ...entries.map((entry) => ({
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        courseCode: entry.courseCode,
      })),
    ];

    const conflicts: Array<{
      a: string;
      b: string;
    }> = [];

    for (let i = 0; i < combined.length; i += 1) {
      for (let j = i + 1; j < combined.length; j += 1) {
        if (hasOverlap(combined[i], combined[j])) {
          conflicts.push({
            a: combined[i].courseCode,
            b: combined[j].courseCode,
          });
        }
      }
    }

    const hasCarryOverConflict =
      entries.some((entry) => entry.isCarryOver) && conflicts.length > 0;

    if (conflicts.length && !input.allowConflicts) {
      throw new AppError(
        409,
        "IMPORT_TIMETABLE_CONFLICT",
        hasCarryOverConflict
          ? "Imported classes contain schedule clashes, including possible carry-over clashes. Confirm that you want to keep them."
          : "Imported classes overlap your existing timetable.",
        {
          conflicts,
        },
      );
    }

    /* -----------------------------------------------------
       Replace existing timetable
       ----------------------------------------------------- */

    if (input.mode === "replace") {
      const old = await TimetableEntryModel.find({
        userId,
      })
        .select("_id")
        .lean();

      if (old.length > 0) {
        await ReminderModel.deleteMany({
          userId,

          timetableEntryId: {
            $in: old.map((entry) => entry._id),
          },
        });
      }

      await TimetableEntryModel.deleteMany({
        userId,
      });
    }

    /* -----------------------------------------------------
       Create timetable entries
       ----------------------------------------------------- */

    const created = await TimetableEntryModel.insertMany(
      entries.map((entry) => ({
        userId,

        courseCode: entry.courseCode,

        courseTitle: entry.courseTitle,

        lecturer: entry.lecturer,

        day: entry.day,

        startTime: entry.startTime,

        endTime: entry.endTime,

        venue: entry.venue,

        isCarryOver: entry.isCarryOver,

        sourceLevel: entry.sourceLevel,

        source: entry.source,
      })),
    );

    /* -----------------------------------------------------
       Create reminders
       ----------------------------------------------------- */

    let reminderCount = 0;

    if (input.defaultReminderMinutes !== null && created.length > 0) {
      try {
        const reminders = await ReminderModel.insertMany(
          created.map((entry) => ({
            userId,

            timetableEntryId: entry._id,

            minutesBefore: input.defaultReminderMinutes,

            enabled: true,
          })),
          {
            ordered: false,
          },
        );

        reminderCount = reminders.length;
      } catch {
        /*
         * Timetable import itself should remain successful
         * even if one or more reminder records cannot be
         * created.
         */
        reminderCount = 0;
      }
    }

    /* -----------------------------------------------------
       Result
       ----------------------------------------------------- */

    return {
      createdCount: created.length,

      reminderCount,

      conflicts,
    };
  },
};

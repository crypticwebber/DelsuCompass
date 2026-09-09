# Phase 4.1 — Timetable Import, Carry-over Courses and Flexible Reminders

This enhancement completes the timetable workflow without introducing AI.

## Supported timetable inputs
- CSV
- XLSX
- DOCX
- text-based PDF

Files are processed in memory and are not permanently stored.

## Rule-based matching
The importer extracts timetable rows, detects department/level headings, normalizes common department/level formats and compares them with the authenticated student's academic profile.

The student must have a department and level in their profile before using automatic matching.

## Import workflow
1. Upload a timetable file.
2. Parse and normalize the document.
3. Match the student's current department and level.
4. Present current-level classes for review/correction.
5. Present earlier-level courses as carry-over candidates.
6. Student selects only applicable carry-over courses.
7. Student chooses add or replace mode.
8. Student optionally applies a default reminder in minutes or hours.
9. Backend checks duplicates and schedule clashes.
10. Student can explicitly confirm legitimate carry-over clashes.
11. Classes and reminders are persisted.

## Carry-over model
A timetable entry can contain:
- `isCarryOver`
- `sourceLevel`
- `source` (`manual`, `imported_current_level`, `imported_carry_over`)

Carry-over is deliberately not a separate entity because it remains a timetable-entry property.

## Reliability boundary
Scanned/image-only PDFs are not guaranteed to work because this phase does not add AI or OCR. Students can correct parser results in the preview or use manual carry-over entry.

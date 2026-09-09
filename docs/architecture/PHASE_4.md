# Phase 4 — Timetable + Class Reminders

## Delivered
- Student-owned `TimetableEntry` Mongoose model and indexed weekly schedule.
- Student-owned `Reminder` model linked to `TimetableEntry` without duplicating class data.
- Timetable CRUD service/controller/routes/validation.
- Reminder CRUD service/controller/routes/validation.
- Overlap detection for classes on the same weekday.
- Cascade deletion of a class reminder when its class is removed.
- Full timetable interface with add/edit/delete, weekly grouping, validation, loading/empty/error/success states.
- Reminder interface with class selection, configurable lead time, enable/disable and deletion.
- Dashboard integration showing today's real timetable data and reminder indicators.

## Authorization
Every Phase 4 endpoint requires `authenticate` plus the `student` role. Service queries always include the authenticated `userId`, preventing cross-account access even if an arbitrary MongoDB ID is supplied.

## Notification boundary
Phase 4 stores recurring reminder preferences. The later Notifications phase will consume these settings for actual in-app alert delivery. This avoids prematurely duplicating notification infrastructure while still completing class reminder management.

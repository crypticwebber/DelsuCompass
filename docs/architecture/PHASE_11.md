# Phase 11 — Notifications + Global Search

Phase 11 replaces the notification and search foundations with working student features.

## Notifications
- Persistent per-student notification records with read/unread state.
- Upcoming class reminders are synchronized from Timetable + Reminder data.
- Moderation decisions are synchronized for the student's accommodation, community, event and opportunity submissions.
- Active safety alerts are synchronized into each student's notification inbox.
- Notification bell displays unread count and refreshes periodically.
- Students can mark one or all notifications as read.
- Future class reminders remain scheduled and are only surfaced when due.

Continuous live browser push is intentionally deferred; Phase 11 provides in-app notifications. A later production enhancement may add Web Push/email delivery without changing the notification domain model.

## Global Search
Global Search returns only information the student is allowed to discover:
- approved accommodation
- approved community posts
- approved events
- approved opportunities
- active safety alerts
- active campus/Abraka locations

Private budget records, personal timetable entries, private safety reports and pending/rejected submissions are excluded from global search.

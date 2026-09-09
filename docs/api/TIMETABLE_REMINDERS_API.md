# Timetable & reminders API — Phase 4

All endpoints require a valid student access token.

## Timetable
- `GET /api/v1/timetable`
- `POST /api/v1/timetable`
- `GET /api/v1/timetable/:id`
- `PATCH /api/v1/timetable/:id`
- `DELETE /api/v1/timetable/:id`

Optional list filters: `day`, `courseCode`.
A student can only read and mutate their own entries. Overlapping class times on the same weekday are rejected.

## Reminders
- `GET /api/v1/reminders`
- `POST /api/v1/reminders`
- `PATCH /api/v1/reminders/:id`
- `DELETE /api/v1/reminders/:id`

One reminder setting may be attached to each timetable entry. A reminder stores how many minutes before the recurring class the student wants to be alerted. Actual in-app notification delivery is connected during the Notifications phase; Phase 4 provides the persisted reminder settings and UI.

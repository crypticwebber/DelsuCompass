# Timetable module

Student-owned weekly class schedule management.

- CRUD is restricted to the authenticated student who owns each entry.
- Class times use 24-hour `HH:mm` strings and named weekdays.
- Overlapping classes on the same day are rejected with `TIMETABLE_CONFLICT`.
- Deleting a timetable entry cascades to its linked reminder.

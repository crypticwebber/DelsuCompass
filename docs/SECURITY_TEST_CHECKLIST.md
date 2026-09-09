# DELSU Compass Security & Regression Checklist

Use this checklist before the final deployment phase.

## Authentication
- Invalid passwords return a generic credentials error.
- Public registration always creates `student` accounts.
- Disabled accounts cannot login, refresh, or use an existing access token on protected APIs.
- Student tokens cannot access administrator routes.
- Administrator tokens cannot use student-only private timetable/budget routes.
- Refresh token rotation invalidates the previous refresh session.
- Logout revokes the current refresh session.

## Input security
- Zod validation rejects invalid request shapes.
- MongoDB keys beginning with `$` or containing `.` are rejected.
- Oversized JSON payloads are rejected.
- Timetable uploads reject unsupported extension/MIME combinations.
- Timetable upload is limited to 8 MB and one file.

## Privacy
- Budget/expense APIs only return the authenticated student's records.
- Timetable/reminder APIs only return the authenticated student's records.
- Safety reports are not public alerts.
- Live navigation location is not persisted as a movement history.
- Global search excludes private user data, private safety reports and pending/rejected content.

## Moderation
- Pending accommodation/community/event/opportunity content is not public.
- Editing moderated student content returns it to moderation where designed.
- Only administrators can approve/reject moderated content.
- Official information is administrator-managed and only published records are public.

## UX regression
- Student navigation works on desktop and mobile.
- Admin navigation works on desktop and mobile.
- Route-level lazy loading shows the Compass loading state.
- Unexpected render errors show the recovery screen rather than a blank page.
- Empty/loading/error states remain understandable in each feature.

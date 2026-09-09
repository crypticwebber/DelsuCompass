# DELSU Compass — Functionality Correction Pass

This pass prioritizes runtime functionality while preserving the approved DELSU blue/white interface.

## Main runtime fix

The project uses Express 5. Express 5 exposes `req.query` through a getter. The previous validation middleware attempted to assign parsed Zod query data directly back to `req.query`. That breaks validated GET endpoints at runtime while non-validated stats/count endpoints can still work.

This explains the observed pattern where admin dashboard counts were correct but detailed queues, student lists, timetable data, budget summaries and several filtered public lists appeared empty or failed to load.

The validation middleware now shadows the Express 5 query getter safely with the parsed/defaulted Zod query object.

Affected flows include:

- Admin student account list
- Accommodation moderation lists/reviews/reports
- Community moderation lists/reports
- Events moderation lists/reports
- Opportunities moderation lists/reports
- Safety moderation lists
- Information Hub admin/public lists
- Student timetable listing
- Budget plan/summary/expense listing
- Public accommodation/event/opportunity/community/safety/location filtered lists

## Additional corrections

- Validation errors now return the first useful field message instead of only `Invalid request data`.
- Admin user pagination has safe service-level defaults.
- Cloudinary browser uploads no longer force a multipart Content-Type header, allowing the browser to provide the required boundary for Multer.
- Timetable import supports additional faculty timetable formats, including compact times such as `0800-1000`, matrix layouts, flat extracted PDF/DOCX rows and less reliable department/level headings.
- Timetable import falls back to reviewable detected entries when classes exist but the department/level heading cannot be matched confidently.
- Admin accommodation creation now has clear client-side required-field checks and a responsive modal.
- Event submission now validates required fields locally before the request is sent.
- Information Hub API payloads now normalize optional URLs/dates cleanly.
- Safety submission switches to `My reports` after a successful report so the new report is immediately visible.
- Mobile overflow safeguards were added globally without redesigning the approved UI.
- Forgot-password visual panel now includes its required image and references Resend rather than SMTP.

## Regression tests added

- Express 5 validated query handling and query defaults.
- Compact timetable time normalization and ranges.

## Local verification order

Backend:

```bash
npm run typecheck
npm test
npm run build
```

Frontend:

```bash
npm run typecheck
npm run build
```

Then runtime-check student and administrator flows with MongoDB connected.

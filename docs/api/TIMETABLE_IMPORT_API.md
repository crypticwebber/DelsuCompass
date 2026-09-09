# Timetable Import API

## Analyze timetable
`POST /api/v1/timetable/import/analyze`

Authentication: student access token.
Content type: `multipart/form-data`
Field: `file`
Supported: `.csv`, `.xlsx`, `.docx`, `.pdf`
Maximum size: 10 MB.

The response includes the matched profile, current-level entries, previous-level carry-over candidates, detected sections, confidence and warnings.

## Confirm import
`POST /api/v1/timetable/import/confirm`

```json
{
  "entries": [],
  "mode": "add",
  "defaultReminderMinutes": 60,
  "allowConflicts": false
}
```

`mode` is either `add` or `replace`.

`allowConflicts` must only be enabled after the student reviews legitimate timetable clashes, particularly carry-over courses.

## Profile dependency
`PATCH /api/v1/users/me` can update faculty, department and level used by the matcher.

# Administrator API

All endpoints require a valid administrator access token.

## Overview

`GET /api/v1/admin/overview`

Returns aggregated student-account, moderation-queue, public-content and recent-registration counts.

## Student account list

`GET /api/v1/admin/users`

Optional query parameters:
- `search`
- `status=active|disabled`
- `verified=true|false`
- `page`
- `limit`

Only student accounts are returned. Private budget, timetable and reminder data are not included.

## Enable or disable a student

`PATCH /api/v1/admin/users/:id/status`

Body:
```json
{ "isActive": false }
```

Disabling also revokes the student's active refresh sessions.

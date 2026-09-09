# Notifications + Search API

## Notifications
- `GET /api/v1/notifications`
- `GET /api/v1/notifications?unread=true`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`

Notification types: `class_reminder`, `moderation`, `safety_alert`, `system`.

## Global Search
`GET /api/v1/search?q=<query>&type=<optional-type>`

Supported type filters: `all`, `accommodation`, `community`, `events`, `opportunities`, `safety`, `locations`.

Search requires at least two characters and only queries student-discoverable/public records.

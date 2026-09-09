# Phase 13 Integration API

All endpoints below require an authenticated student account unless stated otherwise.

## GET /api/v1/integration/dashboard

Returns the current student's cross-feature dashboard projection.

Response data contains:

- `today`
- `classes`
- `safetyAlerts`
- `events`
- `opportunities`
- `notices`
- `budget`
- `unreadNotifications`

The endpoint intentionally returns a projection rather than copying data into a separate dashboard collection.

## Global search extension

`GET /api/v1/search?q=<query>&type=information`

Searches published, non-expired official notices and published public guide articles. `type=all` now includes these results as well.

## Notification extension

The existing notification sync can now create these additional notification types:

- `official_notice`
- `event_reminder`
- `opportunity_deadline`

Notification `sourceKey` values keep each source occurrence idempotent.

## Map deep links

Frontend route examples:

- `/app/map?q=Site%20III`
- `/app/map?id=<locationId>`

These are frontend deep links rather than new backend APIs.

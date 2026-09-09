# Safety API — Phase 8

All endpoints require authentication.

## Student

### GET `/api/v1/safety/alerts`
Returns active public safety alerts. Optional query parameters: `category`, `severity`, `search`.

### GET `/api/v1/safety/alerts/:id`
Returns one active public safety alert.

### POST `/api/v1/safety/reports`
Submits a private safety report.

Example body:
```json
{
  "category": "road_hazard",
  "severity": "high",
  "description": "Large obstruction affecting the road close to the junction.",
  "locationName": "Site II junction",
  "incidentAt": "2026-09-07T10:30:00.000Z",
  "allowAnonymousPublicUse": true
}
```

### GET `/api/v1/safety/reports/mine`
Returns reports submitted by the logged-in student.

## Administrator

### GET `/api/v1/admin/safety/stats`
Returns moderation counts.

### GET `/api/v1/admin/safety/reports`
Optional query: `status`, `severity`.

### PATCH `/api/v1/admin/safety/reports/:id`
```json
{
  "status": "reviewing",
  "resolutionNote": "Optional note"
}
```

### GET `/api/v1/admin/safety/alerts`
Optional query: `status`.

### POST `/api/v1/admin/safety/alerts`
Publishes an administrator-approved safety alert. `sourceReportId` is optional.

### PATCH `/api/v1/admin/safety/alerts/:id`
Updates or archives an alert.

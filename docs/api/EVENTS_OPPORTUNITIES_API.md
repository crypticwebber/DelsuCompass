# Events and Opportunities API

All routes are under `/api/v1` and require authentication.

## Student Events
- `GET /events` — approved events; filters: `category`, `search`, `upcoming`
- `GET /events/mine`
- `GET /events/:id`
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `POST /events/:id/reports`

## Admin Events
- `GET /admin/events/stats`
- `GET /admin/events/posts?status=pending`
- `PATCH /admin/events/posts/:id/moderate`
- `GET /admin/events/reports?status=pending`
- `PATCH /admin/events/reports/:id/resolve`

## Student Opportunities
- `GET /opportunities` — approved opportunities; filters: `type`, `search`, `active`
- `GET /opportunities/mine`
- `GET /opportunities/:id`
- `POST /opportunities`
- `PATCH /opportunities/:id`
- `DELETE /opportunities/:id`
- `POST /opportunities/:id/reports`

## Admin Opportunities
- `GET /admin/opportunities/stats`
- `GET /admin/opportunities/posts?status=pending`
- `PATCH /admin/opportunities/posts/:id/moderate`
- `GET /admin/opportunities/reports?status=pending`
- `PATCH /admin/opportunities/reports/:id/resolve`

# Community API

Student endpoints (authenticated student):
- GET `/api/v1/community` — approved posts; optional `category`, `search`, `area`
- GET `/api/v1/community/mine` — student's submissions
- GET `/api/v1/community/:id` — approved post
- POST `/api/v1/community` — submit for moderation
- PATCH `/api/v1/community/:id` — edit own post and return to pending
- DELETE `/api/v1/community/:id` — delete own post
- POST `/api/v1/community/:id/reports` — report an approved post

Administrator endpoints:
- GET `/api/v1/admin/community/stats`
- GET `/api/v1/admin/community/posts?status=pending`
- PATCH `/api/v1/admin/community/posts/:id/moderate`
- GET `/api/v1/admin/community/reports?status=pending`
- PATCH `/api/v1/admin/community/reports/:id/resolve`

Moderation statuses: `pending`, `approved`, `rejected`, `archived`.

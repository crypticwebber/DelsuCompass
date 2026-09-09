# Accommodation API — Phase 5

Student-authenticated endpoints:
- `GET /api/v1/accommodation` — approved listings; filters: `search`, `area`, `roomType`, `minPrice`, `maxPrice`, `maxDistance`, `sort`.
- `GET /api/v1/accommodation/:id` — approved detail and approved reviews.
- `GET /api/v1/accommodation/mine` — authenticated student's submissions.
- `POST /api/v1/accommodation` — submit a listing; always starts `pending`.
- `PATCH /api/v1/accommodation/:id` — edit own listing; returns to `pending`.
- `DELETE /api/v1/accommodation/:id` — delete own listing.
- `POST /api/v1/accommodation/:id/reviews` — one review per student/listing; starts `pending`.
- `POST /api/v1/accommodation/:id/reports` — report an approved listing.

Administrator-authenticated endpoints:
- `GET /api/v1/admin/accommodation/stats`
- `GET /api/v1/admin/accommodation/listings?status=pending`
- `PATCH /api/v1/admin/accommodation/listings/:id/moderate`
- `GET /api/v1/admin/accommodation/reviews?status=pending`
- `PATCH /api/v1/admin/accommodation/reviews/:id/moderate`
- `GET /api/v1/admin/accommodation/reports?status=pending`
- `PATCH /api/v1/admin/accommodation/reports/:id/resolve`

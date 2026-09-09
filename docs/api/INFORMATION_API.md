# Public Information API

## Public
- `GET /api/v1/information/explore` — aggregate public hub data.
- `GET /api/v1/information/notices` — published non-expired notices. Optional `category`, `featured`, `limit`.
- `GET /api/v1/information/notices/:id`
- `GET /api/v1/information/guides` — published guide articles. Optional `category`.
- `GET /api/v1/information/guides/:id`

## Administrator
Requires administrator JWT.
- `GET /api/v1/admin/information/notices`
- `POST /api/v1/admin/information/notices`
- `PATCH /api/v1/admin/information/notices/:id`
- `GET /api/v1/admin/information/guides`
- `POST /api/v1/admin/information/guides`
- `PATCH /api/v1/admin/information/guides/:id`

Official changing information should include `sourceUrl`/`sourceLabel` where possible. `expiresAt` keeps outdated notices from remaining public indefinitely.

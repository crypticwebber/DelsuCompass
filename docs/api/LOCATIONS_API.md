# Locations API

Student-only routes:

- `GET /api/v1/locations`
  - query: `category`, `search`, `area`, `campusSite`
  - returns active curated locations only
- `GET /api/v1/locations/:id`

Administrator-only routes:

- `GET /api/v1/admin/locations`
- `POST /api/v1/admin/locations`
- `PATCH /api/v1/admin/locations/:id`
- `DELETE /api/v1/admin/locations/:id` — soft-disables the marker

Location fields include `name`, `description`, `category`, `area`, `campusSite`, `latitude`, `longitude`, `address`, `isActive`, `isVerified`, and `sourceLabel`.

Live student GPS is handled entirely by the browser and is intentionally not an API endpoint.

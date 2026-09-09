# Authentication API

Base path: `/api/v1/auth`

- `POST /register` — public student registration
- `POST /login` — creates access token and refresh session
- `POST /refresh` — rotates the refresh session and returns a new access token
- `POST /logout` — revokes current refresh session
- `POST /verify-email` — verifies email using token
- `POST /resend-verification` — prepares a fresh verification token when eligible
- `GET /me` — authenticated current user

Administrator authorization check:
- `GET /api/v1/admin/access-check`

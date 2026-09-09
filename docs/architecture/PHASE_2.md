# Phase 2 — Authentication and Authorization

Implemented:
- Student registration (role is forced server-side to `student`)
- Secure Argon2id password hashing
- Login with access token + refresh session
- Short-lived access token returned to the client and held in memory
- Refresh token stored in an HTTP-only cookie
- Refresh-token rotation and database-backed revocation
- Logout
- Email-verification token generation and verification endpoint
- Protected `/auth/me`
- `authenticate` and `requireRole` middleware
- Administrator-only API access check
- Admin seeding script (administrators cannot self-register)
- Frontend session bootstrap through refresh endpoint
- Protected student and administrator route guards
- Login and registration forms with Zod + React Hook Form

## Security decisions

The frontend never chooses a role during registration. Public registration always creates a student. Administrators are created through the controlled seed script or future administrator tooling.

Access tokens are intentionally not stored in localStorage. The client holds the access token in memory, while the refresh token is an HTTP-only cookie and is rotated when refreshed.

## Frontend routes introduced
- `/login`
- `/register`
- `/verify-email?token=...`
- `/app/dashboard` (authenticated students/admins)
- `/admin/dashboard` (administrator only)

The Axios client also performs one-time access-token recovery through the refresh cookie when a protected request receives a 401 response. Concurrent expired-token requests share one refresh operation.

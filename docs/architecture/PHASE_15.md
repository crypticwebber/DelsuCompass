# Phase 15 — Security, Testing & Performance

Phase 15 hardens DELSU Compass without changing its approved product scope.

## Security hardening

- Global Helmet security headers and strict CORS allow-listing.
- Global API rate limit plus tighter authentication and timetable-upload rate limits.
- Request IDs are added to responses and server-side error logs for traceability.
- Request bodies, query strings and params reject MongoDB operator/dotted-key injection attempts.
- Sensitive authentication and budget responses are marked `Cache-Control: no-store`.
- Protected requests re-check the current user record, meaning disabled accounts lose API access immediately instead of waiting for an access token to expire.
- Timetable file uploads are memory-only, limited to one file / 8 MB, rate-limited, and validated using both extension and MIME type.
- Multer upload failures are normalized through the main API error contract.
- Passwords remain Argon2id hashed, refresh sessions remain revocable/rotated, and admin self-registration remains impossible.

## Test foundation

Vitest is now configured for backend unit/security tests. Initial coverage includes:

- timetable time normalization;
- department/level matching used by timetable import;
- timetable request validation;
- request ID generation;
- NoSQL operator/dotted-key rejection.

Commands:

```bash
npm test
npm run test:watch
npm run test:coverage
```

The test suite is designed to expand during regression testing without coupling test code to production modules.

## Frontend resilience and performance

- A top-level React Error Boundary now provides a controlled recovery screen instead of a blank application if an unexpected render error occurs.
- Feature pages are route-level lazy loaded so large modules such as Maps, Admin, Accommodation and Budget do not need to ship in the initial JavaScript bundle.
- Suspense provides a consistent DELSU Compass loading state while route chunks are downloaded.
- Existing TanStack Query caching remains the primary server-state cache.
- Reduced-motion support and the Phase 14 responsive system remain intact.

## Performance principles

- Compression is enabled for API responses.
- Authentication status is checked against indexed MongoDB `_id` lookups on protected requests. This intentionally trades one small indexed read for immediate account revocation security.
- Public/private data remains separated so global search and dashboards do not retrieve private budget, timetable or safety-report records belonging to other users.
- Existing MongoDB indexes defined in feature models remain the primary query optimization strategy.

## Production checks before deployment

Before production deployment:

1. Install dependencies and run backend/frontend typechecks.
2. Run `npm test` in the backend.
3. Run frontend and backend production builds.
4. Use strong production JWT secrets.
5. Use the real MongoDB Atlas URI with least-privilege database credentials.
6. Configure the exact production `CLIENT_URL` for CORS.
7. Configure HTTPS on both frontend and API hosts.
8. Add the production routing/email/media API credentials required by the completed application.
9. Verify all seeded administrators and remove test accounts/data.
10. Perform manual RBAC regression testing as both student and administrator.


# DELSU Compass Production Deployment

## Recommended topology

- Frontend: Render Static Site or Vercel
- Backend: Render Web Service (Node.js)
- Database: MongoDB Atlas
- Routing: OpenRouteService
- Email verification + password reset: Resend
- Map tiles: OpenStreetMap via Leaflet; no application API key is currently required for the configured public tile layer.

## 1. MongoDB Atlas

Create a cluster and database user. Add the backend deployment environment to Atlas Network Access. Copy the SRV connection string and set `MONGODB_URI` on the backend. Do not commit it to source control.

Example shape only:
`mongodb+srv://<username>:<password>@<cluster>/delsu_compass?retryWrites=true&w=majority`

## 2. Backend environment

Required for the core deployed app:

- `NODE_ENV=production`
- `PORT` (Render normally supplies this automatically)
- `MONGODB_URI`
- `CLIENT_URL` — exact deployed frontend origin, e.g. `https://your-frontend.example`
- `JWT_ACCESS_SECRET` — strong unique random secret
- `JWT_REFRESH_SECRET` — different strong random secret
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `OPENROUTESERVICE_API_KEY`
- `OPENROUTESERVICE_BASE_URL=https://api.heigit.org/openrouteservice/v2`

Email verification and password-reset delivery use Resend. To enable it:

- `RESEND_ENABLED=true`
- `RESEND_API_KEY`
- `RESEND_FROM` — a verified sender/domain for production

Cloudinary image storage is used for accommodation/community media. To enable it:

- `CLOUDINARY_ENABLED=true`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER=delsu-compass`

Admin seed variables are only needed while running `npm run seed:admin`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FULL_NAME`

After seeding, remove the seed password from the deployment environment if it is no longer required.

## 3. Frontend environment

Set:

`VITE_API_BASE_URL=https://<backend-host>/api/v1`

This value is compiled into the frontend during the Vite build. Rebuild after changing it.

## 4. Cross-site authentication

Production refresh cookies use `Secure`, `HttpOnly`, and `SameSite=None`, which allows the frontend and backend to be hosted on different HTTPS origins. `CLIENT_URL` must exactly match the frontend origin or credentialed CORS requests will be rejected.

## 5. Seed the system

After the database is connected:

```bash
cd backend
npm run seed:admin
npm run seed:locations
```

The admin seed is intentionally separate from public registration. Students cannot register themselves as administrators.

## 6. Deployment health check

Use:

`GET /api/v1/health`

A healthy response should show the API running and MongoDB connected.

## 7. Post-deployment smoke test

1. Open the landing page and `/explore` directly.
2. Register a student.
3. Verify email with the Resend OTP (or the development OTP printed in the backend terminal).
4. Log in and refresh the browser on a nested `/app/...` route.
5. Create a timetable item and reminder.
6. Open accommodation/community/events/opportunities/safety.
7. Open Compass Map, permit location, and request a route.
8. Confirm search and notifications.
9. Log in as admin and test moderation, official information, users, safety, and locations.
10. Disable a test student and confirm protected API access is rejected immediately.

## 8. Production rules

- Never commit `.env` files.
- Use HTTPS for both frontend and backend.
- Keep MongoDB Atlas, Resend and Cloudinary credentials server-side only.
- Rotate secrets if they are exposed.
- Restrict the Atlas database user to the DELSU Compass database and required privileges.
- Use official DELSU sources before publishing institutional dates, cut-off marks, or admission notices.
- Review OpenRouteService and OpenStreetMap usage policies before high-volume public launch.

# DELSU Compass

DELSU Compass is a web-based Campus Survival and Community Intelligence System for Delta State University, Abraka.

## Repository layout

- `frontend/` — React + TypeScript + Vite client
- `backend/` — Node.js + Express + TypeScript REST API
- `docs/` — architecture, API and database notes

## Current milestone

The repository is cumulative through the production handoff and the latest runtime/UI correction pass. Core student modules, administrator moderation, public information, Resend email verification/password reset, Cloudinary media upload, demo seeding, maps/navigation, testing and deployment configuration are included.

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Health: `GET http://localhost:5000/api/v1/health`

To create/update the initial administrator, set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and optionally `ADMIN_FULL_NAME`, then run:

```bash
npm run seed:admin
```

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend defaults to `http://localhost:5173` and calls the API using `VITE_API_BASE_URL`.

## Email verification and password recovery

Email verification uses a 6-digit OTP. When `RESEND_ENABLED=true`, verification codes and password-reset messages are delivered through Resend. During local development with Resend disabled, the OTP/reset URL is printed to the backend terminal so the flow can still be tested.


## Phase 3

The authenticated student shell and dashboard are implemented. Main student feature routes are wired into the shell and intentionally use explicit module placeholders until their scheduled implementation phases.


## Phase 4 — Timetable + Class Reminders

Implemented end-to-end timetable CRUD, overlap protection, student-owned class reminders, reminder settings, and dashboard integration. See `docs/architecture/PHASE_4.md`.


## Phase 4.1
Timetable now supports CSV/XLSX/DOCX/text-PDF import, deterministic department/level matching, carry-over course selection, manual carry-over tagging, import preview/correction, duplicate and clash detection, add/replace modes and reminder offsets expressed in minutes or hours.

## Phase 5 status — Accommodation + Moderation
The accommodation module is now implemented end-to-end: approved discovery, search/filtering, student submissions, personal submission status, review/report workflows, and administrator moderation. Public registration remains student-only; administrators are provisioned deliberately using the existing seed-admin workflow.

## Phase 6
Community Intelligence is now implemented end-to-end with student content submission, category/search discovery, personal submission status, reporting, and administrator moderation. Only approved community posts are public.

## Phase 7
Events and Opportunities are now implemented end-to-end with student discovery/submission, search/filtering, ownership rules, reports, and administrator moderation. Only approved content is visible in discovery views.

## Phase 8 status
Safety Centre and Safety Reporting are now implemented end-to-end. Student reports remain private until administrator review; administrators publish separate public alerts when information is appropriate for the wider student community. Phase 9 will connect useful campus locations and navigation to the interactive map.

## Phase 9 — Compass Map + Locations
- Real OpenStreetMap geography for Abraka inside the app
- Browser-based live student location with permission and continuous updates
- Curated DELSU/Abraka landmarks
- Administrator map-based location management
- Live coordinates are not persisted by Phase 9
- Seed reference markers with `cd backend && npm run seed:locations`

## Phase 9.1 — In-App Navigation
Compass Map now supports backend-proxied OpenRouteService directions for walking, driving and cycling. Students can select a verified destination, view ETA and road distance, see turn-by-turn steps, render the route on the Leaflet map, and use live-location rerouting without leaving DELSU Compass. Configure `OPENROUTESERVICE_API_KEY` in `backend/.env`.

## Phase 10
Student Budget Planner + Expense Tracking is implemented at `/app/budget`, with monthly plans, daily expense CRUD, private summaries and Recharts visualizations. Budget data is intentionally inaccessible to administrator routes.

## Phase 11
Notifications + Global Search are implemented. Student notifications now include class reminders, moderation outcomes and safety alerts with read/unread state. Global Search spans approved accommodation, community, events, opportunities, active safety alerts and active locations while excluding private student data.

## Phase 12 status

The administrator experience is now consolidated into a protected command centre with live overview metrics, moderation workload summaries, published-content counts, student account search/filtering, account disable/restore controls, and navigation to every moderation workspace. Private student budget, expense, timetable and reminder information remains outside administrator access.

## Phase 12.1 — Public Information Hub
The public landing experience now serves aspiring/new/current students through `/explore`. Administrators manage official notices and longer-lived guide articles at `/admin/information`. Changing institutional facts are data-driven and sourceable rather than hard-coded.

## Phase 13 status

Cross-feature integration is now implemented. The student dashboard aggregates current-day classes, safety alerts, events, opportunities, official student notices, budget status and unread notifications. Global search includes official information, notifications include official notices/event reminders/opportunity deadlines, safety reports can attach the student's current GPS location on demand, and accommodation/events can deep-link into Compass Map.

## Phase 14 — UX/UI polish
The frontend now uses a consistent DELSU-inspired white and blue visual system with redesigned public/authentication surfaces, polished student/admin navigation, improved responsive behavior, accessible focus states, subtle motion and stronger interaction feedback. See `docs/architecture/PHASE_14.md`.

## Phase 15 — Security, Testing & Performance

Phase 15 adds production hardening: request IDs, stricter CORS/security headers, layered rate limits, NoSQL operator rejection, immediate disabled-account enforcement, hardened timetable uploads, API compression, backend Vitest tests, a frontend error boundary, and route-level lazy loading. See `docs/architecture/PHASE_15.md` and `docs/SECURITY_TEST_CHECKLIST.md`.


## Phase 16 — Production handoff

The repository is now cumulative through Phase 16. Deployment references:

- `docs/deployment/PRODUCTION_DEPLOYMENT.md`
- `docs/deployment/FINAL_ENV_CHECKLIST.md`
- `docs/architecture/PHASE_16.md`
- `render.yaml` for a Render Blueprint-style deployment
- `backend/Dockerfile` for container deployment
- `frontend/vercel.json` for SPA route rewrites on Vercel

Email verification and password-reset delivery use Resend when `RESEND_ENABLED=true`. Accommodation/community image uploads use Cloudinary when `CLOUDINARY_ENABLED=true`.

## Latest integrated updates

This cumulative project package includes the local-validation fixes and public UX refresh completed after Phase 16:

- Forgot-password and secure reset-password flow (`/forgot-password`, `/reset-password`).
- Development password-reset URLs and email-verification OTPs are printed to the backend terminal when Resend is disabled.
- Development CORS accepts common Vite localhost ports (5173-5175) while production remains restricted to `CLIENT_URL`.
- Refreshed public landing page with a lighter typographic hierarchy, Space Grotesk, original local SVG illustrations, richer feature storytelling, information-hub preview, CTA sections and full footer.
- Refreshed public DELSU Information Hub with illustration-led introduction, notice search/category filtering, guide/accommodation/location sections and clearer empty states.
- Login, registration, forgot-password and reset-password pages now use image-led split layouts rather than text-only side panels.
- Existing timetable TypeScript/Vite build fixes are retained.


## Demo content for functionality testing

After creating an administrator and connecting MongoDB, populate realistic, clearly labelled development content with:

```bash
cd backend
npm run seed:demo
```

Remove only `[DEMO]` content with:

```bash
npm run seed:demo:clear
```

The demo seed never presents invented dates or cut-off marks as official DELSU facts.

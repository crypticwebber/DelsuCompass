# DELSU Compass — Final Runtime/UI Correction Pass

This cumulative pass addresses issues discovered during local functional testing.

## Authentication and email
- Password visibility toggle added to password fields.
- Email verification uses a 6-digit OTP.
- Resend is the production email provider for verification OTPs and password-reset emails.
- Local development still prints OTP/reset information to the backend terminal when Resend is disabled.
- Forgot-password/reset-password flow is included.

## Performance
- React Query cache/stale defaults reduce unnecessary refetches.
- Refetch-on-window-focus/reconnect is disabled for normal pages.
- React StrictMode is omitted from the local root to avoid development-only double requests/mounts.
- Route-level lazy loading remains enabled.

## Timetable
- Newly created/updated entries update the React Query cache and invalidate the timetable query.
- Day values are normalized before display.
- Timetable import parser includes support for matrix-style faculty timetable layouts in addition to row-based formats.
- CSV/XLSX/DOCX/text-PDF import remains deterministic; scanned image-only PDFs are not OCR'd.

## Accommodation
- Administrators can publish accommodation directly.
- Distance to campus is optional.
- Student/admin listing forms support image upload through the authenticated media endpoint.
- Cloudinary is the configured production image store.

## Budget and safety
- Budget layout/modals are responsive and constrained to the viewport.
- Budget plan mutation refreshes plan/summary state immediately.
- Expense charts include useful empty states and refresh after mutations.
- Safety report/admin moderation queries are aligned so pending reports can be opened and actioned.

## Events, information and moderation
- Event datetime values are normalized before API submission.
- Admin moderation query keys/status filters are aligned with the backend.
- Pending student submissions display in their corresponding admin moderation views.
- Information Hub notice dates are serialized to ISO values and empty optional dates/URLs remain valid.
- Route-level errorElement and application ErrorBoundary provide a branded recovery screen instead of the default router error UI.

## Navigation/UI
- Student sidebar no longer duplicates Search, Notifications and Profile; these remain in the top bar.
- Logout is available directly in the sidebar.
- Small sidebar information/privacy cards were removed so navigation remains visible.
- Admin styling uses a clearer DELSU blue/white system with readable text contrast.
- Public landing, Information Hub and auth split screens use distinct real-life campus/student imagery.

## Demo data
Use `npm run seed:demo` after creating an administrator. It populates dozens of clearly-labelled `[DEMO]` notices, guides, community posts, events, opportunities, accommodation listings, safety alerts/reports and map content so search, moderation and dashboard integrations can be exercised.

Use `npm run seed:demo:clear` to remove only demo content.

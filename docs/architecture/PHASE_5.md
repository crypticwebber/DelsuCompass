# Phase 5 — Accommodation + Moderation

Phase 5 implements the approved accommodation workflow as a moderated community contribution system.

## Student experience
- Browse only administrator-approved accommodation.
- Search and filter by area, room type, price, distance and sort order.
- View listing details, facilities, utility information, contact details and approved student reviews.
- Submit accommodation information. New submissions begin as `pending`.
- View personal submissions and moderation status.
- Edit a submission; edits return it to `pending` for re-review.
- Delete own submissions.
- Review approved accommodation; reviews remain `pending` until moderated.
- Report inaccurate, suspicious, duplicate or unavailable listings.

## Administrator responsibility
Administrators are trusted DELSU Compass system managers. They cannot be created through public registration. Accounts are provisioned through the existing backend admin-seeding workflow. Phase 5 gives them a focused accommodation moderation workspace without prematurely implementing the complete Phase 12 admin panel.

Administrators can approve/reject listings, moderate reviews, process reports, and mark listings unavailable. Private student timetable, reminders and future budget records are outside accommodation administration.

## Trust model
Student contribution -> validation -> pending -> administrator review -> approved/rejected -> public visibility.

Approval means the content passed DELSU Compass moderation; it is not a legal/property guarantee. The student UI explicitly advises inspection before payment.

## Media
The accommodation model supports up to eight image URLs and remains storage-provider independent. Cloud media upload can be connected to the same field later without changing the domain model.

# Phase 7 — Events + Opportunities

Phase 7 replaces the student Events and Opportunities placeholders with real moderated discovery modules.

## Events
Students can browse approved upcoming events, filter/search, submit events, edit/delete their own submissions and report inaccurate/cancelled events. Event submissions move through `pending -> approved/rejected`, and administrators may later archive/cancel published events.

Important fields: title, description, category, start/end date, venue, organizer, registration URL, submitter and moderation metadata.

## Opportunities
Students can browse active approved opportunities, filter by type, search, submit opportunities, edit/delete their own submissions and report expired/scam/inaccurate entries.

Important fields: title, description, type, provider, deadline, eligibility, location, application URL, submitter and moderation metadata.

## Moderation
Both modules have dedicated administrator moderation workspaces. Only approved content appears in student discovery results. Student edits return content to pending moderation.

## Privacy and roles
Student routes require the `student` role. Moderation routes require the `administrator` role. These permissions do not grant administrators access to private timetable/reminder/budget records.

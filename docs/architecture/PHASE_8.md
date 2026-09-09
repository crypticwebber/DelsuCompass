# Phase 8 — Safety Centre + Safety Reporting

Phase 8 replaces the student Safety placeholder with a moderated safety-information workflow.

## Design principle
A student safety report is **not** automatically a public safety alert. Reports can contain unverified or sensitive information, so they remain visible only to the reporting student and authorized administrators. An administrator may review a report and publish a separate alert containing only information appropriate for the student community.

## Student workflow
1. Student opens `/app/safety`.
2. Student views active administrator-published safety alerts.
3. Student can filter/search alerts by category, severity, or area.
4. Student may submit a safety concern with category, severity, location, incident time, and description.
5. Report status begins as `pending`.
6. Student can track the report under **My reports**.

## Administrator workflow
1. Administrator opens `/admin/safety`.
2. Reviews `pending` safety reports.
3. Moves a report to `reviewing`, `resolved`, or `dismissed` and may attach a resolution note.
4. When appropriate, creates a separate public safety alert from the report or manually.
5. Public alerts can be active, expired, or archived.

## Safety/privacy boundary
- A report remains private to the student and administrators.
- Student identity is never copied into public alerts.
- `allowAnonymousPublicUse` records whether the student permits the substance of the report to be used anonymously in public safety communication.
- The module does not provide emergency dispatch and the UI states this explicitly.
- Location coordinates are optional and are intended for the Phase 9 map integration.

## Models
- `SafetyReport`
- `SafetyAlert`

## Roles
- Student: view approved alerts, submit safety reports, track own reports.
- Administrator: review reports, change report status, publish/update/archive alerts.

# Phase 12 — Complete Administrator Dashboard

Phase 12 consolidates the existing feature-specific moderation workspaces into one protected administrator console.

## Responsibilities

The administrator can:
- view system-level operational counts;
- view pending moderation workload across accommodation, community, events, opportunities and safety;
- view published-content counts and verified map-location counts;
- search and filter student accounts;
- disable or restore student accounts;
- continue to use the feature-specific moderation workspaces created in earlier phases.

The administrator cannot self-register. Administrator accounts remain provisioned by the system owner through the existing admin seed flow.

## Privacy boundary

The console intentionally excludes private student budget plans, expense records, personal timetable entries and reminder settings. User management exposes only account/profile metadata required for system administration.

## Account suspension

Disabling a student account prevents future sign-in and refresh-token renewal. Existing refresh sessions are revoked when the account is disabled. Short-lived access tokens may remain valid until their normal expiry, after which the disabled account cannot obtain a new session.

## Frontend

A persistent admin shell now provides navigation to:
- Overview
- Students
- Accommodation
- Community
- Events
- Opportunities
- Safety
- Locations

The overview uses live API data rather than placeholder counts.

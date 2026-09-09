# Phase 13 — Integration and Cross-Feature Experiences

Phase 13 connects the previously isolated DELSU Compass modules into a coherent student experience while preserving module ownership and privacy boundaries.

## Integrated student dashboard

A new `/api/v1/integration/dashboard` projection combines only the current student's relevant data with approved public information. It includes today's timetable, active safety alerts, upcoming events, open opportunities, student/all official notices, the current month's private budget summary, and unread notification count.

The integration module does not duplicate source data. Timetable, safety, events, opportunities, information, budget and notification modules remain authoritative for their own records.

## Official information integration

Published DELSU notices and guide articles are now searchable from the authenticated global search. Student-facing official notices also participate in in-app notifications.

## Event and opportunity awareness

Approved events within the next 24 hours can create in-app event reminders. Approved opportunities whose deadlines fall within the next three days can create deadline notifications. Source keys prevent duplicate notifications.

## Map integration

Compass Map now accepts `q` and `id` URL query parameters. Other modules can deep-link into the map without duplicating location functionality. Accommodation details can search the map for the listing area, while events can search for their venue.

## Safety + live location

A student creating a safety report can explicitly attach the device's current GPS coordinate. Permission is requested only on user action. The coordinate is stored with that specific safety report for administrator review and is not treated as continuous location history.

## Privacy

The integrated dashboard only aggregates the authenticated student's private data. It does not expose another student's timetable, reminders, budget, expenses, live GPS session, or private safety reports.

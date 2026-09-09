# Phase 9 — Compass Map + Locations

Phase 9 replaces the map placeholder with an in-app interactive map for DELSU and Abraka.

## Design decisions
- OpenStreetMap tiles provide real geographic context for Abraka; the application does not redirect students to an external maps app.
- Browser Geolocation (`navigator.geolocation.watchPosition`) provides live device position after explicit permission.
- Live coordinates are kept in frontend state by this feature and are not persisted or sent to the backend.
- DELSU/Abraka points of interest are stored as curated `Location` records. Administrators add or correct locations by clicking the actual point on the map.
- Student users have read-only access to active locations. Administrator users manage location records.
- The map is centred on Abraka (5.7836, 6.1005). A published Site III DELSU reference point (5.790000, 6.104722) is included as a reference/seed, not as a claim that every campus building is at that coordinate.

## Student experience
- `/app/map`
- Pan/zoom real Abraka map
- Search/filter curated locations
- View live location and accuracy circle
- Re-centre on current location or Abraka
- See distance to saved places
- See nearest saved locations
- Location permission error states

## Admin experience
- `/admin/locations`
- Add verified DELSU/Abraka location
- Click map to capture coordinates
- Edit metadata and coordinates
- Disable outdated markers
- Mark locations verified/unverified

## Privacy
Live geolocation is opt-in. The backend API does not receive the student's live coordinates in Phase 9. This avoids creating a location-history dataset.

## Initial location data
Run `npm run seed:locations` in the backend to create the two reference markers. Add actual lecture halls, gates, health centres, hostels and other locations through the administrator map using physically verified positions.

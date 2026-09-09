# Phase 9.1 — In-App Turn-by-Turn Routing

Phase 9.1 extends Compass Map with route calculation and navigation without redirecting the student to Google Maps or another map application.

## Flow
1. Student enables live location.
2. Student selects a verified Compass destination.
3. Student chooses walking, driving or cycling.
4. Frontend sends start/destination coordinates to `POST /api/v1/navigation/directions`.
5. Backend requests a route from OpenRouteService and normalizes its response.
6. Frontend renders the route as a Leaflet polyline and displays ETA, road distance and turn-by-turn instructions.
7. During active navigation, the route is recalculated after the student moves approximately 40 metres, providing lightweight rerouting.

## Privacy
Live GPS watch data is maintained in frontend state and is not persisted. Only coordinates required to calculate a route are transmitted through the DELSU Compass backend. No continuous location history model was introduced.

## Routing provider
The provider is deliberately isolated behind `navigation.service.ts`. The current provider is OpenRouteService. This can later be replaced by a self-hosted OpenRouteService/OSRM deployment or another routing provider without changing the map UI contract.

Required environment variable:
`OPENROUTESERVICE_API_KEY`

Default API base URL:
`https://api.heigit.org/openrouteservice/v2`

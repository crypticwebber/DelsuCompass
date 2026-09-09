# Final UI, Media and Map Hardening Pass

This pass addresses the final pre-deployment issues reported during real-device testing.

- Event discovery UI rebuilt with stronger cards, responsive filters, image support and a viewport-safe compose modal.
- Event deletion now uses an in-app confirmation dialog instead of the browser confirm prompt.
- Global mobile hardening prevents forms, dialogs, date controls and long messages from widening beyond the viewport.
- Student-facing stock photography was changed to Black student imagery and the landing hero now uses a direct Pexels image URL rather than the previously failing Unsplash asset.
- Cloudinary upload logic now treats valid credentials as the source of truth, so uploads do not fail solely because CLOUDINARY_ENABLED was left false.
- Map tiles now use the canonical tile.openstreetmap.org URL and mobile map height was reduced to fit smaller screens better.
- The existing OpenStreetMap + Leaflet + OpenRouteService architecture is retained because it matches the implementation documented in the final-year report and avoids introducing Google Maps billing and a late-stage mapping rewrite.

Production still requires real Cloudinary credentials and an OpenRouteService API key in the deployed backend environment.

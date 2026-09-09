# Final Environment and Service Checklist

| Service / secret | Where it goes | Required? | Purpose |
|---|---|---:|---|
| MongoDB Atlas connection string | Backend `MONGODB_URI` | Yes for production | Persistent application database |
| JWT access secret | Backend `JWT_ACCESS_SECRET` | Yes | Signs short-lived access tokens |
| JWT refresh secret | Backend `JWT_REFRESH_SECRET` | Yes | Signs refresh tokens |
| Frontend production origin | Backend `CLIENT_URL` | Yes | Credentialed CORS + verification links |
| Backend API URL | Frontend `VITE_API_BASE_URL` | Yes | Connects React app to REST API |
| OpenRouteService key | Backend `OPENROUTESERVICE_API_KEY` | Yes for turn-by-turn routing | Road/path directions, ETA, maneuvers |
| Resend API key + sender | Backend `RESEND_*` variables | Required for production email | Verification OTP + password reset delivery |
| Cloudinary credentials | Backend `CLOUDINARY_*` variables | Required for image uploads | Accommodation/community image storage |
| Admin seed credentials | Backend seed environment | Setup only | Creates the first administrator |

## No key currently required

The current Leaflet map uses OpenStreetMap public tiles and does not store a Google Maps/Mapbox key. Browser geolocation uses the browser Geolocation API and requires user permission rather than an API key.

## Placeholder values that must not survive production

- localhost MongoDB URI
- localhost `CLIENT_URL`
- localhost frontend API URL
- example admin password
- placeholder Resend API key/sender
- placeholder Cloudinary credentials
- placeholder ORS key
- placeholder JWT secrets

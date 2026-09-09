# Map and Cloudinary hardening pass

This pass addresses the reported image upload and Compass Map failures before deployment.

## Image upload
- Multipart FormData requests now remove the global JSON Content-Type header so the browser can supply the multipart boundary Multer requires.
- Cloudinary server uploads now use backend-only HTTP Basic Authentication with the Cloudinary API key and secret instead of manual signature generation.
- Cloudinary cloud name, key and secret are trimmed before use.
- Cloudinary network/authentication/provider errors now produce actionable backend logs and user-facing API messages.
- Upload secrets remain backend-only.

Required backend environment values:

```env
CLOUDINARY_ENABLED=true
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=delsu-compass
```

## Compass Map
- OpenRouteService base URL is normalized to prevent double slashes.
- API keys are trimmed and 401/403 errors now clearly identify routing credential/access problems.
- Responsive map sizing is hardened and Leaflet invalidates its size after layout/viewport changes.
- The UI reports map tile connection problems instead of appearing silently inactive.
- Live-location errors distinguish denied permission, unavailable GPS, timeout and insecure HTTP deployment.
- Asking for directions before GPS is available now automatically continues route calculation as soon as a location fix is obtained; users no longer need to click twice.
- Continuous navigation still recalculates after meaningful movement.
- Empty curated-location states explain that administrators must publish verified markers instead of making the base map appear broken.

Required routing environment values:

```env
OPENROUTESERVICE_API_KEY=...
OPENROUTESERVICE_BASE_URL=https://api.heigit.org/openrouteservice/v2
```

Outside localhost, browser geolocation requires HTTPS.

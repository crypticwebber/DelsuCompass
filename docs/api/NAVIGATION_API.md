# Navigation API

## POST /api/v1/navigation/directions
Authenticated student route.

Request body:
```json
{
  "start": { "latitude": 5.7836, "longitude": 6.1005 },
  "destination": { "latitude": 5.7900, "longitude": 6.10472 },
  "mode": "walking"
}
```

Modes: `walking`, `driving`, `cycling`.

Response data contains:
- `distanceMeters`
- `durationSeconds`
- `geometry`: `[latitude, longitude][]`
- `steps`: normalized turn-by-turn instructions

If no routing API key is configured the API returns `503 ROUTING_NOT_CONFIGURED`.

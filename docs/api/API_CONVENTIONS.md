# API conventions

Base path: `/api/v1`

Success: `{ "success": true, "data": {} }`

Failure: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Readable message" } }`

Initial endpoint: `GET /api/v1/health`

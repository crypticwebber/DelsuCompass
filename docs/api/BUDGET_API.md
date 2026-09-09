# Budget API
All endpoints require an authenticated student.

- `GET /api/v1/budget/plan?month=YYYY-MM`
- `PUT /api/v1/budget/plan`
- `GET /api/v1/budget/summary?month=YYYY-MM`
- `GET /api/v1/budget/expenses?month=YYYY-MM&category=&search=`
- `POST /api/v1/budget/expenses`
- `PATCH /api/v1/budget/expenses/:id`
- `DELETE /api/v1/budget/expenses/:id`

Budget records are private and have no admin-facing API.

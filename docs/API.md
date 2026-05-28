# CRM API Documentation

Base URL: `http://localhost:4000/api` (development)

## Authentication

All protected routes require header: `Authorization: Bearer <access_token>`

### POST /auth/register

Register a new user.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "+1234567890",
  "company": "Acme Inc"
}
```

### POST /auth/login

```json
{
  "email": "admin@crm.com",
  "password": "Password123!"
}
```

Response includes `user`, `accessToken`, `refreshToken`.

### POST /auth/refresh

```json
{ "refreshToken": "<token>" }
```

### POST /auth/logout

```json
{ "refreshToken": "<token>" }
```

### POST /auth/forgot-password

```json
{ "email": "user@example.com" }
```

### POST /auth/reset-password

```json
{
  "token": "<reset-token>",
  "password": "NewPassword123!"
}
```

### GET /auth/me

Returns current user profile. Requires authentication.

---

## Users (Admin/Manager)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /users | Admin, Manager | List users (paginated) |
| GET | /users/:id | Admin, Manager | Get user |
| POST | /users | Admin | Create user |
| PUT | /users/:id | Auth | Update user |
| DELETE | /users/:id | Admin | Delete user |
| PATCH | /users/:id/suspend | Admin | Suspend user |

Query params: `page`, `limit`, `search`, `role`, `status`, `sortBy`, `sortOrder`

---

## Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /leads | List leads (paginated, filtered) |
| GET | /leads/kanban | Kanban board data by status |
| GET | /leads/export/csv | Export leads as CSV |
| GET | /leads/:id | Get lead with activity history |
| POST | /leads | Create lead |
| PUT | /leads/:id | Update lead |
| PATCH | /leads/:id/status | Update status only |
| DELETE | /leads/:id | Delete lead |

Lead statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `NEGOTIATION`, `WON`, `LOST`

Priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

---

## Dashboard

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /dashboard/stats | Auth | Dashboard statistics |
| GET | /dashboard/audit-logs | Admin | Audit log entries |

---

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications | List notifications |
| PATCH | /notifications/:id/read | Mark as read |
| PATCH | /notifications/read-all | Mark all as read |

---

## Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /upload/avatar | Upload profile avatar (multipart/form-data, field: `avatar`) |

---

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | API health check |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": {}
}
```

## Rate Limiting

100 requests per 15 minutes per IP (configurable via environment variables).

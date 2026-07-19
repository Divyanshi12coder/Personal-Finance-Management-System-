# API Reference

Full interactive docs (generated from the running server): `http://localhost:4000/api/docs`

Base URL: `http://localhost:4000/api/v1`. All endpoints except `/auth/*` and
`/health` require `Authorization: Bearer <accessToken>`.

## Response contract

Every successful response is wrapped:
```json
{ "success": true, "data": { /* ... */ }, "meta": { /* optional, e.g. pagination */ } }
```

Every error response has the same shape, regardless of which layer threw it:
```json
{
  "success": false,
  "error": { "code": "BUDGET_LIMIT_INVALID", "message": "...", "details": [] },
  "timestamp": "2026-07-18T10:00:00.000Z",
  "path": "/api/v1/budgets"
}
```

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | `{ email, name, password }` → access token + sets refresh cookie |
| POST | `/auth/login` | Public | `{ email, password }` → access token + sets refresh cookie |
| POST | `/auth/refresh` | Public (cookie) | Rotates refresh token, returns a new access token |
| POST | `/auth/logout` | Public (cookie) | Revokes the current refresh token |

## Users

| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update `name` / `currency` |

## Categories

| Method | Path | Description |
|---|---|---|
| GET | `/categories` | System defaults + this user's custom categories |
| POST | `/categories` | `{ name, type, icon? }` — create a custom category |

## Transactions

| Method | Path | Query/Body | Description |
|---|---|---|---|
| GET | `/transactions` | `type?, categoryId?, dateFrom?, dateTo?, search?, page, limit` | Paginated list |
| GET | `/transactions/:id` | — | Single transaction |
| POST | `/transactions` | `{ type, amountMinor, categoryId, occurredOn, merchant?, note? }` | Create |
| PATCH | `/transactions/:id` | partial of the above | Update |
| DELETE | `/transactions/:id` | — | Soft delete |

## Budgets

| Method | Path | Description |
|---|---|---|
| GET | `/budgets?periodStart=2026-07-01` | Budgets for a month, with computed `spentMinor`/`percentUsed`/`isOverBudget` |
| POST | `/budgets` | `{ categoryId, limitMinor, periodStart }` — create or update (upsert by category+month) |

## Savings Goals

| Method | Path | Description |
|---|---|---|
| GET | `/goals` | List, with computed `percentComplete` |
| POST | `/goals` | `{ name, targetMinor, targetDate? }` |
| POST | `/goals/:id/contributions` | `{ amountMinor, contributedOn }` — logs a contribution and increments progress |

## Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/summary?month=2026-07-01` | Income/expense/net + month-over-month % deltas |
| GET | `/analytics/monthly-trend?months=6` | Income vs. expense per month, for the trend chart |
| GET | `/analytics/category-breakdown?month=2026-07-01` | Expense share per category |

## Receipts (Smart Receipt Scanner)

| Method | Path | Description |
|---|---|---|
| POST | `/receipts` | `multipart/form-data`, field `file` — uploads image, runs OCR, returns a `PENDING` receipt with extracted draft fields |
| POST | `/receipts/:id/confirm` | `{ categoryId, amountMinor, occurredOn, merchant? }` — user-reviewed values → creates the real transaction |
| POST | `/receipts/:id/reject` | Discards the receipt without creating a transaction |

## AI Coach

| Method | Path | Description |
|---|---|---|
| GET | `/ai-coach/conversations` | List the user's conversations |
| POST | `/ai-coach/conversations` | Start a new conversation |
| GET | `/ai-coach/conversations/:id` | Full message history for a conversation |
| POST | `/ai-coach/conversations/:id/messages` | `{ question }` — grounded answer; rate-limited to 15 req/min per the throttler config since LLM calls cost money |

## Reports

| Method | Path | Description |
|---|---|---|
| GET | `/reports/monthly/:yyyy-mm` | Generated report: summary, category breakdown, budgets, transaction count |

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness/readiness, including a DB connectivity check |

---

## Example: end-to-end curl walkthrough

```bash
# Register
curl -c cookies.txt -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","name":"Jane Doe","password":"S3curePass!23"}'
# => { "success": true, "data": { "accessToken": "...", "user": {...} } }

TOKEN="<paste accessToken here>"

# Create an expense
curl -X POST http://localhost:4000/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","amountMinor":45000,"categoryId":"<category-id>","occurredOn":"2026-07-15","merchant":"Blue Tokai Coffee"}'

# Ask the AI Coach
curl -X POST http://localhost:4000/api/v1/ai-coach/conversations \
  -H "Authorization: Bearer $TOKEN"
# => { "data": { "id": "<conversation-id>", ... } }

curl -X POST http://localhost:4000/api/v1/ai-coach/conversations/<conversation-id>/messages \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"question":"Why did I spend more this month?"}'
```

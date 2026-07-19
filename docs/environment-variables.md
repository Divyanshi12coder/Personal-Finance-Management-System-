# Environment Variables

All variables live in a single root `.env` (see `.env.example`), consumed by
both `docker-compose.yml` and the API's Zod-validated config loader
(`apps/api/src/config/configuration.ts`) — if a required variable is missing
or malformed, the API fails fast at boot with a clear error instead of
failing confusingly mid-request.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Postgres connection string, e.g. `postgresql://user:pass@host:5432/db?schema=public` |
| `REDIS_URL` | ✅ | — | Redis connection string, e.g. `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | ✅ | — | Signing secret for short-lived access tokens. Min 16 chars. Never reuse across environments. |
| `JWT_REFRESH_SECRET` | ✅ | — | Reserved for future use if refresh tokens move to signed JWTs; currently refresh tokens are opaque random values hashed and stored in Postgres. Keep it set regardless. |
| `JWT_ACCESS_EXPIRES_IN` | — | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | — | `7d` | Refresh token lifetime |
| `ANTHROPIC_API_KEY` | For AI Coach | — | Anthropic API key. Without it, every other feature works; `/ai-coach/*` endpoints will error. |
| `AI_COACH_MODEL` | — | `claude-sonnet-4-6` | Model string passed to the Anthropic SDK |
| `AI_COACH_CACHE_TTL_SECONDS` | — | `3600` | How long a given (question, data-snapshot) pair's answer is cached in Redis |
| `S3_ENDPOINT` | For receipts | `http://localhost:9000` | S3-compatible endpoint (MinIO locally) |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | For receipts | — | Storage credentials |
| `S3_BUCKET` | — | `finpilot-receipts` | Bucket for uploaded receipt images |
| `S3_REGION` | — | `us-east-1` | Required by the S3 SDK even for MinIO; value doesn't matter locally |
| `OCR_PROVIDER` | — | `tesseract` | `tesseract` (local, free) or `cloud-vision` (requires implementing/wiring a cloud provider — the interface is ready at `IOcrProvider`) |
| `CORS_ORIGIN` | — | `http://localhost:3000` | Allowed frontend origin |
| `DEFAULT_CURRENCY` | — | `INR` | Currency assigned to new users at registration |
| `PORT` | — | `4000` | API port |
| `NODE_ENV` | — | `development` | `development` \| `test` \| `production` — affects logging format and cookie `secure` flag |
| `NEXT_PUBLIC_API_URL` | ✅ (web) | `http://localhost:4000/api/v1` | Base URL the frontend calls. Must be reachable from the browser, not just server-to-server. |

## Notes

- Any variable prefixed `NEXT_PUBLIC_` is bundled into the client-side
  JavaScript bundle at build time — never put a secret behind that prefix.
- In production, set these via your platform's secret manager rather than a
  committed file. `.env` is git-ignored; `.env.example` is the only file
  checked in, and contains no real secrets.
- If `ANTHROPIC_API_KEY` is unset, the app still boots — only the AI Coach
  endpoints will return an error when called, since `AnthropicLlmProvider`
  is constructed lazily per-request path, not at boot.

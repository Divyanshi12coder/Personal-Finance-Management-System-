# Deployment Guide

## Local development (Docker Compose)

**Prerequisites:** Docker & Docker Compose, Node.js 20+ (for running scripts outside containers, e.g. Prisma commands).

```bash
cp .env.example .env
# Fill in at minimum: ANTHROPIC_API_KEY (for the AI Coach), JWT secrets

npm install
npm run docker:up
```

This starts five services:

| Service | Port | Purpose |
|---|---|---|
| `postgres` | 5432 | Primary database |
| `redis` | 6379 | AI response cache, rate limiting |
| `minio` | 9000 / 9001 | S3-compatible storage for receipt images (console at 9001) |
| `api` | 4000 | NestJS backend |
| `web` | 3000 | Next.js frontend |

Once Postgres is healthy, apply the schema and seed data (run once, from the host):

```bash
npm run prisma:migrate --workspace=apps/api
npm run prisma:seed --workspace=apps/api
```

Tear down (including volumes, i.e. wipes the database):
```bash
npm run docker:down
```

## Local development without Docker (faster iteration)

Run Postgres/Redis/MinIO via Docker but the apps directly on the host for hot reload:

```bash
docker compose up postgres redis minio -d

# Terminal 1
npm run prisma:generate --workspace=apps/api
npm run prisma:migrate --workspace=apps/api
npm run dev:api

# Terminal 2
npm run dev:web
```

## Running tests

```bash
npm run test:api                                   # unit tests, no infra needed
npm run test:integration --workspace=apps/api       # needs Docker (Testcontainers spins up Postgres itself)
npm run test:web                                    # frontend unit/component tests
```

## Production deployment

The Dockerfiles (`apps/api/Dockerfile`, `apps/web/Dockerfile`) are multi-stage
and produce small, production-only images — they don't assume any specific
hosting provider. A typical path:

1. **Build and push images** (CI already does this build step; add a push step with your registry credentials):
   ```bash
   docker build -f apps/api/Dockerfile -t <registry>/finpilot-api:latest .
   docker build -f apps/web/Dockerfile -t <registry>/finpilot-web:latest .
   docker push <registry>/finpilot-api:latest
   docker push <registry>/finpilot-web:latest
   ```

2. **Provision managed infra**: a managed Postgres (RDS, Neon, Supabase, etc.),
   a managed Redis (ElastiCache, Upstash, etc.), and an S3 bucket (or keep
   using MinIO self-hosted). Point the production `.env` at these.

3. **Run migrations** as a release step (not inside the running container's
   entrypoint, to avoid race conditions across multiple replicas):
   ```bash
   npm run prisma:migrate:deploy --workspace=apps/api
   ```

4. **Deploy the two images** to any container host — ECS/Fargate, Cloud Run,
   Fly.io, Render, or a Kubernetes cluster all work identically since the
   images have no host-specific assumptions baked in. Point `web`'s
   `NEXT_PUBLIC_API_URL` at the deployed API's public URL.

5. **Set `CORS_ORIGIN`** on the API to the deployed frontend's origin, and
   ensure cookies are served over HTTPS in production (`secure: true` is
   already conditional on `NODE_ENV=production` in `auth.controller.ts`).

### Health checks

Point your platform's health check at `GET /api/v1/health` — it verifies
both process liveness and an active Postgres connection.

### Secrets

Never commit `.env`. In production, inject `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `ANTHROPIC_API_KEY`, and database/redis/S3 credentials
via your platform's secret manager, not plain environment variables in a
Dockerfile.

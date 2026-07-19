# FinPilot AI

**Your intelligent financial copilot.**

A production-grade personal finance SaaS built to demonstrate real software
engineering practice — clean architecture, a repository-pattern data layer,
an AI feature designed around retrieval-over-aggregates rather than prompt
stuffing, and a receipt scanner with a genuine human-in-the-loop correction
flow. See [`docs/architecture.md`](docs/architecture.md) for the full design
rationale.

---

## What makes this different from a CRUD expense tracker

| Area | What most tutorials do | What FinPilot AI does |
|---|---|---|
| AI feature | Wrap a chat UI around a generic LLM call | **RAG over SQL aggregates**: the LLM never sees raw transactions, only structured, pre-computed financial facts — cheaper, faster, and every answer is auditable via a stored context snapshot |
| Money | Store amounts as `float`/`Decimal` | Integer minor units everywhere, wrapped in a `Money` value object — no rounding bugs |
| Data access | Prisma calls directly in controllers | Controller → Service → **Repository interface** → Prisma, so services are unit-testable without a database |
| Receipts | "Upload image, get JSON" black box | Explicit `PENDING → CONFIRMED/REJECTED` state machine; user edits every extracted field before a transaction is created |
| Errors | Inconsistent throw/catch per route | One global exception filter, one JSON error contract across the entire API |

---

## Tech Stack

**Frontend:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui-style primitives (Radix) · TanStack Query · Zustand · React Hook Form + Zod · Recharts

**Backend:** NestJS · TypeScript · PostgreSQL · Prisma ORM · Redis · JWT (access + rotating refresh tokens) · Swagger/OpenAPI · Pino structured logging

**AI:** Anthropic Claude via a provider-agnostic interface, with a dedicated `FinancialContextBuilder` that grounds every answer in the user's real, aggregated data

**Infra:** Docker & Docker Compose · GitHub Actions CI (lint → unit → integration → build)

---

## Quickstart

```bash
git clone <this-repo>
cd finpilot-ai
cp .env.example .env
# edit .env — at minimum set ANTHROPIC_API_KEY if you want the AI Coach to work

npm install
npm run docker:up          # postgres, redis, minio, api, web
```

Once containers are healthy:

```bash
npm run prisma:migrate     # apply the schema
npm run prisma:seed        # seed default categories
```

- Web app: http://localhost:3000
- API: http://localhost:4000/api/v1
- Swagger docs: http://localhost:4000/api/docs
- MinIO console: http://localhost:9001

See [`docs/deployment.md`](docs/deployment.md) for the full local + production deployment guide, and [`docs/environment-variables.md`](docs/environment-variables.md) for every configuration option.

---

## Feature Tour

### AI Financial Coach (flagship feature)
Ask questions like *"Why did I spend more this month?"* or *"How can I save
₹5000 next month?"* — answers cite your actual category spend, budget usage,
and savings-goal progress, because the model is handed a structured
snapshot built by SQL aggregation, not raw transaction rows. See
[`docs/architecture.md#7-ai-financial-coach--design-detail-flagship-feature`](docs/architecture.md).

### Smart Receipt Scanner
Upload a photo of a receipt → OCR (Tesseract by default, swappable for a
cloud Vision API) extracts merchant/amount/date/category → you review and
edit every field → only on explicit confirmation does a real transaction
get created.

### Core finance features
Income & expense tracking, category budgets with live spend/remaining
computation, savings goals with contribution history, a dashboard with four
chart types (monthly trend, category breakdown, income vs. expense, savings
progress), and generated monthly reports.

---

## Project Structure

```
finpilot-ai/
├── apps/
│   ├── api/          NestJS backend (see apps/api/src/modules for each feature)
│   └── web/           Next.js frontend
├── packages/
│   └── shared-types/  Types shared between frontend and backend
├── docs/              Architecture, ER diagram, API reference, deployment guide
└── docker-compose.yml
```

Full folder-by-folder breakdown: [`docs/folder-structure.md`](docs/folder-structure.md).

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system design, clean-architecture layering, AI Coach & receipt-scanner pipelines
- [`docs/er-diagram.md`](docs/er-diagram.md) — data model and modeling rationale
- [`docs/api-reference.md`](docs/api-reference.md) — endpoint reference (also live at `/api/docs` via Swagger)
- [`docs/folder-structure.md`](docs/folder-structure.md) — annotated directory tree
- [`docs/deployment.md`](docs/deployment.md) — local Docker + production deployment guide
- [`docs/environment-variables.md`](docs/environment-variables.md) — every env var, what it does, and safe defaults

---

## Testing

```bash
npm run test:api              # unit tests (mocked repositories, no DB)
npm run test:integration --workspace=apps/api   # spins up a real Postgres via Testcontainers
npm run test:web              # frontend component/unit tests (Vitest)
```

CI (`.github/workflows/ci.yml`) runs lint → unit → integration → build for
both apps, then builds both Docker images, on every push/PR to `main`.

---

## License

MIT — built as a portfolio/demonstration project.

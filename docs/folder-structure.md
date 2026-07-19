# Folder Structure

```
finpilot-ai/
├── apps/
│   ├── api/                          NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma         Full data model (see docs/er-diagram.md)
│   │   │   └── seed.ts               Seeds system default categories
│   │   ├── src/
│   │   │   ├── main.ts                Bootstrap: security headers, versioning,
│   │   │   │                          validation, Swagger, global filter/interceptor
│   │   │   ├── app.module.ts          Wires every feature module + global guards
│   │   │   ├── common/
│   │   │   │   ├── decorators/        @Public(), @CurrentUser()
│   │   │   │   ├── filters/           AllExceptionsFilter — one JSON error contract
│   │   │   │   ├── guards/            JwtAuthGuard (global; @Public opts out)
│   │   │   │   ├── interceptors/      TransformResponseInterceptor, LoggingInterceptor
│   │   │   │   └── money/             Money value object (integer-minor-unit arithmetic)
│   │   │   ├── config/
│   │   │   │   ├── configuration.ts   Zod-validated env config, loaded once at boot
│   │   │   │   └── redis.provider.ts  Shared Redis client (DI token: REDIS_CLIENT)
│   │   │   ├── database/
│   │   │   │   ├── prisma.service.ts  PrismaClient wired into Nest's lifecycle
│   │   │   │   └── database.module.ts @Global module exporting PrismaService
│   │   │   ├── health/
│   │   │   │   └── health.controller.ts   Liveness/readiness + DB check
│   │   │   └── modules/
│   │   │       ├── auth/              Register/login/refresh/logout, JWT strategy
│   │   │       ├── users/             Profile read/update
│   │   │       ├── categories/        System + custom categories
│   │   │       ├── transactions/      Core domain: repository pattern example
│   │   │       │   ├── interfaces/    ITransactionRepository (mockable in tests)
│   │   │       │   ├── transactions.repository.ts   Prisma implementation
│   │   │       │   └── transactions.service.ts       Business rules, depends on the interface
│   │   │       ├── budgets/           Monthly budgets + computed spend/remaining
│   │   │       ├── goals/             Savings goals + contributions
│   │   │       ├── analytics/         SQL aggregations — reused by dashboard, reports, AND the AI coach
│   │   │       ├── receipts/          Smart Receipt Scanner
│   │   │       │   ├── ocr/           IOcrProvider interface + TesseractOcrProvider
│   │   │       │   └── storage/       IStorageProvider interface + S3StorageProvider
│   │   │       ├── ai-coach/          AI Financial Coach (flagship feature)
│   │   │       │   ├── financial-context.builder.ts  Turns a question into aggregated facts
│   │   │       │   ├── llm.provider.ts                Provider-agnostic LLM interface
│   │   │       │   ├── providers/                     AnthropicLlmProvider implementation
│   │   │       │   ├── prompt-templates/               System prompt + prompt assembly
│   │   │       │   ├── cache/                          Redis response cache (question+data hash)
│   │   │       │   └── ai-coach.service.ts             Orchestrates the full RAG pipeline
│   │   │       └── reports/           Monthly report generation (reuses AnalyticsService)
│   │   ├── test/
│   │   │   ├── unit/                  Jest, mocked repositories — no DB needed
│   │   │   └── integration/           Supertest + Testcontainers — real Postgres
│   │   └── Dockerfile
│   │
│   └── web/                           Next.js 15 frontend
│       ├── app/
│       │   ├── (auth)/                Login/register — no dashboard shell
│       │   ├── (dashboard)/           Authenticated shell (sidebar + topbar)
│       │   │   ├── dashboard/         KPIs + 4-chart overview
│       │   │   ├── transactions/      Table, filters, add form, receipt scanner
│       │   │   ├── budgets/           Per-category progress bars
│       │   │   ├── goals/             Savings goal progress cards
│       │   │   ├── analytics/         Full chart grid
│       │   │   ├── ai-coach/          Chat UI for the flagship feature
│       │   │   ├── reports/           Monthly report viewer
│       │   │   └── settings/          Profile settings
│       │   ├── layout.tsx             Fonts, metadata
│       │   ├── providers.tsx          TanStack Query + theme (dark mode) context
│       │   └── globals.css            Tailwind v4 theme tokens (design system)
│       ├── components/
│       │   ├── ui/                    Button, Card, Input, Label — shadcn-style primitives
│       │   ├── charts/                MonthlyTrend, CategoryBreakdown, IncomeVsExpense, SavingsProgress, KpiCardRow
│       │   ├── transactions/          TransactionFormSheet, ReceiptUploader
│       │   ├── ai-coach/              MessageBubble, SuggestedPrompts
│       │   ├── layout/                Sidebar, Topbar, ThemeToggle
│       │   └── shared/                EmptyState, Skeleton, ErrorBoundary — used everywhere
│       ├── lib/
│       │   ├── api-client.ts          Typed fetch wrapper: attaches JWT, unwraps the response envelope
│       │   ├── validators/            Zod schemas for React Hook Form
│       │   └── utils.ts               cn(), formatMoney(), formatPercent()
│       ├── stores/
│       │   └── auth-store.ts          Zustand: access token (memory-only) + current user
│       ├── hooks/                     useTransactions, useAnalytics, useAiCoach — TanStack Query hooks
│       └── Dockerfile
│
├── packages/
│   └── shared-types/                  DTO/enum types shared between apps/api and apps/web
│
├── docs/                               This documentation set
├── .github/workflows/ci.yml           Lint → unit → integration → build → docker build
├── docker-compose.yml                  postgres, redis, minio, api, web
├── .env.example
└── README.md
```

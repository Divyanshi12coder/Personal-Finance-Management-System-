# Entity-Relationship Diagram

Full Prisma schema: [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).

```mermaid
erDiagram
    USER ||--o{ TRANSACTION : owns
    USER ||--o{ BUDGET : sets
    USER ||--o{ SAVINGS_GOAL : sets
    USER ||--o{ CATEGORY : customizes
    USER ||--o{ RECEIPT : uploads
    USER ||--o{ AI_CONVERSATION : has
    USER ||--o{ REFRESH_TOKEN : issues
    CATEGORY ||--o{ TRANSACTION : classifies
    CATEGORY ||--o{ BUDGET : "budgeted for"
    TRANSACTION ||--o| RECEIPT : "linked to"
    AI_CONVERSATION ||--o{ AI_MESSAGE : contains
    SAVINGS_GOAL ||--o{ GOAL_CONTRIBUTION : "funded by"

    USER {
        uuid id PK
        string email UK
        string passwordHash
        string name
        string currency
        datetime createdAt
    }
    REFRESH_TOKEN {
        uuid id PK
        uuid userId FK
        string tokenHash
        datetime expiresAt
        datetime revokedAt "nullable"
    }
    CATEGORY {
        uuid id PK
        uuid userId FK "nullable = system default"
        string name
        string icon
        enum type "INCOME|EXPENSE"
        boolean isSystem
    }
    TRANSACTION {
        uuid id PK
        uuid userId FK
        uuid categoryId FK
        enum type "INCOME|EXPENSE"
        int amountMinor "minor currency units"
        string merchant
        date occurredOn
        string source "MANUAL|RECEIPT_SCAN"
        datetime deletedAt "soft delete"
    }
    BUDGET {
        uuid id PK
        uuid userId FK
        uuid categoryId FK
        int limitMinor
        date periodStart "first day of budgeted month"
    }
    SAVINGS_GOAL {
        uuid id PK
        uuid userId FK
        string name
        int targetMinor
        int currentMinor
        date targetDate
    }
    GOAL_CONTRIBUTION {
        uuid id PK
        uuid goalId FK
        int amountMinor
        date contributedOn
    }
    RECEIPT {
        uuid id PK
        uuid userId FK
        uuid transactionId FK "nullable until confirmed"
        string imageUrl
        json extractedData
        float confidenceScore
        enum status "PENDING|CONFIRMED|REJECTED"
    }
    AI_CONVERSATION {
        uuid id PK
        uuid userId FK
        string title
    }
    AI_MESSAGE {
        uuid id PK
        uuid conversationId FK
        enum role "USER|ASSISTANT"
        text content
        json contextSnapshot "aggregates used to ground this answer"
    }
```

## Modeling decisions and why

**Unified `Transaction` table.** Income and expense share one table with a
`type` enum rather than two separate tables. This gives analytics one query
surface (no UNION-ing two tables for a trend chart) and one repository to
test. Category `type` is validated against transaction `type` at the
service layer so an "Groceries" category can never be attached to an
INCOME row.

**Money as `Int`, never `Float`/`Decimal` arithmetic in application code.**
All amounts are minor units (paise for INR, cents for USD). Every arithmetic
operation goes through the `Money` value object
(`apps/api/src/common/money/money.ts`), which throws on cross-currency
operations and rejects non-integer construction — rounding bugs are
structurally prevented, not just avoided by convention.

**Soft delete on `Transaction` (`deletedAt`), never a hard delete.**
Financial records should be recoverable/auditable. Every repository query
filters `deletedAt: null` by default so deleted rows are invisible without
being destroyed.

**`Receipt` is decoupled from `Transaction` until confirmed.** A `Receipt`
starts in `PENDING` with only `extractedData` (raw OCR output) populated.
`transactionId` stays null until the user reviews and confirms — modeling
the actual human-in-the-loop UX rather than assuming OCR output is correct.

**`AiMessage.contextSnapshot` stores the exact aggregated facts used to
generate that answer.** This is what makes AI Coach responses auditable:
you can always answer "why did it say that" by looking at the stored
snapshot, rather than trusting the model's numbers blindly.

**Refresh tokens are persisted (hashed), not just signed JWTs.** This lets
individual sessions be revoked (logout, or a detected compromise) without
needing a blanket secret rotation, and enables true rotation-on-refresh
(each refresh invalidates the previous token).

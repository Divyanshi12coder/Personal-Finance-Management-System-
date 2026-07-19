import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HealthController } from './health/health.controller';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { GoalsModule } from './modules/goals/goals.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { AiCoachModule } from './modules/ai-coach/ai-coach.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    // Default rate limit for the whole API; the AI Coach endpoint overrides
    // this with a stricter limit via @Throttle since LLM calls cost money.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    AnalyticsModule,
    ReceiptsModule,
    AiCoachModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Every route requires auth by default; use @Public() to opt out.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

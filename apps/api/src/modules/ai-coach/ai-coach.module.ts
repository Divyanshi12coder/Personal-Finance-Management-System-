import { Module } from '@nestjs/common';
import { AiCoachController } from './ai-coach.controller';
import { AiCoachService } from './ai-coach.service';
import { FinancialContextBuilder } from './financial-context.builder';
import { AiCoachCacheService } from './cache/ai-coach-cache.service';
import { AnthropicLlmProvider } from './providers/anthropic-llm.provider';
import { LLM_PROVIDER } from './llm.provider';
import { redisProvider } from '../../config/redis.provider';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [AnalyticsModule],
  controllers: [AiCoachController],
  providers: [
    AiCoachService,
    FinancialContextBuilder,
    AiCoachCacheService,
    redisProvider,
    { provide: LLM_PROVIDER, useClass: AnthropicLlmProvider },
  ],
})
export class AiCoachModule {}

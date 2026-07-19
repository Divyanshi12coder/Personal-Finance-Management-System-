import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../config/redis.provider';

/**
 * Caches AI Coach responses in Redis. The cache key is a hash of
 * (userId + question + a hash of the financial snapshot), so:
 *  - Asking the same question twice with unchanged data is instant and free.
 *  - Any new transaction/budget change invalidates relevance automatically
 *    (the snapshot hash changes), without needing explicit cache busting.
 * This is the concrete mechanism behind the architecture doc's promise of
 * "cost control" for LLM calls.
 */
@Injectable()
export class AiCoachCacheService {
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    this.ttlSeconds = this.config.get<number>('AI_COACH_CACHE_TTL_SECONDS') ?? 3600;
  }

  buildKey(userId: string, question: string, context: unknown): string {
    const contextHash = crypto.createHash('sha256').update(JSON.stringify(context)).digest('hex').slice(0, 16);
    const questionHash = crypto.createHash('sha256').update(question.trim().toLowerCase()).digest('hex').slice(0, 16);
    return `ai-coach:${userId}:${questionHash}:${contextHash}`;
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value, 'EX', this.ttlSeconds);
  }
}

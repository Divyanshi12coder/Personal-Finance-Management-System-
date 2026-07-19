import { z } from 'zod';

/**
 * Env vars are validated once at boot via Zod. If required config is
 * missing/malformed, the app fails fast with a clear error instead of
 * surfacing a confusing runtime error later (e.g. mid-request).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_COACH_MODEL: z.string().default('claude-sonnet-4-6'),
  AI_COACH_CACHE_TTL_SECONDS: z.coerce.number().default(3600),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().default('finpilot-receipts'),
  S3_REGION: z.string().default('us-east-1'),
  OCR_PROVIDER: z.enum(['tesseract', 'cloud-vision']).default('tesseract'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DEFAULT_CURRENCY: z.string().default('INR'),
});

export type AppConfig = z.infer<typeof envSchema>;

export default (): AppConfig => envSchema.parse(process.env);

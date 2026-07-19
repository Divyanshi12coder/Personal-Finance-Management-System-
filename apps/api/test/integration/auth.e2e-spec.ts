import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';

/**
 * Integration test: spins up a real Postgres container, runs actual
 * Prisma migrations against it, and exercises the auth module end-to-end
 * through the real HTTP layer (supertest) — validating the full stack
 * (controller -> service -> Prisma -> Postgres), not mocks.
 */
describe('Auth (integration)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    process.env.DATABASE_URL = container.getConnectionUri();
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789';
    process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

    execSync('npx prisma migrate deploy', {
      cwd: __dirname + '/../..',
      env: { ...process.env },
      stdio: 'inherit',
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  }, 60_000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('registers a new user and returns an access token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'jane@example.com', name: 'Jane Doe', password: 'S3curePass!23' })
      .expect(201);

    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('jane@example.com');
  });

  it('rejects registering the same email twice with a 409', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'dup@example.com', name: 'Dup User', password: 'S3curePass!23' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'dup@example.com', name: 'Dup User 2', password: 'S3curePass!23' })
      .expect(409);

    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('logs in with correct credentials and rejects incorrect ones', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'login@example.com', name: 'Login User', password: 'S3curePass!23' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'S3curePass!23' })
      .expect(200);

    const badRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'wrong-password' })
      .expect(401);

    expect(badRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects unauthenticated access to a protected route', async () => {
    await request(app.getHttpServer()).get('/api/v1/transactions').expect(401);
  });
});

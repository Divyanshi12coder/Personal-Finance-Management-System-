import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Structured JSON logging (Pino) replaces the default Nest logger.
  app.useLogger(app.get(Logger));

  app.use(helmet());
  app.use(cookieParser()); // required for reading the httpOnly refresh-token cookie
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');

  // Global validation: strips unknown properties, rejects invalid payloads
  // with a 400 before they ever reach a controller/service.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Every error in the app — Prisma, validation, unexpected — is shaped
  // into one consistent JSON error contract by this filter.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Wraps every successful response in a uniform { success, data, meta } envelope.
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('FinPilot AI API')
    .setDescription('REST API for FinPilot AI — your intelligent financial copilot.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`FinPilot API running on http://localhost:${port}/api/v1`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();

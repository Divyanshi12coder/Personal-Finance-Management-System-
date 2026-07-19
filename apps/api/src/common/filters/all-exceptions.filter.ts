import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Single place where every thrown error in the app — HttpException,
 * Prisma errors, or truly unexpected exceptions — is normalized into
 * one JSON contract. Controllers and services never format error
 * responses themselves; they just throw.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${body.code}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} -> ${status} ${body.code}`);
    }

    response.status(status).json({
      success: false,
      error: body,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolve(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        return {
          status,
          body: {
            code: (r.code as string) ?? HttpStatus[status] ?? 'HTTP_ERROR',
            message: Array.isArray(r.message) ? r.message.join(', ') : ((r.message as string) ?? exception.message),
            details: r.details ?? (Array.isArray(r.message) ? r.message : undefined),
          },
        };
      }
      return { status, body: { code: HttpStatus[status] ?? 'HTTP_ERROR', message: String(res) } };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' },
    };
  }

  private resolvePrismaError(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          body: { code: 'UNIQUE_CONSTRAINT_VIOLATION', message: 'A record with these values already exists.', details: exception.meta },
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          body: { code: 'RECORD_NOT_FOUND', message: 'The requested record was not found.' },
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          body: { code: 'DATABASE_ERROR', message: 'A database error occurred.', details: exception.code },
        };
    }
  }
}

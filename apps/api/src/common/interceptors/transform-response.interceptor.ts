import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Wraps every successful controller return value in a uniform envelope so
 * the frontend never has to branch on response shape per-endpoint.
 * If a handler returns { data, meta } explicitly, meta is hoisted out;
 * otherwise the whole return value becomes `data`.
 */
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          const { data, meta } = result as { data: T; meta: Record<string, unknown> };
          return { success: true, data, meta };
        }
        return { success: true, data: result };
      }),
    );
  }
}

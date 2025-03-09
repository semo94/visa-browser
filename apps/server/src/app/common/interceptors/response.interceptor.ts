import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';

/**
 * Base response structure
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  method: string;
  requestId: string;
}

/**
 * Custom response with explicit message and data
 */
interface CustomResponse<T> {
  message: string;
  data: T;
}

/**
 * Paginated response structure
 */
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<ExpressResponse>();
    const statusCode = response?.statusCode || HttpStatus.OK;
    const requestId = request['requestId'] || 'unknown';

    // For DELETE requests with 204 status, don't transform the response
    if (request.method === 'DELETE' && statusCode === HttpStatus.NO_CONTENT) {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        // Build the common response metadata
        const baseResponse = {
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          requestId,
        };

        // Determine the appropriate response structure based on data type
        if (this.isCustomResponse(data)) {
          return {
            ...baseResponse,
            message: data.message,
            data: data.data,
          };
        }

        if (this.isPaginatedResponse(data)) {
          return {
            ...baseResponse,
            message: 'Success',
            data,
          };
        }

        // Default response structure
        return {
          ...baseResponse,
          message: 'Success',
          data,
        };
      }),
    );
  }

  /**
   * Type guard for custom responses
   */
  private isCustomResponse(data: unknown): data is CustomResponse<T> {
    return data !== null &&
      typeof data === 'object' &&
      'message' in data &&
      'data' in data;
  }

  /**
   * Type guard for paginated responses
   */
  private isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
    return data !== null &&
      typeof data === 'object' &&
      'items' in data &&
      'total' in data;
  }
}
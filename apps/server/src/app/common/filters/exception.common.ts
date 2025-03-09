import { ArgumentsHost, ExceptionFilter, HttpStatus, Request } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../services/logger.service';

/**
 * Common error response structure for all exception filters
 */
export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errorName: string;
  requestId: string;
  errors?: Record<string, string>[];
}

/**
 * Common logging context structure
 */
export interface LogContext {
  requestId: string;
  path: string;
  method: string;
  statusCode: number;
  errorName: string;
  [key: string]: unknown;
}

/**
 * Base exception filter with common functionality
 */
export abstract class BaseExceptionFilter implements ExceptionFilter {
  protected readonly logger: LoggerService;

  constructor(serviceName: string) {
    this.logger = new LoggerService(null, serviceName);
  }

  abstract catch(exception: unknown, host: ArgumentsHost): void;

  /**
   * Creates a standardized error response
   */
  protected createErrorResponse(
    statusCode: number,
    message: string,
    errorName: string,
    request: Request,
    errors?: Record<string, string>[]
  ): ErrorResponse {
    const requestId = request['requestId'] || 'unknown';

    const response: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorName,
      requestId,
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Creates a standardized logging context
   */
  protected createLogContext(
    statusCode: number,
    errorName: string,
    request: Request,
    additionalContext: Record<string, unknown> = {}
  ): LogContext {
    const requestId = request['requestId'] || 'unknown';

    return {
      requestId,
      path: request.url,
      method: request.method,
      statusCode,
      errorName,
      ...additionalContext,
    };
  }

  /**
   * Sanitizes error names to avoid exposing internal details
   */
  protected sanitizeErrorName(name: string): string {
    const safeErrorNames = [
      'BadRequestException',
      'UnauthorizedException',
      'ForbiddenException',
      'NotFoundException',
      'ConflictException',
      'GatewayTimeoutException',
      'InternalServerErrorException',
      'QueryFailedError',
      'EntityNotFoundError',
    ];

    return safeErrorNames.includes(name) ? name : 'ServerException';
  }

  /**
   * Logs errors with appropriate context
   */
  protected logError(
    message: string,
    exception: unknown,
    context: LogContext,
    skipIfNotFound = false
  ): void {
    // Skip logging for 404 errors if specified to reduce noise
    if (skipIfNotFound && context.statusCode === HttpStatus.NOT_FOUND) {
      return;
    }

    this.logger.error(message, exception as Error, context);
  }
}
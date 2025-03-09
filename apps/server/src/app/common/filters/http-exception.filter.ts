import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';
import { BaseExceptionFilter } from './exception.common';

/**
 * Global exception filter that catches all unhandled exceptions
 */
@Injectable()
@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(HttpExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName = 'ServerException';
    let errors: Record<string, string>[] = [];

    // Handle different error types
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      errorName = this.sanitizeErrorName(exception.constructor.name);

      // Handle validation errors from ValidationPipe
      if (this.isValidationErrorResponse(exceptionResponse)) {
        if (Array.isArray(exceptionResponse.message)) {
          errors = this.formatValidationErrors(exceptionResponse.message);
          message = 'Validation failed';
        } else {
          message = String(exceptionResponse.message);
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = 'Bad request';
      }
    } else if (exception instanceof Error) {
      // Generic error handling - don't expose internal error details
      this.logger.error('Unhandled exception', exception,
        this.createLogContext(statusCode, errorName, request));
    } else {
      // Unknown error type
      this.logger.error('Unknown exception type', null, {
        error: String(exception),
        ...this.createLogContext(statusCode, errorName, request),
      });
    }

    // Build error response object
    const errorResponse = this.createErrorResponse(
      statusCode,
      message,
      errorName,
      request,
      errors.length > 0 ? errors : undefined
    );

    // Log all errors except 404s (to reduce noise)
    this.logError(`Request error ${statusCode}`, exception,
      this.createLogContext(statusCode, errorName, request),
      true // Skip logging for 404 errors
    );

    // Send error response
    response.status(statusCode).json(errorResponse);
  }

  /**
   * Type guard for validation error responses
   */
  private isValidationErrorResponse(response: unknown): response is { message: unknown } {
    return typeof response === 'object' &&
      response !== null &&
      'message' in response;
  }

  /**
   * Format validation errors into a consistent structure
   */
  private formatValidationErrors(validationErrors: unknown[]): Record<string, string>[] {
    const errors: Record<string, string>[] = [];

    if (!Array.isArray(validationErrors)) {
      return errors;
    }

    for (const error of validationErrors) {
      if (typeof error === 'string') {
        errors.push({ message: error });
      } else if (this.isValidationError(error)) {
        // Format class-validator ValidationError
        const constraints = error.constraints || {};

        for (const key of Object.keys(constraints)) {
          errors.push({
            field: error.property,
            message: constraints[key],
          });
        }

        // Handle nested validation errors
        if (error.children?.length) {
          errors.push(...this.formatValidationErrors(error.children));
        }
      } else if (this.hasMessageProperty(error)) {
        errors.push({ message: error.message });
      }
    }

    return errors;
  }

  /**
   * Type guard for class-validator ValidationError
   */
  private isValidationError(error: unknown): error is ValidationError {
    return typeof error === 'object' &&
      error !== null &&
      'property' in error &&
      typeof (error as ValidationError).property === 'string';
  }

  /**
   * Type guard for objects with a message property
   */
  private hasMessageProperty(obj: unknown): obj is { message: string } {
    return typeof obj === 'object' &&
      obj !== null &&
      'message' in obj &&
      typeof (obj as { message: unknown }).message === 'string';
  }
}
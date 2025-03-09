import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';
import { BaseExceptionFilter } from './exception.common';
import { Request } from '@nestjs/common';

/**
 * PostgreSQL error codes
 */
enum PostgresErrorCode {
  UNIQUE_VIOLATION = '23505',
  FOREIGN_KEY_VIOLATION = '23503',
  INVALID_TEXT_REPRESENTATION = '22P02',
  DATA_EXCEPTION = '22', // Prefix for all data exceptions
}

/**
 * Exception filter that handles TypeORM specific exceptions.
 */
@Injectable()
@Catch(TypeORMError)
export class DatabaseExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(DatabaseExceptionFilter.name);
  }

  catch(exception: TypeORMError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default error information
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';
    let errorName = 'QueryFailedError';

    // Handle different TypeORM error types
    if (exception instanceof QueryFailedError) {
      const pgError = this.extractPostgresError(exception);

      if (pgError?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry: A record with the same unique identifier already exists';
      }
      else if (pgError?.code === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced record does not exist';
      }
      else if (pgError?.code === PostgresErrorCode.INVALID_TEXT_REPRESENTATION) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid data format';
      }
      else if (pgError?.code?.startsWith(PostgresErrorCode.DATA_EXCEPTION)) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid data value';
      }
      else {
        // Log unhandled database errors (but don't expose details to client)
        this.logger.error('Unhandled database error', exception, {
          pgErrorCode: pgError?.code,
          pgErrorDetail: pgError?.detail,
        });
      }
    }
    else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
      errorName = 'EntityNotFoundError';
    }

    // Create standardized error response
    const errorResponse = this.createErrorResponse(
      status,
      message,
      errorName,
      request
    );

    // Log the error with context
    this.logError('Database operation failed', exception,
      this.createLogContext(status, errorName, request, {
        errorType: exception.constructor.name,
      })
    );

    // Send error response
    response.status(status).json(errorResponse);
  }

  /**
   * Extract Postgres error details from QueryFailedError
   */
  private extractPostgresError(error: QueryFailedError): { code?: string; detail?: string } | undefined {
    // TypeORM doesn't expose Postgres error details with proper typing
    const driverError = error.driverError as { code?: string; detail?: string } | undefined;
    return driverError;
  }
}
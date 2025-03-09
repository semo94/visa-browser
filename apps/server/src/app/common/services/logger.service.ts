import { Injectable, Scope, Inject, Optional } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger, createLogger } from 'winston';
import { Request } from 'express';
import { createLoggerConfig } from '../../config/logger.config';

export interface LogMetadata {
  context?: string;
  requestId?: string;
  [key: string]: unknown; // Allow additional properties with safer 'unknown' type
}

/**
 * Enhanced logger service that wraps Winston logger
 * Provides context awareness and structured logging capabilities
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context?: string;
  private requestId?: string;
  private logger: Logger;

  /**
   * Create a new LoggerService
   * 
   * @param winstonLogger Optional Winston logger. If not provided, a default one will be created.
   * @param context Optional context name (typically the class name)
   */
  constructor(
    @Optional() @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: Logger,
    @Optional() context?: string,
  ) {
    this.context = context;

    if (winstonLogger) {
      this.logger = winstonLogger;
    } else {
      // Create a default logger for use outside of the NestJS DI system
      this.logger = this.createDefaultLogger();
    }
  }

  /**
   * Create a standalone logger with the standard configuration
   * This is used when the service is instantiated outside the NestJS DI system
   */
  private createDefaultLogger(): Logger {
    // Use the same configuration as the NestJS module
    const loggerConfig = createLoggerConfig(this.context);
    return createLogger(loggerConfig);
  }

  /**
   * Set the request context for this logger instance
   * @param request Express request object
   */
  setRequestContext(request: Request): void {
    this.requestId = request['requestId'] || 'unknown';
  }

  /**
   * Create log metadata with context information
   * @param meta Additional metadata to include
   * @returns Structured log metadata
   */
  private createLogMeta(meta?: LogMetadata): LogMetadata {
    return {
      ...(this.context && !this.winstonLogger ? { context: this.context } : {}),
      ...(this.requestId ? { requestId: this.requestId } : {}),
      ...(meta || {}),
    };
  }

  /**
   * Log a debug message
   * @param message Message to log
   * @param meta Additional metadata
   */
  debug(message: string, meta?: LogMetadata): void {
    this.logger.debug(message, this.createLogMeta(meta));
  }

  /**
   * Log an info message
   * @param message Message to log
   * @param meta Additional metadata
   */
  log(message: string, meta?: LogMetadata): void {
    this.logger.info(message, this.createLogMeta(meta));
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param meta Additional metadata
   */
  warn(message: string, meta?: LogMetadata): void {
    this.logger.warn(message, this.createLogMeta(meta));
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param trace Optional error object or stack trace
   * @param meta Additional metadata
   */
  error(message: string, trace?: Error | string, meta?: LogMetadata): void {
    let errorMeta = { ...this.createLogMeta(meta) };

    if (trace) {
      if (trace instanceof Error) {
        errorMeta = {
          ...errorMeta,
          error: {
            name: trace.name,
            message: trace.message,
            stack: trace.stack,
          },
        };
      } else {
        errorMeta.stack = trace;
      }
    }

    this.logger.error(message, errorMeta);
  }

  /**
   * Log a verbose message
   * @param message Message to log
   * @param meta Additional metadata
   */
  verbose(message: string, meta?: LogMetadata): void {
    this.logger.verbose(message, this.createLogMeta(meta));
  }
}
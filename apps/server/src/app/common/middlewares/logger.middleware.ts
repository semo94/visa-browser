import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: LoggerService;

  constructor() {
    this.logger = new LoggerService(null, 'HTTP');
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl: url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Set request context for logger
    this.logger.setRequestContext(request);

    // Create log context for structured logging
    const logContext = {
      ip,
      userAgent,
      method,
      url,
    };

    // Log request
    this.logger.log('Incoming request', logContext);

    // Add response event listener to log after completion
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || 0;
      const responseTime = Date.now() - startTime;

      // Add response data to log context
      const responseContext = {
        ...logContext,
        statusCode,
        contentLength,
        responseTime,
      };

      // Use appropriate log level based on status code
      if (statusCode >= 500) {
        this.logger.error('Request completed with server error', null, responseContext);
      } else if (statusCode >= 400) {
        this.logger.warn('Request completed with client error', responseContext);
      } else {
        this.logger.log('Request completed successfully', responseContext);
      }
    });

    next();
  }
}
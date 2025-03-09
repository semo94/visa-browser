import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to add a unique request ID to each incoming request.
 * This ID will be used for tracing requests through the system and in logs.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    // Check if request already has an ID from upstream services
    const requestId = request.headers['x-request-id'] || uuidv4();
    
    // Add the ID to the request object for use in other parts of the application
    request['requestId'] = requestId;
    
    // Add the ID to response headers for client-side tracing
    response.setHeader('x-request-id', requestId);
    
    next();
  }
}
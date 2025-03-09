import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';

/**
 * Global HTTP error interceptor function
 * @description Intercepts HTTP errors and provides consistent error handling
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const loggingService = inject(LoggingService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client error: ${error.error.message}`;
        loggingService.error('Client-side error', error.error);
      } else {
        // Server-side error
        if (error.status === 0) {
          errorMessage = 'Server is not responding. Please try again later.';
        } else if (error.error && typeof error.error === 'object') {
          // Use server-provided error message if available
          errorMessage = error.error.message || `Server error: ${error.status} ${error.statusText}`;
        } else {
          errorMessage = `Server error: ${error.status} ${error.statusText}`;
        }

        loggingService.error('Server-side error', error, {
          status: error.status,
          statusText: error.statusText,
          url: req.url
        });
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
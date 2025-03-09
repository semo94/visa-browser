import { Injectable, isDevMode } from '@angular/core';

/**
 * Centralized logging service for the application
 * @description Provides methods for consistent logging throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  /**
   * Log an informational message
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  log(message: string, data?: unknown): void {
    if (!isDevMode()) {
      // In production, we might want to send logs to DataDog
      // For now, we'll just suppress console logs in production
      return;
    }

    console.log(`[INFO] ${message}`, data || '');
  }

  /**
   * Log a warning message
   * @param message The warning message
   * @param data Optional data to include with the warning
   */
  warn(message: string, data?: unknown): void {
    console.warn(`[WARNING] ${message}`, data || '');

    // In a real application, we could send warnings to a monitoring service
  }

  /**
   * Log an error message
   * @param message The error message
   * @param error The error object or details
   * @param data Additional contextual data
   */
  error(message: string, error?: unknown, data?: unknown): void {
    console.error(`[ERROR] ${message}`, error || '', data || '');

    // In a real application, we would send errors to an error tracking service
  }
}
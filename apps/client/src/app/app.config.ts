import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Application configuration interface
 * @description Defines the shape of the application configuration
 */
export interface AppConfig {
  /** API base URL */
  apiUrl: string;

  /** Whether the application is running in production mode */
  production: boolean;

  /** Application version */
  version: string;
}

/**
 * Application configuration
 * @description Environment-specific configuration values
 */
export const appConfig: AppConfig = {
  production: !isDevMode(),
  apiUrl: !isDevMode() ? '/api/v1' : 'http://localhost:3000/api/v1',
  version: '1.0.0'
};

/**
 * Application provider configuration
 * @description Configures the application's dependency injection providers
 */
export const appProviders: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([errorInterceptor])
    )
  ]
};
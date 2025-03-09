import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appProviders } from './app/app.config';

/**
 * Bootstrap the Angular application
 * This is the entry point for the Angular application
 */
bootstrapApplication(AppComponent, appProviders)
  .catch(err => console.error('Error bootstrapping application:', err));
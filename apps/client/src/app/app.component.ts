import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { appConfig } from './app.config'; 

/**
 * Root application component
 * @description The main application component that serves as the entry point
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /** Application version from config */
  appVersion = appConfig.version;

  /** Current year for copyright notice */
  currentYear = new Date().getFullYear();
}
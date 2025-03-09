import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideLocationMocks } from '@angular/common/testing';

import { AppComponent } from './app.component';
import { appConfig } from './app.config';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        MatIconModule,
        NoopAnimationsModule,
        AppComponent
      ],
      providers: [
        provideRouter([]),
        provideLocationMocks()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct app version from config', () => {
    expect(component.appVersion).toBe(appConfig.version);
  });

  it('should have the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  describe('Template rendering', () => {
    it('should render the toolbar with logo', () => {
      const toolbar = debugElement.query(By.css('.app-toolbar'));
      const logo = debugElement.query(By.css('.app-logo img'));

      expect(toolbar).toBeTruthy();
      expect(logo).toBeTruthy();
      expect(logo.nativeElement.getAttribute('src')).toBe('sherpa-logo.png');
      expect(logo.nativeElement.getAttribute('alt')).toBe('sherpa°');
    });

    it('should have correct router link on logo', () => {
      const logoLink = debugElement.query(By.css('.app-logo'));
      expect(logoLink.attributes['routerLink']).toBe('/');
    });

    it('should display the app version', () => {
      const versionInfo = debugElement.query(By.css('.version-info'));

      expect(versionInfo).toBeTruthy();
      expect(versionInfo.nativeElement.textContent).toContain(appConfig.version);
    });

    it('should render router outlet', () => {
      const routerOutlet = debugElement.query(By.css('router-outlet'));
      expect(routerOutlet).toBeTruthy();
    });

    it('should render the footer with copyright notice', () => {
      const footer = debugElement.query(By.css('.app-footer'));
      const footerText = footer.nativeElement.textContent;

      expect(footer).toBeTruthy();
      expect(footerText).toContain(`© ${component.currentYear} sherpa°`);
      expect(footerText).toContain('Helping travelers cross borders freely and efficiently');
    });

    it('should interpolate the current year in the footer', () => {
      const footer = debugElement.query(By.css('.footer-content p'));
      const currentYear = new Date().getFullYear();

      expect(footer.nativeElement.textContent).toContain(`© ${currentYear} sherpa°`);
    });
  });
});
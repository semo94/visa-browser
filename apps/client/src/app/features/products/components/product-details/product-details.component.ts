import { Component, OnInit, OnDestroy, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize, catchError, EMPTY } from 'rxjs';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

// Application imports
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

/**
 * Product Details Component
 * @description Displays detailed information about a specific visa product
 */
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    PageHeaderComponent
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  // Inject services
  private productService = inject(ProductService);
  private loggingService = inject(LoggingService);
  private router = inject(Router);
  private location = inject(Location);
  private snackBar = inject(MatSnackBar);

  // Input for the product ID from the route
  id = input.required<string>();

  // State signals
  product = signal<Product | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Cleanup subject
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadProduct();
  }

  /**
   * Load product details from the API
   */
  private loadProduct(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProduct(this.id())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false)),
        catchError(err => {
          this.error.set(err.message || 'Failed to load product');
          this.loggingService.error('Failed to load product details', err, { productId: this.id() });

          this.snackBar.open(err.message, 'Dismiss', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });

          return EMPTY;
        })
      )
      .subscribe(product => {
        this.product.set(product);
        this.loggingService.log('Product details loaded successfully', { productId: this.id() });
      });
  }

  /**
   * Navigate back to the previous page
   */
  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
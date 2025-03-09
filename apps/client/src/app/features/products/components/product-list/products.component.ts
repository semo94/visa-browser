import { Component, OnInit, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

// Material imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Application imports
import { Product, ProductFilter } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

/**
 * Products Component
 * @description Displays a list of visa products with filtering, sorting, and pagination
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    PageHeaderComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  // Inject services
  private productService = inject(ProductService);
  private loggingService = inject(LoggingService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  /** Table columns to display */
  readonly displayedColumns: string[] = [
    'country',
    'visaType',
    'price',
    'lengthOfStay',
    'entryType',
    'filingFee',
    'actions'
  ];

  /** Data source for the Material table */
  dataSource = new MatTableDataSource<Product>([]);

  /** Signal for total number of products (for server-side pagination) */
  totalProducts = signal<number>(0);

  /** Current filter state */
  filterValues: ProductFilter = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  };

  /** Filter form group */
  filterForm: FormGroup;

  /** Loading state signal */
  loading = signal<boolean>(false);

  /** Error state signal */
  error = signal<string | null>(null);

  /** Subject for cleaning up subscriptions on component destruction */
  private destroy$ = new Subject<void>();

  /** Reference to the paginator component */
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /** Reference to the sort component */
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Initialize filter form
    this.filterForm = this.formBuilder.group({
      country: [''],
      visaType: [''],
      entryType: [''],
      minPrice: [null],
      maxPrice: [null],
      minLengthOfStay: [null],
      maxLengthOfStay: [null]
    });
  }

  /**
   * Lifecycle hook - Component initialization
   */
  ngOnInit(): void {
    // Subscribe to filter form changes
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400), // Wait for user to stop typing
        distinctUntilChanged() // Only emit when values change
      )
      .subscribe(values => {
        // Update filter values and reset to first page
        this.filterValues = {
          ...this.filterValues,
          ...values,
          page: 1
        };
        this.loadProducts();
      });

    // Initial data load
    this.loadProducts();
  }

  /**
   * Handle page change events from the paginator
   * @param event The page event from Material paginator
   */
  onPageChange(event: PageEvent): void {
    this.filterValues.page = event.pageIndex + 1;
    this.filterValues.limit = event.pageSize;
    this.loadProducts();
  }

  /**
   * Handle sort change events from the table header
   * @param sort The sort event from Material sort header
   */
  onSortChange(sort: Sort): void {
    // Update sort parameters
    if (sort.direction) {
      this.filterValues.sortBy = sort.active;
      this.filterValues.sortOrder = sort.direction.toUpperCase() as 'ASC' | 'DESC';
    } else {
      // Default sort when direction is cleared
      this.filterValues.sortBy = 'createdAt';
      this.filterValues.sortOrder = 'DESC';
    }
    this.loadProducts();
  }

  /**
   * Reset all filters to their default values
   */
  resetFilters(): void {
    this.filterForm.reset();
    this.filterValues = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };
    this.loadProducts();
  }

  /**
   * View product details
   * @param productId ID of the product to view
   */
  viewProduct(productId: string): void {
    // In a real application, this would navigate to a product details page
    this.snackBar.open(`Viewing product ${productId}`, 'Close', {
      duration: 3000
    });
    this.loggingService.log('Viewing product details', { productId });
  }

  /**
   * Load products from the API based on current filter values
   * @private
   */
  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts(this.filterValues)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.dataSource.data = response.items;
          this.totalProducts.set(response.total);

          // Update paginator if it exists
          if (this.paginator) {
            this.paginator.length = response.total;
            this.paginator.pageIndex = response.page - 1;
            this.paginator.pageSize = response.limit;
          }

          this.loggingService.log('Products loaded successfully', {
            count: response.items.length,
            total: response.total,
            page: response.page
          });
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.snackBar.open(err.message, 'Dismiss', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loggingService.error('Failed to load products', err);
        }
      });
  }

  /**
   * Lifecycle hook - Component destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
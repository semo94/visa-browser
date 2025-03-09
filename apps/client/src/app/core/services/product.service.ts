import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, ApiResponse, PaginatedResponse, ProductFilter } from '../models/product.model';
import { appConfig } from '../../app.config';

/**
 * Service for handling product-related API operations
 * @description Provides methods to interact with the products API endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  /** Base API URL for products */
  private readonly apiUrl = `${appConfig.apiUrl}/products`;

  /**
   * Fetches products with pagination and filtering
   * @param filter Product filter parameters
   * @returns Observable of paginated products
   */
  getProducts(filter: ProductFilter = {}): Observable<PaginatedResponse<Product>> {
    // Build HTTP params from filter object
    let params = new HttpParams();

    // Only add parameters that are defined
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    // Make API request
    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Fetches a single product by ID
   * @param id Product ID to fetch
   * @returns Observable of the requested product
   */
  getProduct(id: string): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }
}
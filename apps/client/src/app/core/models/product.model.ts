/**
 * Represents a visa product in the system
 * @description Model representing visa products available for purchase
 */
export interface Product {
  /** Unique identifier for the product */
  id: string;

  /** Country name */
  country: string;

  /** Visa type (Tourist, Business, Student, etc.) */
  visaType: string;

  /** Price in USD */
  price: number;

  /** Length of stay in days */
  lengthOfStay: number;

  /** Type of entry (Single, Multiple) */
  entryType: string;

  /** Filing fee in USD */
  filingFee: number;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Standard API response wrapper
 * @description Wraps API responses with metadata and the actual data
 */
export interface ApiResponse<T> {
  /** HTTP status code */
  statusCode: number;

  /** Response message */
  message: string;

  /** Actual response data */
  data: T;

  /** Response timestamp */
  timestamp: string;

  /** Request path */
  path: string;

  /** Unique request identifier for tracing */
  requestId?: string;
}

/**
 * Represents a paginated API response
 * @description Contains pagination metadata along with the items
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];

  /** Total number of items available */
  total: number;

  /** Current page number */
  page: number;

  /** Number of items per page */
  limit: number;

  /** Total number of pages available */
  pages: number;
}

/**
 * Query parameters for filtering products
 * @description Parameters that can be used to filter the products list
 */
export interface ProductFilter {
  /** Page number (1-based) */
  page?: number;

  /** Number of items per page */
  limit?: number;

  /** Field to sort by */
  sortBy?: string;

  /** Sort direction */
  sortOrder?: 'ASC' | 'DESC';

  /** Filter by country name (partial match) */
  country?: string;

  /** Filter by visa type (partial match) */
  visaType?: string;

  /** Filter by entry type */
  entryType?: string;

  /** Filter by minimum price */
  minPrice?: number;

  /** Filter by maximum price */
  maxPrice?: number;

  /** Filter by minimum length of stay in days */
  minLengthOfStay?: number;

  /** Filter by maximum length of stay in days */
  maxLengthOfStay?: number;
}
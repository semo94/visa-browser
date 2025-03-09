import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class ProductResponseDto {
  @ApiProperty({ description: 'Unique identifier for the product' })
  id: string;

  @ApiProperty({ description: 'Country name' })
  country: string;

  @ApiProperty({ description: 'Visa type name' })
  visaType: string;

  @ApiProperty({ description: 'Price of the visa in USD' })
  price: number;

  @ApiProperty({ description: 'Length of stay in days' })
  lengthOfStay: number;

  @ApiProperty({ description: 'Type of entry (e.g., Single, Multiple)' })
  entryType: string;

  @ApiProperty({ description: 'Filing fee in USD' })
  filingFee: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  constructor(product: Product) {
    this.id = product.id;
    this.country = product.country;
    this.visaType = product.visaType;
    this.price = Number(product.price);
    this.lengthOfStay = product.lengthOfStay;
    this.entryType = product.entryType;
    this.filingFee = Number(product.filingFee);
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ description: 'List of products', type: [ProductResponseDto] })
  items: ProductResponseDto[];

  @ApiProperty({ description: 'Total number of products' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  pages: number;
}
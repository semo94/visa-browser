import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedProductsResponseDto } from './dto/product-response.dto';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly logger: LoggerService,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating new product`, { dto: createProductDto });

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(queryParams: QueryProductDto): Promise<PaginatedProductsResponseDto> {
    this.logger.log(`Finding products with query params`, { queryParams });

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = queryParams;

    // Build where conditions using TypeORM operators
    const whereConditions = this.buildWhereConditions(queryParams);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute find with TypeORM's find options
    const [items, total] = await this.productRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    this.logger.debug(`Found products`, {
      count: items.length,
      total,
      page,
      limit
    });

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    this.logger.log(`Finding product by ID`, { id });

    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      this.logger.warn(`Product not found`, { id });
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    this.logger.log(`Updating product`, { id, dto: updateProductDto });

    const product = await this.findOne(id);

    // Update the product with the new values
    Object.assign(product, updateProductDto);

    const updatedProduct = await this.productRepository.save(product);
    this.logger.debug(`Product updated successfully`, { id });

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing product`, { id });

    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    this.logger.debug(`Product removed successfully`, { id });
  }

  private buildWhereConditions(queryParams: QueryProductDto): FindOptionsWhere<Product> {
    const whereConditions: FindOptionsWhere<Product> = {};

    if (queryParams.country) {
      whereConditions.country = ILike(`%${queryParams.country}%`);
    }

    if (queryParams.visaType) {
      whereConditions.visaType = ILike(`%${queryParams.visaType}%`);
    }

    if (queryParams.entryType) {
      whereConditions.entryType = ILike(`%${queryParams.entryType}%`);
    }

    // Handle price filtering
    if (queryParams.minPrice !== undefined && queryParams.maxPrice !== undefined) {
      // Both min and max are provided
      whereConditions.price = Between(queryParams.minPrice, queryParams.maxPrice);
    } else if (queryParams.minPrice !== undefined) {
      // Only min is provided
      whereConditions.price = MoreThanOrEqual(queryParams.minPrice);
    } else if (queryParams.maxPrice !== undefined) {
      // Only max is provided
      whereConditions.price = LessThanOrEqual(queryParams.maxPrice);
    }

    if (queryParams.minLengthOfStay) {
      whereConditions.lengthOfStay = MoreThanOrEqual(queryParams.minLengthOfStay);
    }

    if (queryParams.maxLengthOfStay) {
      // Handle case when both min and max are specified
      if (queryParams.minLengthOfStay) {
        whereConditions.lengthOfStay = Between(queryParams.minLengthOfStay, queryParams.maxLengthOfStay);
      } else {
        whereConditions.lengthOfStay = LessThanOrEqual(queryParams.maxLengthOfStay);
      }
    }

    return whereConditions;
  }
}
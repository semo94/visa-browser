import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete, 
  Query, 
  HttpStatus, 
  ParseUUIDPipe,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto, PaginatedProductsResponseDto } from './dto/product-response.dto';
import { Product } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The product has been successfully created.', 
    type: ProductResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data.' 
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(createProductDto);
    return new ProductResponseDto(await this.productsService.findOne(product.id));
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filtering' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns paginated products.', 
    type: PaginatedProductsResponseDto 
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country name' })
  @ApiQuery({ name: 'visaType', required: false, type: String, description: 'Filter by visa type name' })
  @ApiQuery({ name: 'entryType', required: false, type: String, description: 'Filter by entry type name' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Filter by minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Filter by maximum price' })
  @ApiQuery({ name: 'minLengthOfStay', required: false, type: Number, description: 'Filter by minimum length of stay' })
  @ApiQuery({ name: 'maxLengthOfStay', required: false, type: Number, description: 'Filter by maximum length of stay' })
  async findAll(@Query() queryParams: QueryProductDto): Promise<PaginatedProductsResponseDto> {
    const result = await this.productsService.findAll(queryParams);
    
    // Transform the products to response DTOs
    const items = result.items.map(product => new ProductResponseDto(product as Product));
    
    return {
      ...result,
      items,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the product.', 
    type: ProductResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Product not found.' 
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(id);
    return new ProductResponseDto(product);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The product has been successfully updated.', 
    type: ProductResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Product not found.' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data.' 
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, updateProductDto);
    return new ProductResponseDto(await this.productsService.findOne(product.id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'The product has been successfully deleted.' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Product not found.' 
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}
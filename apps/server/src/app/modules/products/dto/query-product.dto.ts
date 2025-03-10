import { IsOptional, IsPositive, IsString, IsInt, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryProductDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Sort field', required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  @IsIn(['country', 'visaType', 'price', 'lengthOfStay', 'entryType', 'filingFee', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort order', required: false, default: 'DESC' })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({ description: 'Filter by country name', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Filter by visa type name', required: false })
  @IsOptional()
  @IsString()
  visaType?: string;

  @ApiProperty({ description: 'Filter by entry type', required: false })
  @IsOptional()
  @IsString()
  entryType?: string;

  @ApiProperty({ description: 'Filter by minimum price', required: false })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Filter by maximum price', required: false })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Filter by minimum length of stay', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  minLengthOfStay?: number;

  @ApiProperty({ description: 'Filter by maximum length of stay', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  maxLengthOfStay?: number;
}
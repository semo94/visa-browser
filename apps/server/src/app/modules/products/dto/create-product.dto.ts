import { IsNotEmpty, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Country name', example: 'USA' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  country: string;

  @ApiProperty({ description: 'Visa type name', example: 'Tourist' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  visaType: string;

  @ApiProperty({ description: 'Price of the visa in USD', example: 160 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Length of stay in days', example: 90 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  lengthOfStay: number;

  @ApiProperty({ description: 'Type of entry (e.g., Single, Multiple)', example: 'Single' })
  @IsNotEmpty()
  @IsString()
  entryType: string;

  @ApiProperty({ description: 'Filing fee in USD', example: 20 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  filingFee: number;
}
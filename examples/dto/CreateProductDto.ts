/**
 * Create Product DTO
 * Example: DTO with validation for creating product
 */

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  barcode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(1)
  category_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;

  @IsNumber()
  @Min(0)
  selling_price: number;

  @IsNumber()
  @Min(0)
  cost_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_stock?: number;
}


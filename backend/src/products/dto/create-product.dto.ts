/**
 * Create Product DTO
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDecimal,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  barcode: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  category_id?: number;

  @IsNumber()
  @IsOptional()
  unit_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  unit_name?: string;

  @IsNumber()
  @Min(0)
  cost_price: number;

  @IsNumber()
  @Min(0)
  selling_price: number;

  @IsString()
  @IsOptional()
  image_url?: string;
}


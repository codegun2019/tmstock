/**
 * Update Product DTO
 * Example: DTO with validation for updating product (partial)
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './CreateProductDto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  active?: number; // 0 = inactive, 1 = active
}


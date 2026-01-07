/**
 * Deduct Stock DTO
 */

import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class DeductStockDto {
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @IsInt()
  @IsNotEmpty()
  branch_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  quantity: number;

  @IsString()
  @IsOptional()
  reference_type?: string; // e.g., 'invoice', 'adjustment'

  @IsInt()
  @IsOptional()
  reference_id?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}


/**
 * Adjust Stock DTO
 */

import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

export class AdjustStockDto {
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @IsInt()
  @IsNotEmpty()
  branch_id: number;

  @IsNumber()
  @IsNotEmpty()
  new_quantity: number; // ⭐ New quantity to set

  @IsString()
  @IsOptional()
  reference_type?: string; // e.g., 'adjustment'

  @IsInt()
  @IsOptional()
  reference_id?: number;

  @IsString()
  @IsNotEmpty()
  reason: string; // ⭐ Required reason for adjustment
}


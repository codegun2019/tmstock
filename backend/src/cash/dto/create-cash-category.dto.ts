/**
 * Create Cash Category DTO
 */

import { IsString, IsNotEmpty, IsIn, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateCashCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['IN', 'OUT', 'BOTH'])
  type: string; // ⭐ 'IN', 'OUT', or 'BOTH'

  @IsInt()
  @IsOptional()
  parent_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}


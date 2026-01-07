/**
 * Create Category DTO
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  parent_id?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  display_order?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  icon?: string;
}


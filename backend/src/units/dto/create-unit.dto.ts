/**
 * Create Unit DTO
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  symbol?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  display_order?: number;
}


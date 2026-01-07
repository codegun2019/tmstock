/**
 * Create Invoice DTO
 */

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  unit_price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount_amount?: number;
}

export class CreateInvoiceDto {
  @IsInt()
  @IsNotEmpty()
  branch_id: number;

  @IsInt()
  @IsOptional()
  ref_employee_id?: number; // ⭐ Employee who made the sale (for commission)

  @IsString()
  @IsOptional()
  @MaxLength(100)
  customer_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  customer_phone?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount_amount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount_percent?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  payment_method?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}


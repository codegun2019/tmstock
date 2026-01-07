/**
 * Create Invoice DTO
 * Example: DTO with validation for creating invoice
 */

import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsNumber()
  @Min(1)
  product_id: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customer_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  customer_phone?: string;

  @IsArray()
  @ArrayMinSize(1) // ⭐ At least 1 item required
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @IsNumber()
  @Min(0)
  paid_amount: number;

  @IsOptional()
  @IsString()
  payment_method?: string; // cash | transfer | bank | e-wallet

  @IsOptional()
  @IsString()
  payment_status?: string; // paid | unpaid

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}


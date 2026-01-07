/**
 * Pay Invoice DTO
 */

import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class PayInvoiceDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  paid_amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  payment_method?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}


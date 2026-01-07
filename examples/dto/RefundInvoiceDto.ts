/**
 * Refund Invoice DTO
 * Example: DTO for refunding invoice
 */

import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';

export class RefundInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string; // ⭐ Required reason for refund

  @IsOptional()
  @IsNumber()
  @Min(0)
  refund_amount?: number; // Optional, default = full amount
}


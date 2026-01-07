/**
 * Refund Invoice DTO
 */

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RefundInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}


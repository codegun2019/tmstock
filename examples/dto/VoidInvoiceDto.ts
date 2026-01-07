/**
 * Void Invoice DTO
 * Example: DTO for voiding invoice
 */

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class VoidInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string; // ⭐ Required reason for voiding
}


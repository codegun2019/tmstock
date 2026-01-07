/**
 * Void Invoice DTO
 */

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class VoidInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}


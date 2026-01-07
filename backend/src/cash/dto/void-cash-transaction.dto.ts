/**
 * Void Cash Transaction DTO
 */

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class VoidCashTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}


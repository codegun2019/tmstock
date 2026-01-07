/**
 * Void Cash Transaction DTO
 * Example: DTO for voiding cash transaction
 */

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class VoidCashTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string; // ⭐ Required reason for voiding
}


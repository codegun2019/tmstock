/**
 * Create Cash Transaction DTO
 * Example: DTO for manual cash transaction entry
 */

import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, PaymentMethod } from '../entities/CashTransaction.entity';

export class CreateCashTransactionDto {
  @IsDate()
  @Type(() => Date)
  txn_date: Date;

  @IsEnum(TransactionType)
  txn_type: TransactionType; // IN or OUT

  @IsNumber()
  @Min(0.01) // ⭐ Minimum amount
  amount: number;

  @IsNumber()
  @Min(1)
  category_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(1)
  branch_id: number;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  // ⭐ Note: ref_type and ref_id are NOT in DTO
  // ⭐ Only BE can set these (for auto-linking)
  // ⭐ Manual entry = ref_type = null, ref_id = null
}


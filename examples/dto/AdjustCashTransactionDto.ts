/**
 * Adjust Cash Transaction DTO
 * Example: DTO for adjusting cash transaction (creates new record)
 */

import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, PaymentMethod } from '../entities/CashTransaction.entity';

export class AdjustCashTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  original_transaction_id: number; // ⭐ Reference to original

  @IsDate()
  @Type(() => Date)
  txn_date: Date;

  @IsEnum(TransactionType)
  txn_type: TransactionType; // IN or OUT

  @IsNumber()
  @Min(0.01)
  amount: number; // ⭐ Adjusted amount

  @IsNumber()
  @Min(1)
  category_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @Min(1)
  branch_id: number;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string; // ⭐ Required reason for adjustment
}


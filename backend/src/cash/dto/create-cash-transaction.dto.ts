/**
 * Create Cash Transaction DTO (Manual Entry)
 */

import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateCashTransactionDto {
  @IsDateString()
  @IsNotEmpty()
  txn_date: string; // ⭐ Transaction date (YYYY-MM-DD)

  @IsString()
  @IsNotEmpty()
  @IsIn(['IN', 'OUT'])
  txn_type: string; // ⭐ 'IN' or 'OUT'

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @IsInt()
  @IsOptional()
  category_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @IsNotEmpty()
  branch_id: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  payment_method?: string; // ⭐ 'cash', 'transfer', 'bank', 'e-wallet'

  // ⭐ Note: ref_type and ref_id are NOT included for manual entries
  // They are only set by system when auto-creating from invoices, payroll, etc.
}


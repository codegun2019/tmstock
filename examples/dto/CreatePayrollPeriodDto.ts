/**
 * Create Payroll Period DTO
 * Example: DTO for creating payroll period
 */

import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayrollPeriodDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  period_month: number; // 1-12

  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  @Max(3000)
  period_year: number;

  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @Type(() => Date)
  end_date: Date;
}


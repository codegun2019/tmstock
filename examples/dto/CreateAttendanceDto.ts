/**
 * Create Attendance DTO
 * Example: DTO for check-in/check-out
 */

import {
  IsNumber,
  IsOptional,
  IsDate,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckInDto {
  @IsNumber()
  @Min(1)
  employee_id: number;

  @IsNumber()
  @Min(1)
  branch_id: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  work_date?: Date; // Optional, default = today

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  check_in?: Date; // Optional, default = now

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CheckOutDto {
  @IsNumber()
  @Min(1)
  employee_id: number;

  @IsDate()
  @Type(() => Date)
  work_date: Date; // Required

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  check_out?: Date; // Optional, default = now

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}


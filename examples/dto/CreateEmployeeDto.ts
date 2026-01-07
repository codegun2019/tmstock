/**
 * Create Employee DTO
 * Example: DTO with validation for creating employee
 */

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  IsEnum,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType, SalaryType } from '../entities/Employee.entity';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  employee_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsNumber()
  @Min(1)
  position_id: number;

  @IsNumber()
  @Min(1)
  branch_id: number;

  @IsEnum(EmploymentType)
  employment_type: EmploymentType;

  @IsEnum(SalaryType)
  salary_type: SalaryType;

  @IsNumber()
  @Min(0)
  base_salary: number;

  @IsDate()
  @Type(() => Date)
  hire_date: Date;
}


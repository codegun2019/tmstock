/**
 * Register DTO
 */

import { IsString, IsNotEmpty, IsEmail, MinLength, IsInt } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsInt()
  @IsNotEmpty()
  branch_id: number;
}


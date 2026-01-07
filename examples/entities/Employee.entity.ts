/**
 * Employee Entity
 * Example: Employee entity for HR system
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Branch } from './Branch.entity';
import { EmployeePosition } from './EmployeePosition.entity';

export enum EmploymentType {
  FULLTIME = 'fulltime',
  PARTTIME = 'parttime',
  DAILY = 'daily',
}

export enum SalaryType {
  MONTHLY = 'monthly',
  DAILY = 'daily',
  HOURLY = 'hourly',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  RESIGNED = 'resigned',
  SUSPENDED = 'suspended',
}

@Entity('employees')
@Index(['employee_code'], { unique: true })
@Index(['branch_id'])
@Index(['position_id'])
@Index(['status'])
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  employee_code: string; // ⭐ Unique employee code

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'int' })
  position_id: number;

  @ManyToOne(() => EmployeePosition)
  position: EmployeePosition;

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULLTIME })
  employment_type: EmploymentType;

  @Column({ type: 'enum', enum: SalaryType, default: SalaryType.MONTHLY })
  salary_type: SalaryType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_salary: number; // ⭐ Base salary (not actual salary)

  @Column({ type: 'date' })
  hire_date: Date;

  @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


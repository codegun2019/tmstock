/**
 * Payroll Adjustment Entity
 * Example: Payroll adjustments (allowance/deduction)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { PayrollPeriod } from './PayrollPeriod.entity';
import { Employee } from './Employee.entity';
import { User } from './User.entity';

export enum AdjustmentType {
  ALLOWANCE = 'allowance', // เพิ่ม
  DEDUCTION = 'deduction', // หัก
}

@Entity('payroll_adjustments')
@Index(['employee_id', 'payroll_period_id'])
@Index(['type'])
export class PayrollAdjustment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Employee)
  employee: Employee;

  @Column({ type: 'int' })
  payroll_period_id: number;

  @ManyToOne(() => PayrollPeriod)
  payroll_period: PayrollPeriod;

  @Column({ type: 'enum', enum: AdjustmentType })
  type: AdjustmentType; // allowance or deduction

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 500 })
  reason: string; // ⭐ Required reason

  @Column({ type: 'int' })
  created_by: number;

  @ManyToOne(() => User)
  creator: User;

  @CreateDateColumn()
  created_at: Date;
}


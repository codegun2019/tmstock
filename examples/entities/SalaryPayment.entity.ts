/**
 * Salary Payment Entity
 * Example: Salary payment records
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

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  CHEQUE = 'cheque',
}

@Entity('salary_payments')
@Index(['payroll_period_id'])
@Index(['employee_id'])
@Index(['payment_date'])
export class SalaryPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  payroll_period_id: number;

  @ManyToOne(() => PayrollPeriod)
  payroll_period: PayrollPeriod;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Employee)
  employee: Employee;

  @Column({ type: 'date' })
  payment_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // ⭐ Amount paid (may differ from net_salary if partial)

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.TRANSFER })
  payment_method: PaymentMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ref_no: string; // ⭐ Reference number (cheque, transfer)

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int' })
  paid_by: number; // ⭐ User who made the payment

  @ManyToOne(() => User)
  payer: User;

  @CreateDateColumn()
  created_at: Date;
}


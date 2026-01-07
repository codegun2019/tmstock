/**
 * Payroll Item Entity
 * Example: Payroll item (salary for each employee per period)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { PayrollPeriod } from './PayrollPeriod.entity';
import { Employee } from './Employee.entity';

@Entity('payroll_items')
@Unique(['payroll_period_id', 'employee_id']) // ⭐ 1 item per employee per period
@Index(['payroll_period_id'])
@Index(['employee_id'])
export class PayrollItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  payroll_period_id: number;

  @ManyToOne(() => PayrollPeriod, (period) => period.payroll_items)
  payroll_period: PayrollPeriod;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Employee)
  employee: Employee;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_salary: number; // ⭐ Snapshot from employees.base_salary

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime_amount: number; // ⭐ ค่าล่วงเวลา

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission_amount: number; // ⭐ คอมมิชชั่น

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowance_amount: number; // ⭐ เบี้ยเลี้ยง/โบนัส

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deduction_amount: number; // ⭐ หัก (ขาดงาน, ค่าปรับ)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  net_salary: number; // ⭐ เงินเดือนสุทธิ

  @CreateDateColumn()
  calculated_at: Date;
}


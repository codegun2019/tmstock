/**
 * Payroll Period Entity
 * Example: Payroll period for salary calculation
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './User.entity';
import { PayrollItem } from './PayrollItem.entity';

export enum PayrollPeriodStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  PAID = 'paid',
  LOCKED = 'locked',
}

@Entity('payroll_periods')
@Unique(['period_month', 'period_year']) // ⭐ 1 period per month per year
@Index(['status'])
@Index(['start_date', 'end_date'])
export class PayrollPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  period_month: number; // 1-12

  @Column({ type: 'int' })
  period_year: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'enum', enum: PayrollPeriodStatus, default: PayrollPeriodStatus.DRAFT })
  status: PayrollPeriodStatus;

  @Column({ type: 'datetime', nullable: true })
  calculated_at: Date;

  @Column({ type: 'int', nullable: true })
  calculated_by: number;

  @ManyToOne(() => User, { nullable: true })
  calculator: User;

  @Column({ type: 'datetime', nullable: true })
  locked_at: Date;

  @Column({ type: 'int', nullable: true })
  locked_by: number;

  @ManyToOne(() => User, { nullable: true })
  locker: User;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => PayrollItem, (item) => item.payroll_period)
  payroll_items: PayrollItem[];
}


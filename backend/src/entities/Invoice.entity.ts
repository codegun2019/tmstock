/**
 * Invoice Entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Branch } from './Branch.entity';
import { User } from './User.entity';
import { InvoiceItem } from './InvoiceItem.entity';

@Entity('invoices')
@Index(['invoice_no'], { unique: true })
@Index(['branch_id'])
@Index(['user_id'])
@Index(['status'])
@Index(['ref_employee_id'])
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoice_no: string; // ⭐ Invoice number (e.g., "BKK-20250115-0001")

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'int' })
  user_id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'int', nullable: true })
  ref_employee_id: number; // ⭐ Employee who made the sale (for commission)

  @Column({ type: 'varchar', length: 100, nullable: true })
  customer_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customer_phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount_percent: number; // ⭐ Discount percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number; // ⭐ Tax amount

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paid_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  change_amount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method: string; // ⭐ 'cash', 'card', 'transfer', etc.

  @Column({ type: 'json', nullable: true })
  payment_details: any; // ⭐ Payment details (multiple payments)

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string; // ⭐ 'draft', 'completed', 'void', 'refunded' (matches database VARCHAR)

  @Column({ type: 'text', nullable: true })
  void_reason: string; // ⭐ Reason for void

  @Column({ type: 'text', nullable: true })
  refund_reason: string; // ⭐ Reason for refund

  @Column({ type: 'int', nullable: true })
  voided_by: number; // ⭐ User who voided

  @ManyToOne(() => User, { nullable: true })
  voider: User;

  @Column({ type: 'datetime', nullable: true })
  voided_at: Date; // ⭐ Void timestamp

  @Column({ type: 'int', nullable: true })
  refunded_by: number; // ⭐ User who refunded

  @ManyToOne(() => User, { nullable: true })
  refunder: User;

  @Column({ type: 'datetime', nullable: true })
  refunded_at: Date; // ⭐ Refund timestamp

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}


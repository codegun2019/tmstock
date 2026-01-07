/**
 * Invoice Sequence Entity
 * Example: Invoice number sequence (daily per branch)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Branch } from './Branch.entity';

@Entity('invoice_sequences')
@Unique(['branch_id', 'date']) // ⭐ 1 sequence per branch per day
@Index(['branch_id'])
@Index(['date'])
export class InvoiceSequence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'date' })
  date: Date; // ⭐ Date for sequence (YYYY-MM-DD)

  @Column({ type: 'int', default: 0 })
  sequence: number; // ⭐ Current sequence number

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


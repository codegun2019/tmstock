/**
 * Cash Transaction Entity
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
import { CashCategory } from './CashCategory.entity';
import { Branch } from './Branch.entity';
import { User } from './User.entity';

@Entity('cash_transactions')
@Index(['txn_date'])
@Index(['txn_type'])
@Index(['branch_id'])
@Index(['reference_type', 'reference_id']) // ⭐ For linking to source documents
@Index(['status'])
export class CashTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  txn_date: Date; // ⭐ Transaction date

  @Column({ type: 'varchar', length: 10 })
  txn_type: string; // ⭐ 'IN' or 'OUT'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'int', nullable: true })
  category_id: number;

  @ManyToOne(() => CashCategory, { nullable: true })
  category: CashCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reference_type: string; // ⭐ 'POS', 'PAYROLL', 'REPAIR', 'MANUAL', 'STOCK', etc.

  @Column({ type: 'int', nullable: true })
  reference_id: number; // ⭐ ID from source document

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method: string; // ⭐ 'cash', 'transfer', 'bank', 'e-wallet'

  @Column({ type: 'varchar', length: 20, default: 'confirmed' })
  status: string; // ⭐ 'draft', 'confirmed', 'void'

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @ManyToOne(() => User, { nullable: true })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


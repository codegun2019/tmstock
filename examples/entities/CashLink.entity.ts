/**
 * Cash Link Entity (Optional)
 * Example: Links cash transactions to multiple source documents
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
import { CashTransaction } from './CashTransaction.entity';

@Entity('cash_links')
@Unique(['cash_transaction_id', 'reference_type', 'reference_id'])
@Index(['cash_transaction_id'])
@Index(['reference_type', 'reference_id'])
export class CashLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cash_transaction_id: number;

  @ManyToOne(() => CashTransaction, (transaction) => transaction.links, { onDelete: 'CASCADE' })
  cash_transaction: CashTransaction;

  @Column({ type: 'varchar', length: 50 })
  reference_type: string; // ⭐ POS | PAYROLL | REPAIR | etc.

  @Column({ type: 'int' })
  reference_id: number; // ⭐ ID from source document

  @CreateDateColumn()
  created_at: Date;
}


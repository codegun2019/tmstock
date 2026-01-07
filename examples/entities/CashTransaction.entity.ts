/**
 * Cash Transaction Entity
 * Example: Cash transaction for Money Ledger
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
import { CashCategory } from './CashCategory.entity';
import { CashLink } from './CashLink.entity';

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  BANK = 'bank',
  E_WALLET = 'e-wallet',
}

export enum TransactionStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  VOID = 'void',
}

@Entity('cash_transactions')
@Index(['branch_id'])
@Index(['txn_date'])
@Index(['txn_type'])
@Index(['category_id'])
@Index(['reference_type', 'reference_id']) // ⭐ For linking to source documents
@Index(['status'])
export class CashTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  txn_date: Date; // ⭐ Transaction date (may differ from created_at)

  @Column({ type: 'enum', enum: TransactionType })
  txn_type: TransactionType; // IN or OUT

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'int' })
  category_id: number;

  @ManyToOne(() => CashCategory)
  category: CashCategory;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reference_type: string; // ⭐ POS | PAYROLL | REPAIR | MANUAL | STOCK | GRN | etc.

  @Column({ type: 'int', nullable: true })
  reference_id: number; // ⭐ ID from source document

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.CONFIRMED })
  status: TransactionStatus;

  @Column({ type: 'int' })
  created_by: number;

  @ManyToOne(() => User)
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => CashLink, (link) => link.cash_transaction)
  links: CashLink[];
}


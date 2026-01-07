/**
 * Stock Movement Entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './Product.entity';
import { Branch } from './Branch.entity';
import { User } from './User.entity';

@Entity('stock_moves') // ⭐ Table name is 'stock_moves' not 'stock_movements'
@Index(['product_id'])
@Index(['branch_id'])
@Index(['reference_type', 'reference_id']) // ⭐ For linking to source documents
@Index(['move_type'])
@Index(['created_at'])
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'varchar', length: 20 })
  move_type: string; // ⭐ 'sale', 'receive', 'adjust', 'transfer_in', 'transfer_out', 'return'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number; // ⭐ Positive = IN, negative = OUT

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_before: number; // ⭐ Stock balance before this movement

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_after: number; // ⭐ Stock balance after this movement

  @Column({ type: 'varchar', length: 50, nullable: true })
  reference_type: string; // ⭐ 'invoice', 'adjustment', 'transfer', 'grn', etc.

  @Column({ type: 'int', nullable: true })
  reference_id: number; // ⭐ ID from source document

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string; // ⭐ Reason for movement

  @Column({ type: 'int', nullable: true })
  approved_by: number; // ⭐ User who approved (if requires approval)

  @ManyToOne(() => User, { nullable: true })
  approver: User;

  @Column({ type: 'datetime', nullable: true })
  approved_at: Date; // ⭐ Approval timestamp

  @Column({ type: 'int', nullable: true })
  created_by: number; // ⭐ User who created the move

  @ManyToOne(() => User, { nullable: true })
  creator: User;

  @CreateDateColumn()
  created_at: Date;
}


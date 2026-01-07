/**
 * Stock Balance Entity
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
  Generated,
} from 'typeorm';
import { Product } from './Product.entity';
import { Branch } from './Branch.entity';

@Entity('stock_balances')
@Unique(['product_id', 'branch_id']) // ⭐ Unique constraint for product + branch
@Index(['product_id'])
@Index(['branch_id'])
export class StockBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, (product) => product.stock_balances)
  product: Product;

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number; // ⭐ Current stock quantity

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reserved_quantity: number; // ⭐ Reserved quantity (for pending orders)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Generated('increment') // ⭐ GENERATED ALWAYS AS (quantity - reserved_quantity) STORED
  available_quantity: number; // ⭐ Available quantity (computed: quantity - reserved_quantity)

  @Column({ type: 'datetime', nullable: true })
  last_moved_at: Date; // ⭐ Last stock movement timestamp

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


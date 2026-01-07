/**
 * Product Entity
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
import { Category } from './Category.entity';
import { Unit } from './Unit.entity';
import { StockBalance } from './StockBalance.entity';
import { StockMovement } from './StockMovement.entity';

@Entity('products')
@Index(['barcode'], { unique: true })
@Index(['sku'], { unique: true, where: 'sku IS NOT NULL' })
@Index(['name'])
@Index(['category_id'])
@Index(['active'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  barcode: string; // ⭐ UNIQUE - ใช้สำหรับสแกนใน POS

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  sku: string; // ⭐ SKU code (UNIQUE if provided)

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  category_id: number;

  @ManyToOne(() => Category, { nullable: true })
  category: Category;

  @Column({ type: 'int', nullable: true })
  unit_id: number;

  @ManyToOne(() => Unit, { nullable: true })
  unit: Unit;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit_name: string; // ⭐ Legacy: unit name as string (if unit_id is null)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost_price: number; // ⭐ ราคาทุน

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  selling_price: number; // ⭐ ราคาขาย

  @Column({ type: 'tinyint', default: 1 })
  active: number; // 1 = active, 0 = inactive

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string; // ⭐ Legacy: single image URL

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => StockBalance, (balance) => balance.product)
  stock_balances: StockBalance[];

  @OneToMany(() => StockMovement, (movement) => movement.product)
  stock_movements: StockMovement[];
}


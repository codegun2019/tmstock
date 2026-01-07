/**
 * Product Entity
 * Example: Product entity with relationships
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
import { Branch } from './Branch.entity';
import { InvoiceItem } from './InvoiceItem.entity';
import { StockBalance } from './StockBalance.entity';
import { ProductMedia } from './ProductMedia.entity';

@Entity('products')
@Index(['barcode'], { unique: true })
@Index(['active'])
@Index(['category_id'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  barcode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  category_id: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @Column({ type: 'varchar', length: 50, default: 'ชิ้น' })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  selling_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost_price: number;

  @Column({ type: 'tinyint', default: 1 })
  active: number; // 1 = active, 0 = inactive

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => InvoiceItem, (item) => item.product)
  invoice_items: InvoiceItem[];

  @OneToMany(() => StockBalance, (balance) => balance.product)
  stock_balances: StockBalance[];

  @OneToMany(() => ProductMedia, (media) => media.product)
  media: ProductMedia[];
}


/**
 * Invoice Item Entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Invoice } from './Invoice.entity';
import { Product } from './Product.entity';

@Entity('invoice_items')
@Index(['invoice_id'])
@Index(['product_id'])
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  invoice_id: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'varchar', length: 255 })
  product_name: string; // ⭐ Snapshot - Product name at time of sale

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string; // ⭐ Snapshot - Barcode at time of sale

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number; // ⭐ Unit price at time of sale

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number; // ⭐ Discount amount for this item

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // ⭐ Subtotal (quantity * unit_price - discount)

  @CreateDateColumn()
  created_at: Date;
}


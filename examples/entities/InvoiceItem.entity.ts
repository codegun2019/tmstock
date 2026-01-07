/**
 * Invoice Item Entity
 * Example: Invoice item entity
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

  @ManyToOne(() => Invoice, (invoice) => invoice.items)
  invoice: Invoice;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'varchar', length: 255 })
  product_name: string; // ⭐ Snapshot

  @Column({ type: 'varchar', length: 100 })
  barcode: string; // ⭐ Snapshot

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @CreateDateColumn()
  created_at: Date;
}


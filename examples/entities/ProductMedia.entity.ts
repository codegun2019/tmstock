/**
 * Product Media Entity
 * Example: Product images/media
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
import { Product } from './Product.entity';

@Entity('product_media')
@Index(['product_id'])
@Index(['is_primary'])
export class ProductMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'varchar', length: 255 })
  file_path: string; // ⭐ Path to media file

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mime_type: string; // ⭐ image/jpeg, image/png, etc.

  @Column({ type: 'int', nullable: true })
  file_size: number; // ⭐ Size in bytes

  @Column({ type: 'tinyint', default: 0 })
  is_primary: number; // ⭐ 1 = primary image, 0 = not primary

  @Column({ type: 'int', default: 0 })
  sort_order: number; // ⭐ For ordering images

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


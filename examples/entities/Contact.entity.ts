/**
 * Contact Entity
 * Example: Customer/Supplier entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ContactType {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  BOTH = 'both',
}

@Entity('contacts')
@Index(['tax_id'], { unique: true, where: 'tax_id IS NOT NULL' })
@Index(['phone'])
@Index(['type'])
@Index(['active'])
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ContactType, default: ContactType.CUSTOMER })
  type: ContactType; // customer, supplier, or both

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  tax_id: string; // ⭐ Tax ID (unique if provided)

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_limit: number; // ⭐ Credit limit for customers

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number; // ⭐ Current balance (positive = credit, negative = debit)

  @Column({ type: 'tinyint', default: 1 })
  active: number; // 1 = active, 0 = inactive

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


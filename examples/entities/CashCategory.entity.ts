/**
 * Cash Category Entity
 * Example: Cash category entity for Money Ledger
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum CategoryType {
  IN = 'IN',
  OUT = 'OUT',
  BOTH = 'BOTH',
}

@Entity('cash_categories')
@Index(['name'], { unique: true })
@Index(['type'])
@Index(['active'])
export class CashCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: CategoryType })
  type: CategoryType; // IN, OUT, or BOTH

  @Column({ type: 'int', nullable: true })
  parent_id: number; // ⭐ For sub-categories

  @ManyToOne(() => CashCategory, (category) => category.children, { nullable: true })
  parent: CashCategory;

  @OneToMany(() => CashCategory, (category) => category.parent)
  children: CashCategory[];

  @Column({ type: 'tinyint', default: 1 })
  active: number; // 1 = active, 0 = inactive

  @CreateDateColumn()
  created_at: Date;
}


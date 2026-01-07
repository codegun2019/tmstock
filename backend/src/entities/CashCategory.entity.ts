/**
 * Cash Category Entity
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

@Entity('cash_categories')
@Index(['name'])
@Index(['type'])
@Index(['active'])
export class CashCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // ⭐ 'IN', 'OUT', 'BOTH'

  @Column({ type: 'int', nullable: true })
  parent_id: number; // ⭐ For subcategories

  @ManyToOne(() => CashCategory, (category) => category.children, { nullable: true })
  parent: CashCategory;

  @OneToMany(() => CashCategory, (category) => category.parent)
  children: CashCategory[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'tinyint', default: 1 })
  active: number; // 1 = active, 0 = inactive

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


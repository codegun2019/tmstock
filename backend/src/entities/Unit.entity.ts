/**
 * Unit Entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('units')
@Index(['name'], { unique: true })
@Index(['active', 'display_order'])
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // e.g., "ชิ้น", "กล่อง", "ลัง"

  @Column({ type: 'varchar', length: 20, nullable: true })
  symbol: string; // e.g., "pcs", "box", "carton"

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'tinyint', default: 1 })
  active: number; // 1 = active, 0 = inactive

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


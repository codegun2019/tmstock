/**
 * Feature Toggle Entity
 * Example: Feature flags for enabling/disabling features
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ScopeType {
  GLOBAL = 'global',
  BRANCH = 'branch',
  USER = 'user',
}

@Entity('feature_toggles')
@Index(['key', 'scope_type', 'scope_id'], { unique: true })
@Index(['key'])
@Index(['enabled'])
export class FeatureToggle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  key: string; // ⭐ Feature key (e.g., "pos.sale", "product.quick_create")

  @Column({ type: 'enum', enum: ScopeType, default: ScopeType.GLOBAL })
  scope_type: ScopeType; // ⭐ global, branch, or user

  @Column({ type: 'int', nullable: true })
  scope_id: number; // ⭐ Branch ID or User ID (if scope_type is not global)

  @Column({ type: 'tinyint', default: 1 })
  enabled: number; // ⭐ 1 = enabled, 0 = disabled

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


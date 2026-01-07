/**
 * Audit Log Entity
 * Example: Audit trail for all system actions
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { Branch } from './Branch.entity';

@Entity('audit_logs')
@Index(['actor_user_id'])
@Index(['entity_type', 'entity_id'])
@Index(['action'])
@Index(['created_at'])
@Index(['branch_id'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  actor_user_id: number; // ⭐ User who performed the action

  @ManyToOne(() => User)
  actor: User;

  @Column({ type: 'varchar', length: 50 })
  action: string; // ⭐ create, update, delete, void, refund, etc.

  @Column({ type: 'varchar', length: 50 })
  entity_type: string; // ⭐ invoice, product, employee, cash_transaction, etc.

  @Column({ type: 'int', nullable: true })
  entity_id: number; // ⭐ ID of the entity

  @Column({ type: 'json', nullable: true })
  before_data: any; // ⭐ Data before change (JSON)

  @Column({ type: 'json', nullable: true })
  after_data: any; // ⭐ Data after change (JSON)

  @Column({ type: 'int', nullable: true })
  branch_id: number; // ⭐ Branch context

  @ManyToOne(() => Branch, { nullable: true })
  branch: Branch;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}


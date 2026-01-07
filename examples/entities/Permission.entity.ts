/**
 * Permission Entity
 * Example: Permission entity for RBAC
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Role } from './Role.entity';
import { RolePermission } from './RolePermission.entity';

@Entity('permissions')
@Index(['key'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string; // ⭐ e.g., "product.read", "pos.sale"

  @Column({ type: 'varchar', length: 100 })
  label: string; // ⭐ Display name in Thai

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  role_permissions: RolePermission[];
}


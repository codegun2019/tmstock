/**
 * Role Permission Entity (Join Table)
 */

import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Role } from './Role.entity';
import { Permission } from './Permission.entity';

@Entity('role_permissions')
@Index(['role_id', 'permission_id'], { unique: true })
@Index(['role_id'])
@Index(['permission_id'])
export class RolePermission {
  @PrimaryColumn({ type: 'int' })
  role_id: number;

  @PrimaryColumn({ type: 'int' })
  permission_id: number;

  @ManyToOne(() => Role, (role) => role.role_permissions)
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.role_permissions)
  permission: Permission;

  @CreateDateColumn()
  created_at: Date;
}


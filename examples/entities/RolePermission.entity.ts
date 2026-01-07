/**
 * Role Permission Entity (Join Table)
 * Example: Many-to-many relationship between roles and permissions
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
export class RolePermission {
  @PrimaryColumn({ type: 'int' })
  role_id: number;

  @PrimaryColumn({ type: 'int' })
  permission_id: number;

  @ManyToOne(() => Role, (role) => role.permissions)
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.roles)
  permission: Permission;

  @CreateDateColumn()
  created_at: Date;
}


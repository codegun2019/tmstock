/**
 * Role Entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Permission } from './Permission.entity';
import { User } from './User.entity';
import { UserRole } from './UserRole.entity';
import { RolePermission } from './RolePermission.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  user_roles: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  role_permissions: RolePermission[];
}


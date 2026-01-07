/**
 * User Role Entity (Join Table)
 * Example: Many-to-many relationship between users and roles
 */

import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { Role } from './Role.entity';

@Entity('user_roles')
@Index(['user_id', 'role_id'], { unique: true })
@Index(['user_id'])
@Index(['role_id'])
export class UserRole {
  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @PrimaryColumn({ type: 'int' })
  role_id: number;

  @ManyToOne(() => User, (user) => user.roles)
  user: User;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @CreateDateColumn()
  created_at: Date;
}


/**
 * Login Attempt Entity
 * Example: Login attempt tracking for rate limiting
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('login_attempts')
@Index(['username', 'attempted_at'])
@Index(['ip_address', 'attempted_at'])
@Index(['attempted_at'])
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  username: string; // ⭐ Username attempted

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string; // ⭐ IP address

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  attempted_at: Date; // ⭐ When the attempt was made
}


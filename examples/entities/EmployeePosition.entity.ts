/**
 * Employee Position Entity
 * Example: Employee position entity for HR system
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from './Employee.entity';

@Entity('employee_positions')
@Index(['name'], { unique: true })
export class EmployeePosition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Employee, (employee) => employee.position)
  employees: Employee[];
}


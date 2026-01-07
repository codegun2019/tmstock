/**
 * Attendance Entity
 * Example: Employee attendance (check-in/check-out)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Employee } from './Employee.entity';
import { Branch } from './Branch.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  LATE = 'late',
  ABSENT = 'absent',
  LEAVE = 'leave',
}

@Entity('attendance')
@Unique(['employee_id', 'work_date']) // ⭐ 1 record per employee per day
@Index(['employee_id'])
@Index(['branch_id'])
@Index(['work_date'])
@Index(['status'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => Employee)
  employee: Employee;

  @Column({ type: 'int' })
  branch_id: number;

  @ManyToOne(() => Branch)
  branch: Branch;

  @Column({ type: 'date' })
  work_date: Date;

  @Column({ type: 'datetime', nullable: true })
  check_in: Date;

  @Column({ type: 'datetime', nullable: true })
  check_out: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  work_hours: number; // ⭐ Calculated from check_in and check_out

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

